'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { TradingChatPanelProps } from './types';
import { ChatMessageList } from './chat-message-list';
import { SuggestionChips } from './suggestion-chips';
import { ChatInput } from './chat-input';

export function TradingChatPanel({
    messages,
    isLoading,
    suggestions,
    onSendMessage,
    onSuggestionClick,
    hasComponentLoaded
}: TradingChatPanelProps) {
    return (
        <div className="flex h-full flex-col gap-0 bg-white">
            <div className="flex flex-1 flex-col overflow-hidden p-4 pb-3">
                <ChatMessageList
                    messages={messages}
                    isLoading={isLoading}
                    hasComponentLoaded={hasComponentLoaded}
                />

                    {!isLoading && (
                        <SuggestionChips suggestions={suggestions} onClick={onSuggestionClick} />
                    )}

                <ChatInput onSend={onSendMessage} isLoading={isLoading} />
            </div>
        </div>
    );
}
