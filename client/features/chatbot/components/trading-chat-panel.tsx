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
    onSuggestionClick
}: TradingChatPanelProps) {
    return (
        <Card className="flex h-full flex-col gap-0 pt-0 pb-0 bg-linear-to-br from-card to-card/95 border border-border/50 shadow-lg backdrop-blur-sm">
            <CardHeader className="border-b border-border/30 py-3 flex items-center">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageCircle className="h-5 w-5" />
                    AI Advisor
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col overflow-hidden p-4 pb-3">
                <ChatMessageList messages={messages} />

                <SuggestionChips suggestions={suggestions} onClick={onSuggestionClick} />

                <ChatInput onSend={onSendMessage} isLoading={isLoading} />
            </CardContent>
        </Card>
    );
}
