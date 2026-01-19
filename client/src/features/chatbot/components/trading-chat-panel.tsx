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
        <div className="flex h-full flex-col gap-0 bg-background">
            <div className="border-b border-border/30 py-3 px-4 flex items-center bg-gray-50/50">
                <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    AI Advisor
                </div>
            </div>

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
