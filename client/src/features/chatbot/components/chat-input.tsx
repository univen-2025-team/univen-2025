'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

type ChatInputProps = {
  onSend: (value: string) => void
  isLoading?: boolean
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    onSend(input)
    setInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend()
    }
  }

  return (
    <div className="flex gap-2 border-t border-border/30 pt-3">
      <Input
        placeholder={isLoading ? 'Đang xử lý...' : 'Ask your AI advisor…'}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={isLoading}
        className="flex-1 text-sm"
      />
      <Button
        size="sm"
        onClick={handleSend}
        disabled={isLoading || !input.trim()}
        className="px-3"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}
