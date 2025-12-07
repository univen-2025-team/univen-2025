import { useState, useRef } from 'react'
import { ChatMessage, SuggestionMessage } from '../types'
import { FeatureInstruction } from '@/features/types/features'
import { useAppSelector } from '@/lib/store/hooks'
import { selectUser } from '@/lib/store/authSlice'
import {
  getAgentApiUrl,
  createDefaultUiEffects,
  buildConversationHistory,
  fetchUserProfile,
  buildChatRequest,
  sendChatMessage,
  createFallbackResponse,
  parseChatResponse,
  type ChatApiResponse,
} from '../../services/chatService'

const AGENT_API = getAgentApiUrl()

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    text: "Xin chào! Tôi là trợ lý ảo, tôi có thể giúp bạn thực hiện giao dịch, truy vấn thị trường, bạn có thể hỏi tôi bất kỳ điều gì liên quan đến chứng khoán!",
    createdAt: '09:00 AM',
  },
]

const defaultSuggestions: SuggestionMessage[] = [
  { text: 'Tin tức thị trường', icon: '📰' },
  { text: 'Mua MWG', icon: '💹' },
  { text: 'Chi tiết VCB', icon: '📊' },
  { text: 'Top cổ phiếu hôm nay', icon: '📈' },
]

export type UseChatOptions = {
  onUiEffects?: (effects: FeatureInstruction[]) => void
}

export type UseChatReturn = {
  messages: ChatMessage[]
  isLoading: boolean
  hasComponentLoaded: boolean
  suggestions: SuggestionMessage[]
  handleSendMessage: (text: string) => Promise<void>
  handleSuggestionClick: (suggestionText: string) => void
}

/**
 * Custom hook để quản lý chat logic
 */
export function useChat({ onUiEffects }: UseChatOptions = {}): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [hasComponentLoaded, setHasComponentLoaded] = useState(false) // Track component đã load chưa
  const [suggestions, setSuggestions] = useState<SuggestionMessage[]>(defaultSuggestions)
  const user = useAppSelector(selectUser)
  const conversationIdRef = useRef<string>(
    typeof window !== 'undefined'
      ? sessionStorage.getItem('chatbot_conversation_id') || `conv_${Date.now()}`
      : `conv_${Date.now()}`
  )

  const handleSendMessage = async (text: string) => {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text,
      createdAt: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setHasComponentLoaded(false) // Reset khi bắt đầu message mới

    // ============================================
    // LOAD DEFAULT COMPONENTS NGAY LẬP TỨC (không đợi API)
    // ============================================
    const defaultEffects = createDefaultUiEffects(text)
    if (defaultEffects.length > 0 && onUiEffects) {
      console.log('⚡ Loading default components immediately:', defaultEffects)
      onUiEffects(defaultEffects)
      setHasComponentLoaded(true) // Đánh dấu component đã load
    }

    try {
      // Kiểm tra AGENT_API có được cấu hình chưa
      if (!AGENT_API) {
        throw new Error('AGENT_API chưa được cấu hình trong file .env')
      }

      // Lưu conversationId vào sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('chatbot_conversation_id', conversationIdRef.current)
      }

      // ============================================
      // BUILD FULL CONVERSATION CONTEXT
      // Gửi toàn bộ lịch sử chat để server có đầy đủ ngữ cảnh
      // ============================================
      
      // Lấy toàn bộ messages (bao gồm cả message mới vừa thêm)
      const allMessages = [...messages, userMessage]
      
      // Build conversation history - gửi FULL CONTEXT từ đầu đến giờ
      const conversationHistory = buildConversationHistory(allMessages)

      // Log để debug - xem full context được gửi
      console.log('📝 Full conversation context being sent:', {
        totalMessages: allMessages.length,
        conversationHistoryLength: conversationHistory.length,
        firstMessage: conversationHistory[0]?.content?.substring(0, 50),
        lastMessage: conversationHistory[conversationHistory.length - 1]?.content?.substring(0, 50),
        fullHistory: conversationHistory,
      })

      // Đảm bảo user_id được gửi trong meta (BẮT BUỘC)
      const userId = user?._id || 'guest'
      if (!userId || userId === 'guest') {
        console.warn('⚠️ User ID không có, sử dụng guest. Đảm bảo user đã đăng nhập.')
      }

      // ============================================
      // LẤY THÔNG TIN BỔ SUNG TỪ BACKEND
      // Gọi API để lấy thông tin user đầy đủ (balance, name, email, etc.)
      // ============================================
      const userProfile = await fetchUserProfile(userId, user)

      // Build request body với FULL CONTEXT và META đầy đủ
      const request = buildChatRequest(
        conversationHistory,
        userId,
        conversationIdRef.current,
        userProfile
      )

      // Gọi TRỰC TIẾP đến server AI (AGENT_API), không qua backend
      const { data, error: apiError } = await sendChatMessage(request, AGENT_API)

      // Nếu API lỗi, tạo fallback response
      let responseData = data
      if (!responseData && apiError) {
        responseData = await createFallbackResponse(defaultEffects)
      }

      // Đảm bảo data không null (sau khi đã tạo fallback)
      if (!responseData) {
        // Nếu vẫn null, tạo response mặc định
        console.error('❌ Failed to create response, using default')
        responseData = {
          reply: 'Xin lỗi, không thể kết nối đến hệ thống. Vui lòng thử lại sau.',
          ui_effects: defaultEffects.length > 0 ? defaultEffects : [{ type: 'SHOW_MARKET_OVERVIEW' }],
          suggestion_messages: [
            { text: 'Xem tổng quan thị trường', icon: '🌐' },
            { text: 'Tìm hiểu thêm', icon: '❓' },
          ],
        } as ChatApiResponse
      }

      // ============================================
      // PARSE RESPONSE THEO FORMAT API_RESPONSE_FORMAT.md
      // ============================================
      const { reply: replyText, uiEffects, suggestionMessages } = parseChatResponse(responseData)

      // ============================================
      // MERGE SYMBOL TỪ USER INPUT VÀO API RESPONSE
      // ============================================
      // Ưu tiên symbol từ default effects (user input) hơn symbol từ API response
      const mergedUiEffects: FeatureInstruction[] = uiEffects.map((apiEffect) => {
        // Tìm default effect tương ứng
        const defaultEffect = defaultEffects.find(
          (def) => def.type === apiEffect.type
        )
        
        // Nếu có default effect và cả hai đều có symbol, ưu tiên symbol từ default
        if (defaultEffect && 'payload' in defaultEffect && 'payload' in apiEffect) {
          const defaultSymbol = (defaultEffect.payload as any)?.symbol
          const apiSymbol = (apiEffect.payload as any)?.symbol
          
          if (defaultSymbol && apiSymbol && defaultSymbol !== apiSymbol) {
            console.warn(`⚠️ Symbol mismatch: API returned "${apiSymbol}" but user input was "${defaultSymbol}". Using user input.`)
            
            // Merge symbol vào payload dựa trên type
            if (apiEffect.type === 'OPEN_STOCK_DETAIL') {
              return {
                ...apiEffect,
                payload: {
                  ...apiEffect.payload,
                  symbol: defaultSymbol,
                },
              } as FeatureInstruction
            } else if (apiEffect.type === 'OPEN_BUY_STOCK' || apiEffect.type === 'OPEN_SELL_STOCK') {
              return {
                ...apiEffect,
                payload: {
                  ...apiEffect.payload,
                  symbol: defaultSymbol,
                },
              } as FeatureInstruction
            } else if (apiEffect.type === 'OPEN_NEWS') {
              return {
                ...apiEffect,
                payload: {
                  ...apiEffect.payload,
                  symbol: defaultSymbol,
                },
              } as FeatureInstruction
            }
          }
        }
        
        return apiEffect
      })

      // ============================================
      // TẠO COMPONENTS/PROPS TỪ PARSED DATA
      // ============================================

      // Component: ChatMessage (reply)
      const botResponse: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        text: replyText,
        createdAt: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }

      // Component: Suggestions (suggestion_messages)
      setSuggestions(suggestionMessages)

      // Component: UI Effects (ui_effects) - Cập nhật với data từ API (đã merge symbol)
      // Nếu API trả về ui_effects, cập nhật lại (components sẽ tự fetch data thật từ backend)
      if (mergedUiEffects.length > 0 && onUiEffects) {
        console.log('✅ Updating UI effects with API data (merged with user input):', mergedUiEffects)
        onUiEffects(mergedUiEffects)
      } else if (defaultEffects.length > 0) {
        // Nếu API không trả về ui_effects nhưng đã load default, giữ nguyên
        // Components đã load sẽ tự fetch data từ backend
        console.log('ℹ️ Keeping default components, they will fetch data from backend')
      }

      // Thêm message vào chat (reply từ API)
      setMessages((prev) => [...prev, botResponse])
    } catch (error) {
      // Lỗi này chỉ xảy ra nếu có lỗi nghiêm trọng (không phải từ API call)
      console.error('❌ Unexpected error:', error)
      
      // Nếu đã load default components, giữ nguyên (chúng sẽ tự fetch data từ backend)
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        text:
          error instanceof Error && error.message.includes('AGENT_API chưa được cấu hình')
            ? 'Lỗi cấu hình: Vui lòng cấu hình NEXT_PUBLIC_AGENT_API trong file .env'
            : 'Xin lỗi, có lỗi xảy ra. Các components đã được tải và sẽ tự động lấy dữ liệu từ backend.',
        createdAt: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }
      setMessages((prev) => [...prev, errorMessage])
      
      // Nếu có default effects đã load, giữ nguyên (components sẽ tự fetch)
      if (defaultEffects.length > 0) {
        console.log('⚠️ Error but keeping default components - they will fetch from backend')
      } else {
        // Nếu không có default effects, load market overview
        if (onUiEffects) {
          onUiEffects([{ type: 'SHOW_MARKET_OVERVIEW' }])
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestionText: string) => {
    // Tìm suggestion object để lấy action nếu có (theo tài liệu Frontend Integration Guide)
    // Action format: query:, buy:, sell:, confirm:, cancel:, help
    const suggestionObj = suggestions.find((s) => s.text === suggestionText)
    
    if (!suggestionObj) {
      // Nếu không tìm thấy, dùng suggestionText trực tiếp
      handleSendMessage(suggestionText)
      return
    }

    // Xử lý action theo format trong tài liệu
    const action = suggestionObj.action || suggestionText
    
    // Parse action format
    if (action.startsWith('query:')) {
      // Gửi query mới (VD: "query:lịch sử giá VCB" -> "lịch sử giá VCB")
      const query = action.replace('query:', '')
      handleSendMessage(query)
    } else if (action.startsWith('buy:')) {
      // Mở form mua (VD: "buy:VCB" -> "Mua VCB")
      const symbol = action.replace('buy:', '')
      handleSendMessage(`Mua ${symbol}`)
    } else if (action.startsWith('sell:')) {
      // Mở form bán (VD: "sell:VCB" -> "Bán VCB")
      const symbol = action.replace('sell:', '')
      handleSendMessage(`Bán ${symbol}`)
    } else if (action.startsWith('confirm:')) {
      // Xác nhận action (VD: "confirm:buy:VCB" -> "Xác nhận mua VCB")
      const parts = action.split(':')
      if (parts.length >= 3) {
        const type = parts[1] // "buy" or "sell"
        const symbol = parts[2]
        handleSendMessage(`Xác nhận ${type === 'buy' ? 'mua' : 'bán'} ${symbol}`)
      } else {
        handleSendMessage(action)
      }
    } else if (action.startsWith('cancel:')) {
      // Hủy action (VD: "cancel:buy:VCB" -> "Hủy mua VCB")
      const parts = action.split(':')
      if (parts.length >= 3) {
        const type = parts[1] // "buy" or "sell"
        const symbol = parts[2]
        handleSendMessage(`Hủy ${type === 'buy' ? 'mua' : 'bán'} ${symbol}`)
      } else {
        handleSendMessage(action)
      }
    } else if (action === 'help') {
      // Hiển thị help
      handleSendMessage('Trợ giúp')
    } else {
      // Nếu không có action hoặc action không match format, dùng action/text trực tiếp
      handleSendMessage(action)
    }
  }

  return {
    messages,
    isLoading,
    hasComponentLoaded,
    suggestions,
    handleSendMessage,
    handleSuggestionClick,
  }
}

