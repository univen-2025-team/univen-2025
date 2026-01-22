import { FeatureInstruction } from '@/features/types/features'
import { ChatMessage, SuggestionMessage } from '../components/types'
import { userApi, type UserProfile } from '@/lib/api/user.api'
import { getLatestMarketData, getStockData, getStockDetails } from '@/lib/api/market-cache'
import { API_URL, NEXT_PUBLIC_AGENT_API, NEXT_PUBLIC_AGENT_HF } from '@/config/app'

// Không cần import Groq SDK nữa, dùng fetch trực tiếp

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
  navigation?: string | null // Navigation route (optional)
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
 * Lấy HuggingFace Agent URL từ config (ưu tiên cao nhất)
 */
export const getHuggingFaceUrl = (): string => {
  return NEXT_PUBLIC_AGENT_HF || ''
}

/**
 * Lấy AGENT_API từ config - KHÔNG CÒN FALLBACK đến render
 * Chỉ dùng khi NEXT_PUBLIC_AGENT_API được set trong .env
 */
export const getAgentApiUrl = (): string => {
  return NEXT_PUBLIC_AGENT_API || ''
}

/**
 * Check if HuggingFace is configured
 */
export const isHuggingFaceConfigured = (): boolean => {
  return !!NEXT_PUBLIC_AGENT_HF
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
  }
  // KHÔNG tự động tạo effect cho symbol đơn thuần - đợi response từ API
  // Nếu chỉ là symbol (không có từ khóa), không tạo default effect
  // Component sẽ được tạo từ API response (Groq hoặc AGENT_API)

  return effects
}

/**
 * Build conversation history từ messages
 * Đảm bảo message cuối cùng là từ user (theo tài liệu Frontend Integration Guide)
 */
export const buildConversationHistory = (messages: ChatMessage[], maxContext: number = 3): Array<{ role: 'user' | 'assistant'; content: string }> => {
  // Lọc bỏ system messages và map sang format API
  let history: Array<{ role: 'user' | 'assistant'; content: string }> = messages
    .filter((msg) => msg.role !== 'system') // Loại bỏ system messages
    .map((msg) => ({
      role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.text,
    }))

  // Giới hạn chỉ lấy maxContext cặp user-assistant gần nhất (tức là 2 * maxContext messages)
  // Nhưng đảm bảo message cuối cùng là từ user
  if (history.length > maxContext * 2) {
    // Lấy maxContext * 2 messages gần nhất
    history = history.slice(-maxContext * 2)
    
    // Nếu message cuối cùng không phải từ user, loại bỏ nó
    if (history.length > 0 && history[history.length - 1].role !== 'user') {
      history = history.slice(0, -1)
    }
    
    console.log(`📝 Limited conversation history to ${maxContext} contexts (${history.length} messages)`)
  }

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
 * Groq API Models - với fallback khi hết token
 */
const GROQ_MODELS = [
  'groq/compound',
  'llama-3.1-8b-instant', // Fast, ít token
  'llama-3.3-70b-versatile', // Medium, nhiều token hơn
  'llama-3.1-70b-versatile', // Large, nhiều token nhất (fallback)
] as const

/**
 * Parse intent từ Groq response và map sang UI effects
 * Sử dụng cả text và reply để phân loại chính xác hơn
 */
const parseGroqIntent = (userText: string, groqReply: string): FeatureInstruction[] => {
  const effects: FeatureInstruction[] = []
  const lowerUserText = userText.toLowerCase()
  const lowerReply = groqReply.toLowerCase()
  const combinedText = `${lowerUserText} ${lowerReply}`
  const symbol = extractSymbol(userText) || extractSymbol(groqReply)

  // Phân loại intent - ưu tiên các pattern cụ thể
  if (
    combinedText.includes('thị trường') ||
    combinedText.includes('market') ||
    combinedText.includes('tổng quan') ||
    combinedText.includes('vn30') ||
    combinedText.includes('index') ||
    (combinedText.includes('top') && (combinedText.includes('cổ phiếu') || combinedText.includes('hôm nay'))) ||
    combinedText.includes('cổ phiếu hôm nay') ||
    combinedText.includes('top cổ phiếu')
  ) {
    effects.push({ type: 'SHOW_MARKET_OVERVIEW' })
  } else if (
    combinedText.includes('mua') ||
    combinedText.includes('buy') ||
    combinedText.includes('đặt lệnh mua') ||
    combinedText.includes('mua cổ phiếu')
  ) {
    const stockSymbol = symbol || 'MWG'
    effects.push({
      type: 'OPEN_BUY_STOCK',
      payload: {
        symbol: stockSymbol,
        currentPrice: 0,
        steps: [],
      },
    })
  } else if (
    combinedText.includes('bán') ||
    combinedText.includes('sell') ||
    combinedText.includes('đặt lệnh bán') ||
    combinedText.includes('bán cổ phiếu')
  ) {
    const stockSymbol = symbol || 'MWG'
    effects.push({
      type: 'OPEN_SELL_STOCK',
      payload: {
        symbol: stockSymbol,
        currentPrice: 0,
        availableQuantity: 0,
        steps: [],
      },
    })
  } else if (
    combinedText.includes('tin tức') ||
    combinedText.includes('news') ||
    combinedText.includes('tin tức thị trường')
  ) {
    effects.push({
      type: 'OPEN_NEWS',
      payload: {
        symbol,
        items: [],
      },
    })
  } else if (
    combinedText.includes('chi tiết') ||
    combinedText.includes('detail') ||
    combinedText.includes('giá') ||
    symbol ||
    combinedText.includes('thông tin cổ phiếu')
  ) {
    const stockSymbol = symbol || 'MWG'
    effects.push({
      type: 'OPEN_STOCK_DETAIL',
      payload: {
        symbol: stockSymbol,
        name: `${stockSymbol} Corporation`,
        description: `Thông tin chi tiết về cổ phiếu ${stockSymbol}`,
        price: 0,
        changePercent: 0,
        intradayChart: [],
      },
    })
  } else if (
    (combinedText.includes('xác nhận') ||
      combinedText.includes('confirm') ||
      combinedText.includes('xác nhận giao dịch')) &&
    // CHỈ tạo CONFIRM_TRANSACTION nếu KHÔNG có "mua" hoặc "bán" đơn thuần (để tránh nhầm với OPEN_BUY_STOCK/OPEN_SELL_STOCK)
    !(combinedText.includes('mua') && !combinedText.includes('xác nhận mua')) &&
    !(combinedText.includes('bán') && !combinedText.includes('xác nhận bán')) &&
    !(combinedText.includes('buy') && !combinedText.includes('confirm buy')) &&
    !(combinedText.includes('sell') && !combinedText.includes('confirm sell'))
  ) {
    effects.push({
      type: 'CONFIRM_TRANSACTION',
      payload: {
        symbol: symbol || '',
        type: 'buy',
        quantity: 0,
        price: 0,
        totalAmount: 0,
        userId: '',
      },
    })
  } else if (
    combinedText.includes('tài khoản') ||
    combinedText.includes('profile') ||
    combinedText.includes('thông tin cá nhân') ||
    combinedText.includes('số dư')
  ) {
    effects.push({
      type: 'SHOW_USER_PROFILE',
      payload: {
        userId: '',
      },
    })
  } else if (
    combinedText.includes('lịch sử') ||
    combinedText.includes('history') ||
    combinedText.includes('giao dịch đã thực hiện') ||
    combinedText.includes('lịch sử giao dịch')
  ) {
    effects.push({
      type: 'SHOW_TRANSACTION_HISTORY',
      payload: {
        userId: '',
        transactions: [],
      },
    })
  } else if (
    combinedText.includes('thống kê') ||
    combinedText.includes('stats') ||
    combinedText.includes('tổng kết') ||
    combinedText.includes('thống kê giao dịch')
  ) {
    effects.push({
      type: 'SHOW_TRANSACTION_STATS',
      payload: {
        userId: '',
      },
    })
  } else if (
    (combinedText.includes('xếp hạng') ||
      combinedText.includes('ranking') ||
      combinedText.includes('bảng xếp hạng')) &&
    !combinedText.includes('cổ phiếu') // Loại trừ "top cổ phiếu"
  ) {
    effects.push({
      type: 'SHOW_RANKING',
      payload: {
        rankings: [],
      },
    })
  }

  // Nếu không tìm thấy intent nào, trả về market overview mặc định
  if (effects.length === 0) {
    effects.push({ type: 'SHOW_MARKET_OVERVIEW' })
  }

  return effects
}

/**
 * Gọi Groq API với fallback models
 * Export để dùng trong useChat
 * Sử dụng fetch trực tiếp thay vì SDK để tránh CORS issues
 */
export const callGroqAPI = async (
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  modelIndex: number = 0
): Promise<{ reply: string; uiEffects: FeatureInstruction[]; suggestions: SuggestionMessage[]; navigation: string | null } | null> => {
  if (modelIndex >= GROQ_MODELS.length) {
    console.log('❌ All Groq models exhausted')
    return null
  }

  const model = GROQ_MODELS[modelIndex]

  try {
    console.log(`🤖 Calling Groq API via Next.js endpoint with model: ${model}`)

    const systemPrompt = `Bạn là trợ lý chứng khoán Việt Nam. Phân tích câu hỏi của người dùng và trả lời ngắn gọn, rõ ràng bằng tiếng Việt.

Dựa trên câu hỏi từ người dùng, trả về một trong các effect sau (chỉ trả về tên effect, không có description):
- SHOW_MARKET_OVERVIEW: Xem tổng quan thị trường
- OPEN_BUY_STOCK: Mua cổ phiếu (khi user muốn BẮT ĐẦU mua, ví dụ: "mua VCB", "mua cổ phiếu MWG")
- OPEN_SELL_STOCK: Bán cổ phiếu (khi user muốn BẮT ĐẦU bán, ví dụ: "bán VCB")
- OPEN_NEWS: Xem tin tức
- OPEN_STOCK_DETAIL: Xem chi tiết cổ phiếu
- CONFIRM_TRANSACTION: CHỈ dùng khi user đã điền form và XÁC NHẬN giao dịch (ví dụ: "xác nhận mua VCB", "xác nhận giao dịch")
- SHOW_USER_PROFILE: Xem thông tin tài khoản
- SHOW_TRANSACTION_HISTORY: Xem lịch sử giao dịch
- SHOW_TRANSACTION_STATS: Xem thống kê giao dịch
- SHOW_RANKING: Xem bảng xếp hạng
- STOCK_SUGGESTIONS: gợi ý mã cổ phiếu (khi user nói "gợi ý cổ phiếu", "gợi ý mã cổ phiếu") phù hợp với user - là người mới bắt đầu Một vài mã: VNM,FPT,HPG,VCB,MWG,VIC
- NONE: không có effect nào

NAVIGATION (QUAN TRỌNG): Nếu user muốn mua cổ phiếu hoặc thực hiện action ở sidebar, trả về navigation path tương ứng:
- "mua [symbol]", "buy [symbol]", "muốn mua", "tôi muốn mua" → navigation: "/dashboard/trade"
- "xem thị trường", "thị trường", "market" → navigation: "/dashboard/market"
- "tin tức", "news", "xem tin tức" → navigation: "/dashboard/news"
- "danh mục", "portfolio", "xem danh mục" → navigation: "/dashboard/portfolio"
- "giao dịch", "trade", "xem giao dịch" → navigation: "/dashboard/trade"
- "bảng xếp hạng", "ranking", "xem ranking" → navigation: "/dashboard/ranking"
- "phân tích", "stock analysis", "xem phân tích" → navigation: "/dashboard/stock-analysis"
- "học đầu tư", "learn", "học tập" → navigation: "/dashboard/learn-trading"
- "lịch sử", "history", "xem lịch sử" → navigation: "/dashboard/history"
- "huy hiệu", "badges", "xem huy hiệu" → navigation: "/dashboard/badges"
- "trang chủ", "home", "dashboard" → navigation: "/dashboard"
- Nếu không cần navigate, trả về navigation: null

QUAN TRỌNG: 
- Khi user nói "mua [symbol]" hoặc "buy [symbol]" → dùng OPEN_BUY_STOCK VÀ navigation: "/dashboard/trade"
- CONFIRM_TRANSACTION chỉ dùng khi user nói "xác nhận", "confirm", "xác nhận mua/bán"
- Nếu không có effect phù hợp, trả về uiEffects là "NONE" cho uiEffects.

BẮT BUỘC trả về theo cấu trúc JSON hợp lệ (không có markdown, không có code block):
{
  "reply": "Câu trả lời thân thiện, liên quan đến câu hỏi của người dùng bằng tiếng Việt",
  "uiEffects": "Tên effect (chỉ một effect, không có dấu ngoặc vuông)",
  "suggestions": ["Gợi ý 1", "Gợi ý 2", "Gợi ý 3"],
  "navigation": "/dashboard/trade" hoặc null (đường dẫn để navigate, hoặc null nếu không cần navigate)
}`

    // Gọi Next.js API endpoint để gọi Groq từ server-side
    const response = await fetch('/api/groq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.filter(m => m.role !== 'system'),
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.log(`❌ Groq API error (${response.status}):`, errorData)

      // Thử model tiếp theo nếu lỗi do token limit
      if (response.status === 429 || response.status === 413 || errorData.error?.includes('token')) {
        console.warn(`⚠️ Token limit reached for ${model}, trying next model...`)
        return callGroqAPI(messages, modelIndex + 1)
      }

      return null
    }

    const data = await response.json()
    const rawContent = data.content || ''
    const lastUserMessage = messages[messages.length - 1]?.content || ''

    console.log('🔍 ========== GROQ API RESPONSE DEBUG ==========')
    console.log('📥 Raw response from Groq:', rawContent)
    console.log('📝 Last user message:', lastUserMessage)
    console.log('🤖 Model used:', model)

    // Parse JSON từ reply
    let parsedData: {
      reply?: string
      uiEffects?: string
      suggestions?: string[]
      navigation?: string | null
    } = {}

    try {
      // Loại bỏ markdown code blocks nếu có
      let jsonString = rawContent.trim()
      console.log('🧹 Original JSON string length:', jsonString.length)
      console.log('🧹 First 200 chars:', jsonString.substring(0, 200))

      if (jsonString.startsWith('```json')) {
        console.log('🔧 Removing ```json markdown wrapper...')
        jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (jsonString.startsWith('```')) {
        console.log('🔧 Removing ``` markdown wrapper...')
        jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }

      console.log('📦 Cleaned JSON string length:', jsonString.length)
      console.log('📦 Cleaned JSON string:', jsonString)

      parsedData = JSON.parse(jsonString)
      console.log('✅ Successfully parsed JSON!')
      console.log('📦 Parsed data:', JSON.stringify(parsedData, null, 2))
      console.log('📦 Parsed reply:', parsedData.reply)
      console.log('📦 Parsed uiEffects:', parsedData.uiEffects)
      console.log('📦 Parsed suggestions:', parsedData.suggestions)
      console.log('📦 Parsed navigation:', parsedData.navigation)
    } catch (parseError) {
      console.log('❌ Failed to parse Groq JSON!')
      console.log('❌ Parse error:', parseError)
      console.log('❌ Raw content that failed:', rawContent)
      console.warn('⚠️ Falling back to text parsing...')
      // Fallback: dùng text parsing
      const uiEffects = parseGroqIntent(lastUserMessage, rawContent)
      // Nếu fallback parsing không có effect, dùng SHOW_MARKET_OVERVIEW
      const finalEffects: FeatureInstruction[] = uiEffects.length > 0 ? uiEffects : [{ type: 'SHOW_MARKET_OVERVIEW' }]
      const suggestions: SuggestionMessage[] = [
        { text: 'Xem tổng quan thị trường', icon: '🌐' },
        { text: 'Tìm hiểu thêm', icon: '❓' },
      ]
      console.log('🔄 Fallback result:', { reply: rawContent, uiEffects: finalEffects, suggestions })
      return {
        reply: rawContent || 'Xin lỗi, tôi không thể trả lời câu hỏi này.',
        uiEffects: finalEffects,
        suggestions,
        navigation: null,
      }
    }

    // Extract reply
    const reply = parsedData.reply || rawContent || 'Xin lỗi, tôi không thể trả lời câu hỏi này.'
    console.log('💬 Final reply:', reply)

    // Parse uiEffects từ string thành FeatureInstruction[]
    let uiEffects: FeatureInstruction[] = []
    const uiEffectString = parsedData.uiEffects?.trim().toUpperCase()
    console.log('🎯 uiEffectString (raw):', parsedData.uiEffects)
    console.log('🎯 uiEffectString (uppercase):', uiEffectString)

    if (uiEffectString && uiEffectString !== 'NONE') {
      // Parse effect string thành FeatureInstruction
      const symbol = extractSymbol(lastUserMessage) || extractSymbol(reply)
      console.log('🔤 Extracted symbol:', symbol)
      console.log('🔄 Processing effect:', uiEffectString)

      switch (uiEffectString) {
        case 'SHOW_MARKET_OVERVIEW':
          console.log('✅ Matched: SHOW_MARKET_OVERVIEW')
          uiEffects.push({ type: 'SHOW_MARKET_OVERVIEW' })
          break
        case 'OPEN_BUY_STOCK':
          uiEffects.push({
            type: 'OPEN_BUY_STOCK',
            payload: {
              symbol: symbol || 'MWG',
              currentPrice: 0,
              steps: [],
            },
          })
          break
        case 'OPEN_SELL_STOCK':
          uiEffects.push({
            type: 'OPEN_SELL_STOCK',
            payload: {
              symbol: symbol || 'MWG',
              currentPrice: 0,
              availableQuantity: 0,
              steps: [],
            },
          })
          break
        case 'OPEN_NEWS':
          uiEffects.push({
            type: 'OPEN_NEWS',
            payload: {
              symbol,
              items: [],
            },
          })
          break
        case 'OPEN_STOCK_DETAIL':
          uiEffects.push({
            type: 'OPEN_STOCK_DETAIL',
            payload: {
              symbol: symbol || 'MWG',
              name: `${symbol || 'MWG'} Corporation`,
              description: `Thông tin chi tiết về cổ phiếu ${symbol || 'MWG'}`,
              price: 0,
              changePercent: 0,
              intradayChart: [],
            },
          })
          break
        case 'CONFIRM_TRANSACTION':
          // CHỈ tạo CONFIRM_TRANSACTION nếu user thực sự xác nhận (có từ "xác nhận" trong text)
          const userTextLower = lastUserMessage.toLowerCase()
          const replyLower = reply.toLowerCase()
          const hasConfirmKeyword =
            userTextLower.includes('xác nhận') ||
            userTextLower.includes('confirm') ||
            replyLower.includes('xác nhận') ||
            replyLower.includes('confirm')

          if (hasConfirmKeyword) {
            uiEffects.push({
              type: 'CONFIRM_TRANSACTION',
              payload: {
                symbol: symbol || '',
                type: 'buy',
                quantity: 0,
                price: 0,
                totalAmount: 0,
                userId: '',
              },
            })
          } else {
            // Nếu không có từ "xác nhận" nhưng Groq trả về CONFIRM_TRANSACTION
            // → Có thể là nhầm lẫn, fallback về OPEN_BUY_STOCK nếu có "mua" trong text
            console.warn('⚠️ Groq returned CONFIRM_TRANSACTION but no confirm keyword found. Checking for buy/sell intent...')
            if (userTextLower.includes('mua') || userTextLower.includes('buy')) {
              console.log('🔄 Converting CONFIRM_TRANSACTION to OPEN_BUY_STOCK')
              uiEffects.push({
                type: 'OPEN_BUY_STOCK',
                payload: {
                  symbol: symbol || 'MWG',
                  currentPrice: 0,
                  steps: [],
                },
              })
            } else if (userTextLower.includes('bán') || userTextLower.includes('sell')) {
              console.log('🔄 Converting CONFIRM_TRANSACTION to OPEN_SELL_STOCK')
              uiEffects.push({
                type: 'OPEN_SELL_STOCK',
                payload: {
                  symbol: symbol || 'MWG',
                  currentPrice: 0,
                  availableQuantity: 0,
                  steps: [],
                },
              })
            } else {
              // Nếu không rõ, giữ nguyên CONFIRM_TRANSACTION nhưng log warning
              console.warn('⚠️ Keeping CONFIRM_TRANSACTION but no clear intent detected')
              uiEffects.push({
                type: 'CONFIRM_TRANSACTION',
                payload: {
                  symbol: symbol || '',
                  type: 'buy',
                  quantity: 0,
                  price: 0,
                  totalAmount: 0,
                  userId: '',
                },
              })
            }
          }
          break
        case 'SHOW_USER_PROFILE':
          uiEffects.push({
            type: 'SHOW_USER_PROFILE',
            payload: {
              userId: '',
            },
          })
          break
        case 'SHOW_TRANSACTION_HISTORY':
          uiEffects.push({
            type: 'SHOW_TRANSACTION_HISTORY',
            payload: {
              userId: '',
              transactions: [],
            },
          })
          break
        case 'SHOW_TRANSACTION_STATS':
          uiEffects.push({
            type: 'SHOW_TRANSACTION_STATS',
            payload: {
              userId: '',
            },
          })
          break
        case 'SHOW_RANKING':
          uiEffects.push({
            type: 'SHOW_RANKING',
            payload: {
              rankings: [],
            },
          })
          break
        default:
          // Fallback: dùng parseGroqIntent nếu không match
          console.warn(`⚠️ Unknown uiEffect: "${uiEffectString}", using fallback parsing`)
          uiEffects = parseGroqIntent(lastUserMessage, reply)
          console.log('🔄 Fallback parsing result:', uiEffects)
      }
    } else {
      // Nếu không có effect hoặc là "NONE", tự động load SHOW_MARKET_OVERVIEW
      console.log('⚠️ No uiEffect or "NONE", defaulting to SHOW_MARKET_OVERVIEW')
      uiEffects = [{ type: 'SHOW_MARKET_OVERVIEW' }]
    }

    console.log('🎨 Final uiEffects:', JSON.stringify(uiEffects, null, 2))

    // Parse suggestions từ string[] thành SuggestionMessage[]
    const suggestions: SuggestionMessage[] = parsedData.suggestions
      ? parsedData.suggestions.map((text, index) => ({
        text: text.trim(),
        icon: index === 0 ? '🌐' : index === 1 ? '❓' : '💡',
      }))
      : [
        { text: 'Xem tổng quan thị trường', icon: '🌐' },
        { text: 'Tìm hiểu thêm', icon: '❓' },
      ]

    console.log('💡 Final suggestions:', suggestions)

    console.log(`✅ ========== GROQ API RESPONSE SUMMARY ==========`)
    console.log(`✅ Model: ${model}`)
    console.log(`✅ Reply length: ${reply.length} chars`)
    console.log(`✅ Reply preview: ${reply.substring(0, 100)}...`)
    console.log(`✅ UI Effects count: ${uiEffects.length}`)
    console.log(`✅ Suggestions count: ${suggestions.length}`)
    console.log(`✅ Navigation: ${parsedData.navigation || 'null'}`)
    console.log(`✅ ================================================`)

    return { 
      reply, 
      uiEffects, 
      suggestions,
      navigation: parsedData.navigation || null
    }
  } catch (error: any) {
    // Nếu lỗi do token limit, thử model tiếp theo
    if (error?.message?.includes('token') || error?.status === 429 || error?.status === 413) {
      console.warn(`⚠️ Token limit reached for ${model}, trying next model...`)
      return callGroqAPI(messages, modelIndex + 1)
    }

    console.log(`❌ Groq API error (model: ${model}):`, error)
    return null
  }
}

/**
 * Gọi HuggingFace API trực tiếp để lấy reply/uiEffects/suggestions
 * Dùng cho BƯỚC 1 trong useChat (thay thế Groq khi HF được config)
 */
export const callHuggingFaceForIntent = async (
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
): Promise<{ reply: string; uiEffects: FeatureInstruction[]; suggestions: SuggestionMessage[]; navigation: string | null } | null> => {
  const hfUrl = getHuggingFaceUrl()

  if (!hfUrl) {
    return null
  }

  console.log('🤗 Calling HuggingFace API for intent classification...')

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout for cold start

  try {
    const response = await fetch('/api/huggingface', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `${hfUrl}/api/v1/chat`,
        messages,
        meta: {
          user_id: 'guest',
          session_id: `session_${Date.now()}`,
          locale: 'vi-VN',
        },
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.log('❌ HuggingFace API error:', response.status)
      return null
    }

    const data = await response.json()
    console.log('✅ HuggingFace API response:', {
      hasReply: !!data.reply,
      uiEffectsCount: data.ui_effects?.length || 0,
      suggestionsCount: data.suggestion_messages?.length || 0,
    })

    return {
      reply: data.reply || 'Xin lỗi, tôi không thể trả lời câu hỏi này.',
      uiEffects: data.ui_effects || [{ type: 'SHOW_MARKET_OVERVIEW' }],
      suggestions: data.suggestion_messages || [
        { text: 'Xem tổng quan thị trường', icon: '🌐' },
        { text: 'Tìm hiểu thêm', icon: '❓' },
      ],
      navigation: data.navigation || null,
    }
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      console.warn('⏱️ HuggingFace API timeout for intent')
    } else {
      console.log('❌ HuggingFace API error:', error)
    }
    return null
  }
}

/**
 * Gọi API với priority order: HuggingFace > Groq
 * Dùng cho BƯỚC 1 trong useChat (phân loại intent)
 */
export const callPrimaryAPI = async (
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
): Promise<{ reply: string; uiEffects: FeatureInstruction[]; suggestions: SuggestionMessage[]; navigation: string | null } | null> => {
  const hfConfigured = isHuggingFaceConfigured()

  console.log('🔧 Primary API Config:', {
    huggingFaceConfigured: hfConfigured,
    huggingFaceUrl: getHuggingFaceUrl() || '(not set)',
  })

  // Priority 1: HuggingFace (nếu được config)
  if (hfConfigured) {
    console.log('🚀 Priority 1: Trying HuggingFace API...')
    const hfResult = await callHuggingFaceForIntent(messages)
    if (hfResult) {
      return hfResult;
    }
    console.warn('⚠️ HuggingFace failed, falling back to Groq...')
  } else {
    console.log('⚠️ HuggingFace not configured, skipping to Groq...')
  }

  // Priority 2: Groq (fallback)
  console.log('🤖 Priority 2: Trying Groq API...')
  return callGroqAPI(messages)
}

/**
 * Gọi HuggingFace API qua Next.js endpoint (để bảo mật token)
 */
export const callHuggingFaceAPI = async (
  request: ChatRequest
): Promise<{ data: ChatApiResponse | null; error: Error | null }> => {
  const hfUrl = getHuggingFaceUrl()

  if (!hfUrl) {
    console.log('⚠️ HuggingFace URL not configured, skipping...')
    return { data: null, error: new Error('HuggingFace URL not configured') }
  }

  console.log('🤗 Calling HuggingFace API via Next.js endpoint:', hfUrl)
  console.log('📋 Request meta:', request.meta)

  // Timeout 10 giây cho HuggingFace (có thể cold start)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch('/api/huggingface', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `${hfUrl}/api/v1/chat`,
        messages: request.messages,
        meta: request.meta,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.log('❌ HuggingFace API error:', {
        status: response.status,
        error: errorData,
      })
      return {
        data: null,
        error: new Error(`HuggingFace error: ${response.status}`),
      }
    }

    const responseData = await response.json()
    console.log('✅ HuggingFace API response received:', {
      hasReply: !!responseData.reply,
      uiEffectsCount: responseData.ui_effects?.length || 0,
      suggestionsCount: responseData.suggestion_messages?.length || 0,
    })

    return {
      data: responseData as ChatApiResponse,
      error: null,
    }
  } catch (error: any) {
    clearTimeout(timeoutId)

    if (error.name === 'AbortError') {
      console.warn('⏱️ HuggingFace API timeout')
      return { data: null, error: new Error('HuggingFace timeout') }
    }

    console.log('❌ HuggingFace API error:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('HuggingFace network error'),
    }
  }
}

/**
 * Gửi message đến Agent API với fallback Groq
 * Ưu tiên: NEXT_PUBLIC_AGENT_HF > NEXT_PUBLIC_AGENT_API > Groq
 */
export const sendChatMessage = async (
  request: ChatRequest,
  agentApiUrl: string
): Promise<{ data: ChatApiResponse | null; error: Error | null }> => {
  // ============================================
  // Xác định URL Agent (ưu tiên HuggingFace)
  // ============================================
  const hfUrl = getHuggingFaceUrl()
  const finalAgentUrl = hfUrl || agentApiUrl
  const isUsingHF = !!hfUrl

  console.log('🔧 Agent URL Config:', {
    huggingFaceUrl: hfUrl || '(not set)',
    agentApiUrl: agentApiUrl || '(not set)',
    using: isUsingHF ? 'HuggingFace' : 'AGENT_API',
  })

  // ============================================
  // Gọi Agent API qua proxy để tránh CORS
  // ============================================
  const apiUrl = `${finalAgentUrl}/api/v1/chat`

  // Log chi tiết để debug full context và meta
  console.log(`🔗 Calling ${isUsingHF ? 'HuggingFace' : 'AGENT_API'} via proxy:`, apiUrl)
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

  // Timeout 8 giây cho AGENT_API (có thể cold start)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    // Gọi qua Next.js API proxy để tránh CORS
    // Dùng /api/huggingface nếu là HF (có token), /api/agent nếu là AGENT_API
    const proxyEndpoint = isUsingHF ? '/api/huggingface' : '/api/agent'

    console.log(`📡 Using proxy endpoint: ${proxyEndpoint}`)

    const response = await fetch(proxyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: apiUrl,
        messages: request.messages,
        meta: request.meta,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ AGENT_API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        error: errorText,
        userId: request.meta.user_id,
      })

      // Fallback to Groq khi lỗi
      console.warn('⚠️ AGENT_API error, falling back to Groq...')
      const groqResult = await callGroqAPI(request.messages)
      if (groqResult) {
        return {
          data: {
            reply: groqResult.reply,
            ui_effects: groqResult.uiEffects,
            suggestion_messages: groqResult.suggestions,
          },
          error: null,
        }
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
  } catch (fetchError: any) {
    clearTimeout(timeoutId)

    // Console log chi tiết cho developer
    const isTimeout = fetchError?.name === 'AbortError'
    console.log('❌ AGENT_API Error:', {
      error: fetchError,
      url: apiUrl,
      userId: request.meta.user_id,
      message: fetchError instanceof Error ? fetchError.message : 'Unknown error',
      isTimeout,
    })

    // Fallback to Groq khi network error hoặc timeout
    console.warn(isTimeout ? '⏱️ AGENT_API timeout, falling back to Groq...' : '⚠️ AGENT_API network error, falling back to Groq...')

    // Fallback to Groq khi network error
    console.warn('⚠️ AGENT_API network error, falling back to Groq...')
    const groqResult = await callGroqAPI(request.messages)
    if (groqResult) {
      return {
        data: {
          reply: groqResult.reply,
          ui_effects: groqResult.uiEffects,
          suggestion_messages: groqResult.suggestions,
        },
        error: null,
      }
    }

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
          // Gọi cả getStockData và getStockDetails để lấy đầy đủ thông tin
          const [stockData, stockDetails] = await Promise.all([
            getStockData(symbol),
            getStockDetails(symbol)
          ])

          if (stockData) {
            const companyName =
              stockDetails?.info?.enOrganShortName ||
              stockDetails?.info?.organShortName ||
              stockDetails?.info?.organName ||
              stockData.symbol

            const description =
              stockDetails?.profile?.description ||
              `Thông tin chi tiết về ${stockData.symbol}`

            enhancedEffects = [{
              type: 'OPEN_STOCK_DETAIL',
              payload: {
                symbol: stockData.symbol,
                name: companyName,
                description: description,
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
          console.log(`❌ Error fetching stock data for ${symbol} from backend:`, {
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
    console.log('❌ Backend market API error:', {
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

