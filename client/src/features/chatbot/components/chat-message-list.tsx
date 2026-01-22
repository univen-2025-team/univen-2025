'use client';

import { useState } from 'react';
import { ChatMessage } from './types';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type ChatMessageListProps = {
    messages: ChatMessage[];
    isLoading?: boolean;
    hasComponentLoaded?: boolean; // Component đã được load chưa
};

// Kiểm tra xem message có phải từ tính năng "Giải thích biến động" không
function isPriceAnalysisMessage(text: string): boolean {
    return text.includes('Hãy giải thích biến động giá') || text.includes('Dữ liệu chi tiết các nến');
}

// Component để hiển thị message của user với khả năng collapse
function UserMessage({ message }: { message: ChatMessage }) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const isLongMessage = message.text.length > 200 || isPriceAnalysisMessage(message.text);
    const shouldShowCollapse = isLongMessage;

    if (!shouldShowCollapse) {
        return <span>{message.text}</span>;
    }

    const previewText = message.text.substring(0, 150) + '...';
    
    return (
        <div className="w-full">
            {isCollapsed ? (
                <div>
                    <div className="text-white/90">{previewText}</div>
                    <button
                        onClick={() => setIsCollapsed(false)}
                        className="mt-2 flex items-center gap-1 text-white/70 hover:text-white text-xs underline"
                    >
                        Xem thêm
                        <ChevronDown className="w-3 h-3" />
                    </button>
                </div>
            ) : (
                <div>
                    <div className="text-white whitespace-pre-wrap break-words">{message.text}</div>
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="mt-2 flex items-center gap-1 text-white/70 hover:text-white text-xs underline"
                    >
                        Thu gọn
                        <ChevronUp className="w-3 h-3" />
                    </button>
                </div>
            )}
        </div>
    );
}

export function ChatMessageList({ messages, isLoading, hasComponentLoaded }: ChatMessageListProps) {
    return (
        <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
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
                            className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-lg ${
                                message.role === 'user'
                                    ? 'bg-[#2D5BDE] text-white rounded-br-none border border-[#1E3A8A]/40'
                                    : 'bg-gray-700 text-white rounded-bl-none border border-gray-600'
                            }`}
                        >
                            {message.role === 'assistant' ? (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            p: ({ children }) => (
                                                <p className="mb-2 last:mb-0">{children}</p>
                                            ),
                                            strong: ({ children }) => (
                                                <strong className="font-semibold text-white">
                                                    {children}
                                                </strong>
                                            ),
                                            em: ({ children }) => (
                                                <em className="italic">{children}</em>
                                            ),
                                            code: ({ children, className }) => {
                                                const isInline = !className;
                                                return isInline ? (
                                                    <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono text-gray-200">
                                                        {children}
                                                    </code>
                                                ) : (
                                                    <code className="block bg-gray-800 p-3 rounded text-xs font-mono text-gray-200 overflow-x-auto">
                                                        {children}
                                                    </code>
                                                );
                                            },
                                            pre: ({ children }) => (
                                                <pre className="bg-gray-800 p-3 rounded text-xs font-mono text-gray-200 overflow-x-auto mb-2">
                                                    {children}
                                                </pre>
                                            ),
                                            ul: ({ children }) => (
                                                <ul className="list-disc list-inside mb-2 space-y-1">
                                                    {children}
                                                </ul>
                                            ),
                                            ol: ({ children }) => (
                                                <ol className="list-decimal list-inside mb-2 space-y-1">
                                                    {children}
                                                </ol>
                                            ),
                                            li: ({ children }) => (
                                                <li className="text-white">{children}</li>
                                            ),
                                            h1: ({ children }) => (
                                                <h1 className="text-lg font-bold mb-2 text-white">
                                                    {children}
                                                </h1>
                                            ),
                                            h2: ({ children }) => (
                                                <h2 className="text-base font-bold mb-2 text-white">
                                                    {children}
                                                </h2>
                                            ),
                                            h3: ({ children }) => (
                                                <h3 className="text-sm font-bold mb-1 text-white">
                                                    {children}
                                                </h3>
                                            ),
                                            blockquote: ({ children }) => (
                                                <blockquote className="border-l-4 border-gray-500 pl-3 italic text-gray-300 mb-2">
                                                    {children}
                                                </blockquote>
                                            ),
                                            a: ({ children, href }) => (
                                                <a
                                                    href={href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[#2D5BDE] underline hover:text-[#1E3A8A]"
                                                >
                                                    {children}
                                                </a>
                                            )
                                        }}
                                    >
                                        {message.text}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <UserMessage message={message} />
                            )}
                        </div>
                    </div>
                    <div
                        className={`flex ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                        } mt-1 px-3`}
                    >
                        <span className="text-xs text-[#718096]">
                            {message.createdAt}
                        </span>
                    </div>
                </div>
            ))}

            {/* Thinking/Processing indicator */}
            {isLoading && (
                <div>
                    <div className="flex justify-start items-start">
                        <div className="max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-lg bg-gray-700 text-white rounded-bl-none border border-gray-600">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-[#2D5BDE]" />
                                <span className="text-white/90 italic">
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
