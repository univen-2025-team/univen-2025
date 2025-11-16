'use client'

import { useState } from 'react'
import { TradingChatPanel } from '../trading-chat-panel'
import { ChatMessage } from '../types'
import { FeatureInstruction } from '@/features/types/features'

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    text: "Xin chào! Tôi là AI tư vấn giao dịch của bạn. Tôi có thể giúp gì cho bạn hôm nay?",
    createdAt: '09:00 AM',
  },
]

type ChatInterfaceProps = {
  onUiEffects?: (effects: FeatureInstruction[]) => void
}

export function ChatInterface({ onUiEffects }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages)
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = (text: string) => {
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

    setTimeout(() => {
      let botResponse: ChatMessage
      const effects: FeatureInstruction[] = []

      // Mock chatbot engine response
      const lowerText = text.toLowerCase()

      if (lowerText.includes('mua') || lowerText.includes('buy')) {
        // Extract symbol (e.g., "mua MWG" -> "MWG")
        const symbolMatch = text.toUpperCase().match(/\b[A-Z]{2,5}\b/)
        const symbol = symbolMatch ? symbolMatch[0] : 'MWG'

        effects.push({
          type: 'OPEN_BUY_STOCK',
          payload: {
            symbol,
            currentPrice: 81400, // Mock price
            steps: [
              {
                id: 'select-quantity',
                title: 'Chọn số lượng cổ phiếu',
                description: `Nhập số lượng cổ phiếu ${symbol} bạn muốn mua.`,
                helperText:
                  'Chỉ đầu tư số tiền bạn có thể chấp nhận mất. Đa dạng hóa danh mục đầu tư.',
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
                description:
                  'Kiểm tra chi tiết đơn hàng trước khi gửi. Đây là mô phỏng.',
                helperText: 'Kiểm tra kỹ tất cả thông tin để chính xác.',
              },
            ],
          },
        })

        botResponse = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          text: `Tôi sẽ mở giao diện mua ${symbol} cho bạn.`,
          createdAt: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }
      } else if (lowerText.includes('tin tức') || lowerText.includes('news')) {
        const newsItems = [
          {
            id: 'n1',
            title: 'NVIDIA Vượt Kỳ Vọng Thu Nhập Q3',
            source: 'Reuters',
            timeAgo: '2 giờ trước',
            sentiment: 'positive' as const,
          },
          {
            id: 'n2',
            title: 'Nhu Cầu Chip AI Thúc Đẩy Đà Tăng Công Nghệ',
            source: 'Bloomberg',
            timeAgo: '4 giờ trước',
            sentiment: 'positive' as const,
          },
          {
            id: 'n3',
            title: 'Fed Báo Hiệu Có Thể Giữ Lãi Suất',
            source: 'AP',
            timeAgo: '1 giờ trước',
            sentiment: 'neutral' as const,
          },
        ]

        effects.push({
          type: 'OPEN_NEWS',
          payload: {
            items: newsItems,
          },
        })

        botResponse = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          text: 'Đây là tin tức thị trường mới nhất:',
          createdAt: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }
      } else if (lowerText.includes('chi tiết') || lowerText.includes('detail')) {
        // Extract symbol
        const symbolMatch = text.toUpperCase().match(/\b[A-Z]{2,5}\b/)
        const symbol = symbolMatch ? symbolMatch[0] : 'MWG'

        effects.push({
          type: 'OPEN_STOCK_DETAIL',
          payload: {
            symbol,
            name: `${symbol} Corporation`,
            description: `Thông tin chi tiết về cổ phiếu ${symbol}`,
            price: 81400,
            changePercent: 1.62,
            intradayChart: [
              { time: '09:00', value: 80000 },
              { time: '10:00', value: 80200 },
              { time: '11:00', value: 80500 },
              { time: '13:00', value: 80800 },
              { time: '14:00', value: 81200 },
              { time: '14:40', value: 81400 },
            ],
          },
        })

        botResponse = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          text: `Đây là thông tin chi tiết về ${symbol}:`,
          createdAt: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }
      } else {
        botResponse = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          text: 'Tôi có thể giúp bạn phân tích thị trường, xem tin tức, hoặc hướng dẫn bạn mua cổ phiếu. Bạn muốn biết gì?',
          createdAt: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }
      }

      // Send UI effects to parent
      if (effects.length > 0 && onUiEffects) {
        onUiEffects(effects)
      }

      setMessages((prev) => [...prev, botResponse])
      setIsLoading(false)
    }, 1000)
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  const defaultSuggestions = [
    'Tin tức thị trường',
    'Mua MWG',
    'Chi tiết VCB',
    'Top cổ phiếu hôm nay',
  ]

  return (
    <TradingChatPanel
      messages={messages}
      isLoading={isLoading}
      suggestions={defaultSuggestions}
      onSendMessage={handleSendMessage}
      onSuggestionClick={handleSuggestionClick}
    />
  )
}
