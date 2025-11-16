'use client'

import { ChatMessage } from './types'

type ChatMessageListProps = {
  messages: ChatMessage[]
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
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
                  ? 'bg-blue-500 text-white rounded-br-none'
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
    </div>
  )
}
