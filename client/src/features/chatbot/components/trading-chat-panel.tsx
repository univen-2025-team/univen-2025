'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Trash2 } from 'lucide-react';
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
    hasComponentLoaded,
    onClearStorage
}: TradingChatPanelProps) {
    return (
        <div className="flex h-full flex-col gap-0 bg-white">
            {/* Clear Storage Icon */}
            {onClearStorage && (
                <div className="flex justify-end p-2 border-b border-gray-100">
                    <button
                        onClick={onClearStorage}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                        title="Xóa dữ liệu chat"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}
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
