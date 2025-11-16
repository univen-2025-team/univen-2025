"use client";
import { useState } from 'react'

import { useAuth } from "@/context/AuthContext";
import { useChatService} from '../hooks/useChatService';
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Chat } from '../components/Chat';
import { BlockMessages } from '../components/Block-messages';
import { MessageProps } from '@/lib/interface';

export default function ChatPage() {
  // Giả sử bạn đang test với chatId = '1'
  const conversationId = '1'
  const { userId } = useAuth()

  // Dùng hook service mới
  const { messages, isLoading, sendMessage } = useChatService(conversationId, userId)
  const [input, setInput] = useState<string>('')

  // Gọi sendMessage và xoá input
  const handleSubmit = () => {
    if (!input.trim()) return
    sendMessage(input.trim())
    setInput('')
  }

  return (
    <div className="container mx-auto p-4 w-screen h-[calc(100vh-2rem)] mt-10">
      <div className="flex flex-col h-full shadow-lg max-w-4xl mx-auto">
        <ScrollArea className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Start a conversation by sending a message...
              </div>
            ) : (
              <BlockMessages messages={messages} isLoading = {isLoading} />
            )
            }
          </div>
        </ScrollArea>

        <div className="relative flex h-full">
          <div className="flex-1 transition-all duration-300 mr-64">
            <Chat
              id={conversationId}
              isReadonly={false}
              messages={messages}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
