'use client'

import { TradingChatPanel } from '../trading-chat-panel'
import { FeatureInstruction } from '@/features/types/features'
import { useChat } from '../hooks/useChat'

type ChatInterfaceProps = {
  onUiEffects?: (effects: FeatureInstruction[]) => void
}

export function ChatInterface({ onUiEffects }: ChatInterfaceProps) {
  const {
    messages,
    isLoading,
    hasComponentLoaded,
    suggestions,
    handleSendMessage,
    handleSuggestionClick,
  } = useChat({ onUiEffects })

  return (
    <TradingChatPanel
      messages={messages}
      isLoading={isLoading}
      suggestions={suggestions}
      onSendMessage={handleSendMessage}
      onSuggestionClick={handleSuggestionClick}
      hasComponentLoaded={hasComponentLoaded}
    />
  )
}
