'use client';

import { ChatMessage } from './types';
import { Loader2 } from 'lucide-react';

type ChatMessageListProps = {
    messages: ChatMessage[];
    isLoading?: boolean;
    hasComponentLoaded?: boolean; // Component đã được load chưa
};

export function ChatMessageList({ messages, isLoading, hasComponentLoaded }: ChatMessageListProps) {
    return (
        <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-[#23243a] scrollbar-track-[#18192a] scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
            {messages.map((message) => (
                <div key={message.id}>
                    <div
                        className={`flex ${
                            message.role === 'user'
                                ? 'justify-end items-end'
                                : 'justify-start items-start'
                        }`}
                    >
                        <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-lg backdrop-blur-md ${
                                message.role === 'user'
                                    ? 'bg-gradient-to-br from-violet-800/80 to-fuchsia-900/80 text-white rounded-br-none border border-violet-900/40'
                                    : 'bg-[#23243a]/80 text-white rounded-bl-none border border-white/10'
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
                        <span className="text-xs text-white/60 drop-shadow-sm">
                            {message.createdAt}
                        </span>
                    </div>
                </div>
            ))}

            {/* Thinking/Processing indicator */}
            {isLoading && (
                <div>
                    <div className="flex justify-start items-start">
                        <div className="max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-lg bg-[#23243a]/80 text-white rounded-bl-none border border-white/10 backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                                <span className="text-white/70 italic">
                                    {hasComponentLoaded ? 'Đang hoàn thiện...' : 'Đang suy nghĩ...'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
