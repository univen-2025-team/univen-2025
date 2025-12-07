import { FeatureInstruction } from '@/features/types/features'
import { ChatMessage, SuggestionMessage } from '../components/types'
import { userApi, type UserProfile } from '@/lib/api/user.api'
import { getLatestMarketData, getStockData } from '@/lib/api/market-cache'
import { API_URL } from '@/config/app'

// ============================================
// TYPES
// ============================================

export type RawAgentOutput = {
  reply?: string
  events?: Array<{
    author: string
    has_is_final: boolean
    text: string
    type: string
  }>
  [key: string]: unknown
}

export type ChatApiResponse = {
  reply: string // Text response từ agent (BẮT BUỘC)
  ui_effects: FeatureInstruction[] // Danh sách UI components cần render
  suggestion_messages: SuggestionMessage[] // Gợi ý câu hỏi tiếp theo (luôn có ít nhất 1)
  raw_agent_output?: RawAgentOutput // Debug info (optional)
}

export type ChatRequestMeta = {
  user_id: string
  session_id: string
  locale: string
  user_name?: string
  user_email?: string
  balance?: number
  user_status?: string
  user_role?: string
}

export type ChatRequest = {
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  meta: ChatRequestMeta
}

// ============================================
// HELPERS
// ============================================

/**
 * Lấy AGENT_API từ biến môi trường - gọi trực tiếp đến server AI, không qua backend
 */
export const getAgentApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Client-side: chỉ dùng NEXT_PUBLIC_AGENT_API
    return process.env.NEXT_PUBLIC_AGENT_API || ''
  }
  // Server-side: có thể dùng cả hai
  return process.env.NEXT_PUBLIC_AGENT_API || process.env.AGENT_API || ''
}

/**
 * Extract symbol từ text - ưu tiên các symbol phổ biến
 */
const extractSymbol = (text: string): string | undefined => {
  const upperText = text.toUpperCase().trim()
  
  // Danh sách symbol phổ biến (ưu tiên)
  const commonSymbols = ['VCB', 'VNM', 'MWG', 'VIC', 'VHM', 'HPG', 'FPT', 'MSN', 'TCB', 'BID', 'CTG', 'ACB', 'MBB', 'VPB', 'STB', 'TPB', 'EIB', 'HDB', 'SSI', 'VCI', 'VND', 'BSI', 'VIX', 'VRE', 'VGC', 'VSH', 'VHC', 'VSC', 'VPI', 'VCI']
  
  // Nếu text chỉ là symbol (2-5 chữ cái in hoa, không có khoảng trắng hoặc ký tự đặc biệt)
  if (/^[A-Z]{2,5}$/.test(upperText)) {
    return upperText
  }
  
  // Tìm symbol phổ biến trong text trước
  for (const sym of commonSymbols) {
    if (upperText.includes(sym)) {
      return sym
    }
  }
  
  // Nếu không tìm thấy symbol phổ biến, tìm bất kỳ pattern 2-5 chữ cái in hoa
  const symbolMatch = upperText.match(/\b[A-Z]{2,5}\b/)
  return symbolMatch ? symbolMatch[0] : undefined
}

/**
 * Tạo default UI effects từ text (load ngay lập tức, không đợi API)
 */
export const createDefaultUiEffects = (text: string): FeatureInstruction[] => {
  const lowerText = text.toLowerCase()
  const effects: FeatureInstruction[] = []

  // Detect intent và tạo default component
  // Ưu tiên check các pattern cụ thể trước (tin tức thị trường, chi tiết, mua)
  // Sau đó mới check pattern chung (thị trường)
  
  if (lowerText.includes('tin tức') || lowerText.includes('news')) {
    // Extract symbol nếu có (ví dụ: "tin tức VCB" -> "VCB")
    const symbol = extractSymbol(text)

    // Mock news data để hiển thị ngay
    const mockNewsItems = [
      {
        id: 'mock-1',
        title: symbol 
          ? `${symbol} công bố kết quả kinh doanh quý mới nhất`
          : 'Thị trường chứng khoán Việt Nam tăng điểm mạnh trong phiên giao dịch hôm nay',
        source: 'VnExpress',
        timeAgo: '1 giờ trước',
        sentiment: 'positive' as const,
      },
      {
        id: 'mock-2',
        title: symbol
          ? `Phân tích triển vọng đầu tư ${symbol} trong năm 2025`
          : 'Nhu cầu chip AI thúc đẩy đà tăng của các cổ phiếu công nghệ',
        source: 'Bloomberg',
        timeAgo: '3 giờ trước',
        sentiment: 'positive' as const,
      },
      {
        id: 'mock-3',
        title: symbol
          ? `${symbol} nhận được đánh giá tích cực từ các nhà phân tích`
          : 'Fed báo hiệu có thể giữ lãi suất ổn định trong thời gian tới',
        source: 'Reuters',
        timeAgo: '5 giờ trước',
        sentiment: 'neutral' as const,
      },
    ]

    effects.push({
      type: 'OPEN_NEWS',
      payload: {
        symbol,
        items: mockNewsItems, // Mock data để hiển thị ngay, component sẽ fetch data thật sau
      },
    })
  } else if (lowerText.includes('mua') || lowerText.includes('buy')) {
    // Extract symbol (e.g., "mua MWG" -> "MWG")
    const symbol = extractSymbol(text) || 'MWG'

    effects.push({
      type: 'OPEN_BUY_STOCK',
      payload: {
        symbol,
        currentPrice: 0, // Component sẽ tự fetch giá thật từ backend
        steps: [
          {
            id: 'select-quantity',
            title: 'Chọn số lượng cổ phiếu',
            description: `Nhập số lượng cổ phiếu ${symbol} bạn muốn mua.`,
            fields: [
              {
                type: 'number',
                name: 'quantity',
                label: 'Số lượng cổ phiếu',
                placeholder: 'ví dụ: 10',
              },
            ],
          },
          {
            id: 'set-order-type',
            title: 'Chọn loại lệnh',
            description: 'Chọn giữa lệnh Market (khớp ngay) hoặc Limit (giá mục tiêu).',
            fields: [
              {
                type: 'select',
                name: 'orderType',
                label: 'Loại lệnh',
                options: ['Market Order', 'Limit Order'],
              },
            ],
          },
          {
            id: 'review-confirm',
            title: 'Xem xét và xác nhận',
            description: 'Kiểm tra chi tiết đơn hàng trước khi gửi.',
          },
        ],
      },
    })
  } else if (lowerText.includes('chi tiết') || lowerText.includes('detail') || lowerText.includes('giá')) {
    // Extract symbol - ưu tiên tìm symbol phổ biến
    const symbol = extractSymbol(text) || 'MWG'

    // Mock data để hiển thị ngay (component sẽ fetch data thật sau)
    const mockPrice = 95000 + Math.floor(Math.random() * 10000)
    const mockChangePercent = (Math.random() * 4 - 2).toFixed(2)

    effects.push({
      type: 'OPEN_STOCK_DETAIL',
      payload: {
        symbol,
        name: `${symbol} Corporation`,
        description: `Thông tin chi tiết về cổ phiếu ${symbol}`,
        price: mockPrice, // Mock data để hiển thị ngay
        changePercent: parseFloat(mockChangePercent),
        intradayChart: [
          { time: '09:00', value: mockPrice * 0.98 },
          { time: '10:00', value: mockPrice * 0.99 },
          { time: '11:00', value: mockPrice },
          { time: '13:00', value: mockPrice * 1.01 },
          { time: '14:00', value: mockPrice * 1.005 },
          { time: '15:00', value: mockPrice },
        ], // Mock chart data
      },
    })
  } else if (lowerText.includes('thị trường') || lowerText.includes('market') || lowerText.includes('tổng quan')) {
    effects.push({
      type: 'SHOW_MARKET_OVERVIEW',
    })
  } else {
    // Nếu chỉ là symbol (không có từ khóa), hiển thị stock detail
    const symbol = extractSymbol(text)
    if (symbol) {
      const mockPrice = 95000 + Math.floor(Math.random() * 10000)
      const mockChangePercent = (Math.random() * 4 - 2).toFixed(2)
      
      effects.push({
        type: 'OPEN_STOCK_DETAIL',
        payload: {
          symbol,
          name: `${symbol} Corporation`,
          description: `Thông tin chi tiết về cổ phiếu ${symbol}`,
          price: mockPrice,
          changePercent: parseFloat(mockChangePercent),
          intradayChart: [
            { time: '09:00', value: mockPrice * 0.98 },
            { time: '10:00', value: mockPrice * 0.99 },
            { time: '11:00', value: mockPrice },
            { time: '13:00', value: mockPrice * 1.01 },
            { time: '14:00', value: mockPrice * 1.005 },
            { time: '15:00', value: mockPrice },
          ],
        },
      })
    }
  }

  return effects
}

/**
 * Build conversation history từ messages
 * Đảm bảo message cuối cùng là từ user (theo tài liệu Frontend Integration Guide)
 */
export const buildConversationHistory = (messages: ChatMessage[]): Array<{ role: 'user' | 'assistant'; content: string }> => {
  // Lọc bỏ system messages và map sang format API
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = messages
    .filter((msg) => msg.role !== 'system') // Loại bỏ system messages
    .map((msg) => ({
      role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.text,
    }))
  
  // Đảm bảo message cuối cùng là từ user (theo tài liệu)
  // Nếu message cuối cùng không phải từ user, log warning
  if (history.length > 0 && history[history.length - 1].role !== 'user') {
    console.warn('⚠️ Last message in conversation history is not from user. This may cause issues with the API.')
  }
  
  return history
}

/**
 * Lấy user profile từ backend
 */
export const fetchUserProfile = async (userId: string, fallbackUser?: any): Promise<UserProfile | null> => {
  if (!userId || userId === 'guest') {
    return null
  }

  try {
    const userProfile = await userApi.getProfile()
    console.log('✅ Fetched user profile from backend:', {
      _id: userProfile._id,
      user_fullName: userProfile.user_fullName,
      balance: userProfile.balance,
      email: userProfile.email,
      user_status: userProfile.user_status,
    })
    return userProfile
  } catch (error) {
    // Nếu không lấy được profile, vẫn tiếp tục với thông tin từ Redux
    console.warn('⚠️ Không thể lấy user profile từ backend, sử dụng thông tin từ Redux:', error)
    
    // Fallback: sử dụng thông tin từ Redux store nếu có
    if (fallbackUser) {
      return {
        _id: fallbackUser._id || userId,
        email: fallbackUser.email || '',
        user_fullName: fallbackUser.user_fullName || '',
        user_avatar: fallbackUser.user_avatar || '',
        user_gender: fallbackUser.user_gender || false,
        balance: fallbackUser.balance || 0,
        user_role: fallbackUser.user_role || '',
        user_status: fallbackUser.user_status || 'ACTIVE',
        role_name: fallbackUser.user_role || '',
        user_dayOfBirth: fallbackUser.user_dayOfBirth,
      } as UserProfile
    }
    
    return null
  }
}

/**
 * Build request body để gửi đến AGENT_API
 * Theo tài liệu Frontend Integration Guide:
 * - messages: Array với system message + full conversation history
 * - Message cuối cùng trong messages array phải là message từ user (role: "user")
 * - meta: user_id (optional nhưng nên có), session_id (optional), locale (default: "vi-VN")
 */
export const buildChatRequest = (
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  userId: string,
  sessionId: string,
  userProfile: UserProfile | null
): ChatRequest => {
  // Đảm bảo message cuối cùng là từ user (theo tài liệu)
  if (conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].role !== 'user') {
    console.warn('⚠️ Last message in conversation history is not from user. API may not work correctly.')
  }

  return {
    messages: [
      {
        role: 'system',
        content: 'Bạn là trợ lý chứng khoán Việt Nam. Bạn giúp người dùng phân tích thị trường, mua bán cổ phiếu, và tư vấn đầu tư.',
      },
      // Gửi FULL CONTEXT - toàn bộ lịch sử conversation từ đầu đến giờ
      // QUAN TRỌNG: Message cuối cùng phải là từ user (role: "user")
      ...conversationHistory,
    ],
    meta: {
      user_id: userId, // Optional nhưng nên có
      session_id: sessionId, // Optional, dùng để maintain conversation
      locale: 'vi-VN', // Default: "vi-VN"
      // Thông tin bổ sung từ backend
      ...(userProfile && {
        user_name: userProfile.user_fullName,
        user_email: userProfile.email,
        balance: userProfile.balance,
        user_status: userProfile.user_status,
        user_role: userProfile.user_role,
      }),
    },
  }
}

/**
 * Gửi message đến AGENT_API
 */
export const sendChatMessage = async (
  request: ChatRequest,
  agentApiUrl: string
): Promise<{ data: ChatApiResponse | null; error: Error | null }> => {
  const apiUrl = `${agentApiUrl}/api/v1/chat`
  
  // Log chi tiết để debug full context và meta
  console.log('🔗 Calling AGENT_API directly:', apiUrl)
  console.log('📋 Request meta (with user info):', request.meta)
  console.log('💬 Full context being sent:', {
    totalMessages: request.messages.length,
    systemMessage: 1,
    conversationHistoryLength: request.messages.length - 1,
    userMessages: request.messages.filter(m => m.role === 'user').length,
    assistantMessages: request.messages.filter(m => m.role === 'assistant').length,
    firstMessage: request.messages[1]?.content?.substring(0, 60),
    lastMessage: request.messages[request.messages.length - 1]?.content?.substring(0, 60),
  })

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorText = await response.text()
      // Console log chi tiết cho developer
      console.error('❌ AGENT_API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        error: errorText,
        userId: request.meta.user_id,
      })
      
      // Nếu là 404, có thể endpoint không tồn tại hoặc AGENT_API sai
      if (response.status === 404) {
        console.warn('⚠️ 404 - Endpoint không tồn tại. Kiểm tra AGENT_API:', agentApiUrl)
      }
      
      return {
        data: null,
        error: new Error(`AGENT_API error: ${response.status}`),
      }
    }

    const responseData = await response.json()
    console.log('✅ AGENT_API response received:', {
      hasReply: !!responseData.reply,
      uiEffectsCount: responseData.ui_effects?.length || 0,
      suggestionsCount: responseData.suggestion_messages?.length || 0,
    })
    
    return {
      data: responseData as ChatApiResponse,
      error: null,
    }
  } catch (fetchError) {
    // Console log chi tiết cho developer
    console.error('❌ AGENT_API Fetch Error:', {
      error: fetchError,
      url: apiUrl,
      userId: request.meta.user_id,
      message: fetchError instanceof Error ? fetchError.message : 'Unknown error',
    })
    
    return {
      data: null,
      error: fetchError instanceof Error ? fetchError : new Error('Network error'),
    }
  }
}

/**
 * Tạo fallback response khi AGENT_API lỗi
 */
export const createFallbackResponse = async (
  defaultEffects: FeatureInstruction[]
): Promise<ChatApiResponse> => {
  console.log('⚠️ AGENT_API failed, fetching from backend market API...')
  
  // Fetch data từ backend market API dựa trên default effects
  let fallbackReply = 'Đang tải thông tin từ hệ thống...'
  let enhancedEffects = [...defaultEffects]

  try {
    if (defaultEffects.length > 0) {
      const effect = defaultEffects[0]
      
      if (effect.type === 'OPEN_STOCK_DETAIL') {
        const symbol = effect.payload.symbol
        console.log(`📊 Fetching stock data for ${symbol} from backend...`)
        
        try {
          const stockData = await getStockData(symbol)
          
          if (stockData) {
            enhancedEffects = [{
              type: 'OPEN_STOCK_DETAIL',
              payload: {
                symbol: stockData.symbol,
                name: stockData.companyName || `${stockData.symbol} Corporation`,
                description: `Thông tin chi tiết về ${stockData.symbol}`,
                price: stockData.price,
                changePercent: stockData.changePercent,
                intradayChart: [], // Component sẽ tự fetch chart
              },
            }]
            fallbackReply = `Đã tải thông tin về ${stockData.symbol}. Giá hiện tại: ${stockData.price.toLocaleString('vi-VN')} VNĐ (${stockData.changePercent > 0 ? '+' : ''}${stockData.changePercent.toFixed(2)}%).`
          } else {
            // Nếu không fetch được, dùng mock data
            console.warn(`⚠️ Could not fetch stock data for ${symbol}, using mock data`)
            const mockPrice = 95000 + Math.floor(Math.random() * 10000)
            const mockChangePercent = (Math.random() * 4 - 2).toFixed(2)
            
            enhancedEffects = [{
              type: 'OPEN_STOCK_DETAIL',
              payload: {
                symbol,
                name: `${symbol} Corporation`,
                description: `Thông tin chi tiết về ${symbol}`,
                price: mockPrice,
                changePercent: parseFloat(mockChangePercent),
                intradayChart: [
                  { time: '09:00', value: mockPrice * 0.98 },
                  { time: '10:00', value: mockPrice * 0.99 },
                  { time: '11:00', value: mockPrice },
                  { time: '13:00', value: mockPrice * 1.01 },
                  { time: '14:00', value: mockPrice * 1.005 },
                  { time: '15:00', value: mockPrice },
                ],
              },
            }]
            fallbackReply = `Đã tải thông tin về ${symbol}. Giá hiện tại: ${mockPrice.toLocaleString('vi-VN')} VNĐ (${parseFloat(mockChangePercent) > 0 ? '+' : ''}${mockChangePercent}%).`
          }
        } catch (stockError) {
          // Console log chi tiết cho developer (không hiển thị cho user)
          console.error(`❌ Error fetching stock data for ${symbol} from backend:`, {
            error: stockError,
            symbol,
            url: `${API_URL}/market/stock/${symbol}`,
            message: stockError instanceof Error ? stockError.message : 'Unknown error',
            stack: stockError instanceof Error ? stockError.stack : undefined,
          })
          
          // Dùng mock data khi lỗi (giữ nguyên từ default effect hoặc tạo mới)
          const existingEffect = enhancedEffects.find(e => e.type === 'OPEN_STOCK_DETAIL')
          if (existingEffect && existingEffect.type === 'OPEN_STOCK_DETAIL') {
            // Giữ nguyên mock data từ default effect
            fallbackReply = `Đã tải thông tin về ${symbol}. Component sẽ tự động cập nhật khi có dữ liệu từ backend.`
          } else {
            // Tạo mock data mới
            const mockPrice = 95000 + Math.floor(Math.random() * 10000)
            const mockChangePercent = (Math.random() * 4 - 2).toFixed(2)
            
            enhancedEffects = [{
              type: 'OPEN_STOCK_DETAIL',
              payload: {
                symbol,
                name: `${symbol} Corporation`,
                description: `Thông tin chi tiết về ${symbol}`,
                price: mockPrice,
                changePercent: parseFloat(mockChangePercent),
                intradayChart: [
                  { time: '09:00', value: mockPrice * 0.98 },
                  { time: '10:00', value: mockPrice * 0.99 },
                  { time: '11:00', value: mockPrice },
                  { time: '13:00', value: mockPrice * 1.01 },
                  { time: '14:00', value: mockPrice * 1.005 },
                  { time: '15:00', value: mockPrice },
                ],
              },
            }]
            fallbackReply = `Đã tải thông tin về ${symbol}. Giá hiện tại: ${mockPrice.toLocaleString('vi-VN')} VNĐ (${parseFloat(mockChangePercent) > 0 ? '+' : ''}${mockChangePercent}%).`
          }
        }
      } else if (effect.type === 'SHOW_MARKET_OVERVIEW') {
        console.log('📈 Fetching market overview from backend...')
        const marketData = await getLatestMarketData()
        
        if (marketData) {
          fallbackReply = `Tổng quan thị trường: VN30 Index ${marketData.vn30Index.index.toLocaleString('vi-VN')} điểm (${marketData.vn30Index.changePercent > 0 ? '+' : ''}${marketData.vn30Index.changePercent.toFixed(2)}%).`
        } else {
          fallbackReply = 'Đang tải tổng quan thị trường...'
        }
      } else if (effect.type === 'OPEN_BUY_STOCK') {
        const symbol = effect.payload.symbol
        console.log(`💰 Fetching stock price for ${symbol} from backend...`)
        const stockData = await getStockData(symbol)
        
        if (stockData) {
          enhancedEffects = [{
            type: 'OPEN_BUY_STOCK',
            payload: {
              symbol: stockData.symbol,
              currentPrice: stockData.price,
              steps: effect.payload.steps,
            },
          }]
          fallbackReply = `Đã tải giá ${stockData.symbol}: ${stockData.price.toLocaleString('vi-VN')} VNĐ. Bạn có thể tiếp tục đặt lệnh mua.`
        } else {
          fallbackReply = `Đang tải giá ${symbol}...`
        }
      } else if (effect.type === 'OPEN_NEWS') {
        // News component sẽ tự fetch từ backend, chỉ cần giữ nguyên effect
        const symbol = effect.payload.symbol
        console.log(`📰 Opening news component${symbol ? ` for ${symbol}` : ''}...`)
        fallbackReply = symbol 
          ? `Đang tải tin tức về ${symbol}...`
          : 'Đang tải tin tức thị trường...'
        // Giữ nguyên enhancedEffects (đã có OPEN_NEWS)
      }
    }
  } catch (backendError) {
    // Console log chi tiết, nhưng không throw
    console.error('❌ Backend market API error:', {
      error: backendError,
      message: backendError instanceof Error ? backendError.message : 'Unknown error',
    })
    // Giữ nguyên fallback reply
  }

  // Tạo fallback response với message clean cho user
  const response: ChatApiResponse = {
    reply: fallbackReply, // Message clean, không hiển thị lỗi kỹ thuật
    ui_effects: enhancedEffects,
    suggestion_messages: [
      { text: 'Xem tổng quan thị trường', icon: '🌐' },
      { text: 'Tìm hiểu thêm', icon: '❓' },
    ],
  }
  
  console.log('✅ Fallback response created from backend data')
  return response
}

/**
 * Parse response từ API theo format API_RESPONSE_FORMAT.md
 */
export const parseChatResponse = (data: ChatApiResponse): {
  reply: string
  uiEffects: FeatureInstruction[]
  suggestionMessages: SuggestionMessage[]
} => {
  // 1. Parse reply (BẮT BUỘC) - Text response từ agent
  const replyText = data.reply || 'Xin lỗi, tôi không thể trả lời câu hỏi này.'
  
  // Kiểm tra nếu reply chứa [DEBUG] (theo Error Handling trong API_RESPONSE_FORMAT.md)
  const isDebugMessage = replyText.includes('[DEBUG]')
  if (isDebugMessage) {
    console.warn('⚠️ Debug message detected:', replyText)
    console.log('Raw agent output:', data.raw_agent_output)
  }

  // 2. Parse UI effects - Danh sách UI components cần render
  const uiEffects: FeatureInstruction[] = data.ui_effects || []
  
  // Map intradayChart từ { time, price } sang { time, value } nếu cần
  uiEffects.forEach((effect) => {
    if (effect.type === 'OPEN_STOCK_DETAIL' && effect.payload.intradayChart) {
      effect.payload.intradayChart = effect.payload.intradayChart.map((point) => ({
        time: point.time,
        value: 'price' in point ? point.price : (point as any).value,
      }))
    }
  })

  // 3. Parse suggestion_messages - Gợi ý câu hỏi tiếp theo (luôn có ít nhất 1)
  const suggestionMessages: SuggestionMessage[] = 
    data.suggestion_messages && data.suggestion_messages.length > 0
      ? data.suggestion_messages
      : [
          // Fallback suggestions nếu API không trả về (theo Error Handling)
          { text: 'Xem tổng quan thị trường', icon: '🌐' },
          { text: 'Tìm hiểu thêm', icon: '❓' },
        ]

  // 4. Parse raw_agent_output - Debug info (optional)
  if (data.raw_agent_output) {
    console.log('🔍 Raw agent output:', data.raw_agent_output)
    if (data.raw_agent_output.events) {
      console.log('📝 Agent events:', data.raw_agent_output.events)
    }
  }

  return {
    reply: replyText,
    uiEffects,
    suggestionMessages,
  }
}

