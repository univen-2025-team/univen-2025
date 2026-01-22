import { useState, useRef } from 'react'
import { ChatMessage, SuggestionMessage } from '../types'
import { FeatureInstruction } from '@/features/types/features'
import { useAppSelector } from '@/lib/store/hooks'
import { selectUser } from '@/lib/store/authSlice'
import { getStockData, getStockDetails } from '@/lib/api/market-cache'
import {
  getAgentApiUrl,
  createDefaultUiEffects,
  buildConversationHistory,
  fetchUserProfile,
  buildChatRequest,
  sendChatMessage,
  createFallbackResponse,
  parseChatResponse,
  callPrimaryAPI,
  isHuggingFaceConfigured,
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
    // BƯỚC 1: GỌI PRIMARY API (HuggingFace > Groq) - Phân loại intent và hiển thị component ngay
    // ============================================
    console.log('🚀 ========== STARTING CHAT FLOW ==========')
    console.log('📝 User message:', text)
    console.log('🔧 HuggingFace configured:', isHuggingFaceConfigured())

    const allMessages = [...messages, userMessage]
    const conversationHistory = buildConversationHistory(allMessages)
    console.log('💬 Conversation history length:', conversationHistory.length)
    console.log('💬 Conversation history:', conversationHistory)

    // Gọi Primary API (HuggingFace > Groq) để phân loại intent
    let primaryResult: { reply: string; uiEffects: FeatureInstruction[]; suggestions: SuggestionMessage[] } | null = null
    try {
      console.log('🤖 ========== CALLING PRIMARY API (HF > Groq) ==========')
      console.log('🤖 Preparing messages...')

      const apiMessages = [
        {
          role: 'system' as const,
          content: 'Bạn là trợ lý chứng khoán Việt Nam.',
        },
        ...conversationHistory,
      ]
      console.log('🤖 Messages to send:', apiMessages)

      primaryResult = await callPrimaryAPI(apiMessages)
      console.log('🤖 Primary API call completed')

      if (primaryResult) {
        // Hiển thị component và reply ngay
        console.log('✅ ========== PRIMARY API RESPONSE RECEIVED ==========')
        console.log('✅ Reply:', primaryResult.reply)
        console.log('✅ UI effects:', primaryResult.uiEffects)
        console.log('✅ Suggestions:', primaryResult.suggestions)

        // Hiển thị reply
        const botResponse: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          text: primaryResult.reply,
          createdAt: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }
        setMessages((prev) => [...prev, botResponse])

        // Kiểm tra nếu suggestions chứa nhiều mã cổ phiếu -> tạo SHOW_STOCK_SUGGESTIONS
        const stockSymbols = primaryResult.suggestions
          .filter((s) => /^[A-Z]{2,5}$/.test(s.text.trim()))
          .map((s) => s.text.trim().toUpperCase())

        if (stockSymbols.length >= 2 && onUiEffects) {
          // Nếu có 2+ mã cổ phiếu trong suggestions, hiển thị component suggestions
          console.log(`📊 Detected ${stockSymbols.length} stock symbols in suggestions, showing StockSuggestionsFeature`)
          const stockSuggestionsEffect: FeatureInstruction = {
            type: 'SHOW_STOCK_SUGGESTIONS',
            payload: {
              symbols: stockSymbols,
            },
          }
          onUiEffects([stockSuggestionsEffect])
          setHasComponentLoaded(true)
        } else if (primaryResult.uiEffects.length > 0 && onUiEffects) {
          // Nếu không có nhiều mã cổ phiếu, dùng UI effects như bình thường
          onUiEffects(primaryResult.uiEffects)
          setHasComponentLoaded(true)
        } else if (onUiEffects) {
          // Nếu không có UI effects (NONE hoặc empty), tự động load SHOW_MARKET_OVERVIEW
          console.log('⚠️ No UI effects, defaulting to SHOW_MARKET_OVERVIEW')
          onUiEffects([{ type: 'SHOW_MARKET_OVERVIEW' }])
          setHasComponentLoaded(true)
        }

        // Hiển thị suggestions
        setSuggestions(primaryResult.suggestions)
        console.log('✅ UI updated successfully')

        // QUAN TRỌNG: Set isLoading = false ngay sau khi hiển thị message và component
        // Không cần chờ AGENT_API trả về
        setIsLoading(false)
      } else {
        console.warn('⚠️ Primary API returned null, no response received')
        // Vẫn set isLoading = false để không stuck
        setIsLoading(false)
      }
    } catch (apiError) {
      console.log('❌ ========== PRIMARY API ERROR ==========')
      console.log('❌ API error:', apiError)
      console.log('❌ Error details:', apiError instanceof Error ? apiError.message : String(apiError))
      console.log('❌ Stack trace:', apiError instanceof Error ? apiError.stack : 'N/A')
      // Vẫn set isLoading = false khi có lỗi
      setIsLoading(false)
      // Tiếp tục với AGENT_API nếu lỗi
    }

    // ============================================
    // BƯỚC 2: GỌI AGENT_API SONG SONG - Để update suggestions và data thật
    // ============================================
    try {
      // Kiểm tra AGENT_API có được cấu hình chưa
      if (!AGENT_API) {
        console.warn('⚠️ AGENT_API chưa được cấu hình, chỉ dùng Groq')
        setIsLoading(false)
        return
      }

      // Lưu conversationId vào sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('chatbot_conversation_id', conversationIdRef.current)
      }

      // Đảm bảo user_id được gửi trong meta (BẮT BUỘC)
      const userId = user?._id || 'guest'
      if (!userId || userId === 'guest') {
        console.warn('⚠️ User ID không có, sử dụng guest. Đảm bảo user đã đăng nhập.')
      }

      // Lấy thông tin user profile
      const userProfile = await fetchUserProfile(userId, user)

      // Build request body với FULL CONTEXT và META đầy đủ
      const request = buildChatRequest(
        conversationHistory,
        userId,
        conversationIdRef.current,
        userProfile
      )

      // Gọi AGENT_API để update suggestions và data thật
      console.log('🔗 Calling AGENT_API to update suggestions and data...')

      // Đợi AGENT_API trả về để update
      const { data: agentData, error: agentError } = await sendChatMessage(request, AGENT_API)

      // ============================================
      // BƯỚC 3: UPDATE KHI AGENT_API TRẢ VỀ (CHỈ KHI KHÔNG CÓ LỖI)
      // Update suggestions, UI effects, và các thông số
      // ============================================
      if (agentData && !agentError) {
        // Double check: Validate response từ AGENT_API
        try {
          const { reply: agentReply, uiEffects: agentUiEffects, suggestionMessages: agentSuggestions } = parseChatResponse(agentData)

          // Validate: Kiểm tra reply có hợp lệ không
          const hasValidReply = agentReply && typeof agentReply === 'string' && agentReply.trim().length > 0

          // Validate: Kiểm tra suggestions có hợp lệ không
          const hasValidSuggestions = Array.isArray(agentSuggestions) && agentSuggestions.length > 0

          // Validate: Kiểm tra UI effects có hợp lệ không
          const hasValidUiEffects = Array.isArray(agentUiEffects) && agentUiEffects.length > 0

          console.log('🔍 Validating AGENT_API response:', {
            hasValidReply,
            hasValidSuggestions,
            hasValidUiEffects,
            suggestionsCount: agentSuggestions?.length || 0,
            uiEffectsCount: agentUiEffects?.length || 0,
          })

          // KHÔNG thêm message mới từ AGENT_API - chỉ dùng để update suggestions và UI effects
          // Message đã được hiển thị từ BƯỚC 1 (primaryResult)
          if (hasValidReply) {
            console.log('💬 AGENT_API reply received (not adding new message, using primary result):', agentReply.substring(0, 50))
          }

          // Update suggestions từ AGENT_API (chỉ khi hợp lệ)
          if (hasValidSuggestions) {
            console.log('📝 Updating suggestions from AGENT_API:', agentSuggestions)
            setSuggestions(agentSuggestions)
          } else {
            console.warn('⚠️ AGENT_API suggestions invalid, keeping Groq suggestions')
          }

          // Update UI effects từ AGENT_API (chỉ khi hợp lệ)
          if (hasValidUiEffects && onUiEffects) {
            // Merge symbol từ primary result nếu có
            const mergedUiEffects: FeatureInstruction[] = agentUiEffects.map((agentEffect) => {
              // Validate effect có payload hợp lệ
              if (!agentEffect || !('type' in agentEffect)) {
                console.warn('⚠️ Invalid effect from AGENT_API:', agentEffect)
                return agentEffect
              }

              if (primaryResult && primaryResult.uiEffects.length > 0) {
                const primaryEffect = primaryResult.uiEffects.find(e => e.type === agentEffect.type)
                if (primaryEffect && 'payload' in primaryEffect && 'payload' in agentEffect) {
                  const primarySymbol = (primaryEffect.payload as any)?.symbol
                  const agentSymbol = (agentEffect.payload as any)?.symbol

                  // Ưu tiên symbol từ primary (user input) nếu có
                  if (primarySymbol && (!agentSymbol || primarySymbol !== agentSymbol)) {
                    console.log(`🔄 Merging symbol from primary: ${primarySymbol}`)
                    return {
                      ...agentEffect,
                      payload: {
                        ...agentEffect.payload,
                        symbol: primarySymbol,
                      },
                    } as FeatureInstruction
                  }
                }
              }
              return agentEffect
            })

            console.log('✅ Updating UI effects from AGENT_API (validated):', mergedUiEffects)
            onUiEffects(mergedUiEffects)
            setHasComponentLoaded(true)
          } else {
            console.warn('⚠️ AGENT_API UI effects invalid, keeping primary UI effects')
          }
        } catch (parseError) {
          console.log('❌ Error parsing AGENT_API response:', parseError)
          // Giữ nguyên Groq response nếu parse lỗi
        }
      } else if (agentError) {
        console.warn('⚠️ AGENT_API error, keeping Groq response:', agentError)
        // Giữ nguyên Groq response nếu AGENT_API lỗi
      } else {
        console.warn('⚠️ AGENT_API returned no data, keeping Groq response')
      }
    } catch (error) {
      // Lỗi này chỉ xảy ra nếu có lỗi nghiêm trọng (không phải từ API call)
      console.log('❌ Unexpected error:', error)

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

      // Nếu primary API đã load component, giữ nguyên
      if (primaryResult && primaryResult.uiEffects.length > 0) {
        console.log('⚠️ Error but keeping primary API components')
      } else {
        console.log('⚠️ Error occurred, no component shown')
        setHasComponentLoaded(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function để tạo mock stock data
  const createMockStockData = (symbol: string): FeatureInstruction => {
    // Tạo giá mock dựa trên symbol (để có giá khác nhau cho mỗi mã)
    const basePrice = 50000 + (symbol.charCodeAt(0) + symbol.charCodeAt(1)) * 1000
    const mockPrice = basePrice + Math.floor(Math.random() * 20000)
    const mockChangePercent = (Math.random() * 4 - 2).toFixed(2) // -2% đến +2%

    // Tạo mock intraday chart data
    const mockChartData = [
      { time: '09:00', value: mockPrice * 0.98 },
      { time: '10:00', value: mockPrice * 0.99 },
      { time: '11:00', value: mockPrice },
      { time: '13:00', value: mockPrice * 1.01 },
      { time: '14:00', value: mockPrice * 1.005 },
      { time: '15:00', value: mockPrice },
    ]

    // Map company names cho các mã phổ biến
    const companyNames: Record<string, string> = {
      VCB: 'Ngân hàng TMCP Ngoại Thương Việt Nam',
      VNM: 'Công ty Cổ phần Sữa Việt Nam',
      VIC: 'Tập đoàn Vingroup',
      VRE: 'Công ty Cổ phần Vinhomes',
      TPB: 'Ngân hàng TMCP Tiên Phong',
      MWG: 'Công ty Cổ phần Đầu tư Thế Giới Di Động',
      FPT: 'Công ty Cổ phần FPT',
      HPG: 'Công ty Cổ phần Tập đoàn Hòa Phát',
      VHM: 'Công ty Cổ phần Vinhomes',
      MSN: 'Công ty Cổ phần Tập đoàn Ma San',
    }

    return {
      type: 'OPEN_STOCK_DETAIL',
      payload: {
        symbol,
        name: companyNames[symbol] || `${symbol} Corporation`,
        description: `Thông tin chi tiết về cổ phiếu ${symbol}`,
        price: mockPrice,
        changePercent: parseFloat(mockChangePercent),
        intradayChart: mockChartData,
      },
    }
  }

  const handleSuggestionClick = async (suggestionText: string) => {
    // Tìm suggestion object để lấy action nếu có (theo tài liệu Frontend Integration Guide)
    // Action format: query:, buy:, sell:, confirm:, cancel:, help
    const suggestionObj = suggestions.find((s) => s.text === suggestionText)

    // Kiểm tra nếu suggestionText là mã cổ phiếu (2-5 chữ cái in hoa, không có khoảng trắng)
    const isStockSymbol = /^[A-Z]{2,5}$/.test(suggestionText.trim())

    if (isStockSymbol) {
      // Nếu là mã cổ phiếu, fetch data từ API và hiển thị stock detail
      console.log(`📊 Detected stock symbol in suggestion: ${suggestionText}`)

      setIsLoading(true)
      try {
        const symbol = suggestionText.trim().toUpperCase()
        
        // Gọi cả getStockData và getStockDetails để lấy đầy đủ thông tin
        const [stockData, stockDetails] = await Promise.all([
          getStockData(symbol),
          getStockDetails(symbol)
        ])

        let stockDetailEffect: FeatureInstruction
        let botMessageText: string

        // Ưu tiên lấy name từ stockDetails (stock-symbol.model.ts)
        const companyName = stockDetails?.info?.organName || 
                           stockDetails?.info?.enOrganName || 
                           stockDetails?.info?.organShortName ||
                           stockDetails?.info?.enOrganShortName ||
                           stockData?.companyName || 
                           `${symbol} Corporation`

        // Lấy description từ profile hoặc tạo mặc định
        const description = stockDetails?.profile?.description || 
                           (stockDetails?.info?.organName ? 
                           `Thông tin chi tiết về ${stockDetails.info.organName}` :
                           `Thông tin chi tiết về cổ phiếu ${symbol}`)

        if (stockData && onUiEffects) {
          // Tạo UI effect OPEN_STOCK_DETAIL với data từ API (merge từ stock-symbol.model.ts)
          stockDetailEffect = {
            type: 'OPEN_STOCK_DETAIL',
            payload: {
              symbol: stockData.symbol,
              name: companyName,
              description: description,
              price: stockData.price,
              changePercent: stockData.changePercent,
              intradayChart: [], // Chart data sẽ được fetch bởi component
            },
          }

          botMessageText = `Đây là thông tin về cổ phiếu ${stockData.symbol}:\n\nGiá hiện tại: ${stockData.price.toLocaleString('vi-VN')} VNĐ\nThay đổi: ${stockData.changePercent >= 0 ? '+' : ''}${stockData.changePercent.toFixed(2)}%`

          console.log(`✅ Stock detail loaded from API for ${symbol}:`, {
            stockData,
            stockDetails,
            companyName
          })
        } else {
          // Nếu không fetch được data, dùng mock data
          console.warn(`⚠️ Failed to fetch stock data for ${symbol}, using mock data`)
          stockDetailEffect = createMockStockData(symbol)

          // Type guard để access payload
          if (stockDetailEffect.type === 'OPEN_STOCK_DETAIL') {
            botMessageText = `Đây là thông tin về cổ phiếu ${symbol} (dữ liệu mẫu):\n\nGiá hiện tại: ${stockDetailEffect.payload.price.toLocaleString('vi-VN')} VNĐ\nThay đổi: ${stockDetailEffect.payload.changePercent >= 0 ? '+' : ''}${stockDetailEffect.payload.changePercent.toFixed(2)}%`
          } else {
            botMessageText = `Đây là thông tin về cổ phiếu ${symbol} (dữ liệu mẫu)`
          }
        }

        if (onUiEffects) {
          // Thêm message từ bot
          const botMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            text: botMessageText,
            createdAt: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          }

          setMessages((prev) => [...prev, botMessage])
          onUiEffects([stockDetailEffect])
          setHasComponentLoaded(true)
        }
      } catch (error) {
        console.error(`❌ Error fetching stock data for ${suggestionText}:`, error)

        // Nếu có lỗi, dùng mock data
        const symbol = suggestionText.trim().toUpperCase()
        const mockEffect = createMockStockData(symbol)

        if (onUiEffects) {
          // Type guard để access payload
          let botMessageText = `Đây là thông tin về cổ phiếu ${symbol} (dữ liệu mẫu)`
          if (mockEffect.type === 'OPEN_STOCK_DETAIL') {
            botMessageText = `Đây là thông tin về cổ phiếu ${symbol} (dữ liệu mẫu):\n\nGiá hiện tại: ${mockEffect.payload.price.toLocaleString('vi-VN')} VNĐ\nThay đổi: ${mockEffect.payload.changePercent >= 0 ? '+' : ''}${mockEffect.payload.changePercent.toFixed(2)}%`
          }

          const botMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            text: botMessageText,
            createdAt: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          }

          setMessages((prev) => [...prev, botMessage])
          onUiEffects([mockEffect])
          setHasComponentLoaded(true)
        }
      } finally {
        setIsLoading(false)
      }
      return
    }

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

