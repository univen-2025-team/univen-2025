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
        <div className="relative group/chat h-full">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-[#1a1333]/70 via-[#18192a]/80 to-[#2a1833]/70 rounded-3xl blur-xl opacity-70 group-hover/chat:opacity-90 transition duration-500 pointer-events-none"></div>
            <Card className="relative flex h-full flex-col gap-0 pt-0 pb-0 bg-[#18192a]/80 backdrop-blur-2xl border border-white/10 shadow-2xl ring-1 ring-white/10 rounded-3xl">
                <CardHeader className="border-b border-white/10 py-3 flex items-center bg-gradient-to-r from-[#2d2250]/60 to-[#2a1833]/40 rounded-t-3xl">
                    <CardTitle className="flex items-center gap-2 text-lg text-white drop-shadow">
                        <MessageCircle className="h-5 w-5 text-fuchsia-300" />
                        AI Advisor
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col overflow-hidden p-4 pb-3 text-white">
                    <ChatMessageList
                        messages={messages}
                        isLoading={isLoading}
                        hasComponentLoaded={hasComponentLoaded}
                    />

                    {!isLoading && (
                        <SuggestionChips suggestions={suggestions} onClick={onSuggestionClick} />
                    )}

                    <div className="pt-2">
                        <ChatInput onSend={onSendMessage} isLoading={isLoading} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
