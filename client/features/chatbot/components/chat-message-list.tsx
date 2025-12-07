'use client'

import { ChatMessage } from './types'
import { Loader2 } from 'lucide-react'

type ChatMessageListProps = {
  messages: ChatMessage[]
  isLoading?: boolean
  hasComponentLoaded?: boolean // Component đã được load chưa
}

export function ChatMessageList({ messages, isLoading, hasComponentLoaded }: ChatMessageListProps) {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto">
      {messages.map((message) => (
        <div key={message.id}>
          <div
            className={`flex ${
              message.role === 'user' ? 'justify-end items-end' : 'justify-start items-start'
            }`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                message.role === 'user'
                  ? 'bg-primary/50 text-white rounded-br-none'
                  : 'bg-gray-100 text-slate-900 rounded-bl-none'
              }`}
            >
              {message.text}
            </div>
          </div>
          <div
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            } mt-1 px-3`}
          >
            <span className="text-xs text-slate-400">{message.createdAt}</span>
          </div>
        </div>
      ))}
      
      {/* Thinking/Processing indicator */}
      {isLoading && (
        <div>
          <div className="flex justify-start items-start">
            <div className="max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm bg-gray-100 text-slate-900 rounded-bl-none">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground italic">
                  {hasComponentLoaded ? 'Đang hoàn thiện...' : 'Đang suy nghĩ...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
