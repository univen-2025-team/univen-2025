'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatInterface } from '@/features/chatbot/components/chat/chat-interface';
import { FeatureInstruction } from '@/features/types/features'; // Check import path
import { useSidebar } from '@/context/SidebarContext';
import { X, GripVertical, MessageCircle } from 'lucide-react';
import { getLatestMarketData } from '@/lib/api/market-cache';

// Re-using component imports from previous chatbot.tsx
// Assuming ChatInterface is exportable.
// Wait, previous import was `import { ChatInterface } from './chat/chat-interface';` inside features/chatbot/components.
// Path: client/src/features/chatbot/components/chatbot.tsx -> ./chat/chat-interface
// Absolute path: client/src/features/chatbot/components/chat/chat-interface.tsx
// So new import in components/GlobalChatSidebar.tsx should be '@/features/chatbot/components/chat/chat-interface'

const MIN_CHAT_WIDTH = 320;
const MAX_CHAT_WIDTH = 600;
const DEFAULT_CHAT_WIDTH = 400;

export function GlobalChatSidebar() {
    const { isChatOpen, setIsChatOpen, toggleChat } = useSidebar();
    const [chatWidth, setChatWidth] = useState(DEFAULT_CHAT_WIDTH);
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Initial Load Market Data - simplified for Global Chat (it handled it implicitly for FeatureArea, but for pure ChatInterface we might not need extensive state if ChatInterface fetches its own data or is stateless)
    // The original `chatbot.tsx` maintained `featureState`.
    // If `ChatInterface` expects props `onUiEffects`, we need to handle them.
    // Ideally, for a Global Chat, we might want it to overlay or control main content.
    // For now, let's keep it simple: Just the Chat Interface.

    // Handle Resize
    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizing) return;
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth >= MIN_CHAT_WIDTH && newWidth <= MAX_CHAT_WIDTH) {
                setChatWidth(newWidth);
            }
        },
        [isResizing]
    );

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);

    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    // Handle ESC key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isChatOpen) {
                setIsChatOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isChatOpen, setIsChatOpen]);

    // Show hint on first open
    const [showEscHint, setShowEscHint] = useState(false);
    useEffect(() => {
        if (isChatOpen) {
            const hasSeenHint = localStorage.getItem('hasSeenChatEscHint');
            if (!hasSeenHint) {
                setShowEscHint(true);
                const timer = setTimeout(() => {
                    setShowEscHint(false);
                    localStorage.setItem('hasSeenChatEscHint', 'true');
                }, 5000);
                return () => clearTimeout(timer);
            }
        } else {
            setShowEscHint(false);
        }
    }, [isChatOpen]);

    // Always render for transition
    const isOpen = isChatOpen;

    return (
        <div
            ref={sidebarRef}
            className={`h-full bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out shrink-0 overflow-hidden relative shadow-xl ${isOpen ? 'opacity-100' : 'opacity-0'
                }`}
            style={{
                width: isOpen ? chatWidth : 0,
                minWidth: isOpen ? MIN_CHAT_WIDTH : 0,
                willChange: 'width', // Optimization: Hint browser of impending change
                contain: 'layout paint' // Optimization: Isolate layout
            }}
        >
            {/* Resize Handle */}
            <div
                className="absolute top-0 bottom-0 left-0 w-1.5 cursor-col-resize hover:bg-primary/20 flex items-center justify-center z-50 h-full"
                onMouseDown={() => setIsResizing(true)}
            >
                <div className="h-8 w-1 bg-gray-300 rounded-full" />
            </div>

            {/* Unique Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50 shrink-0 relative">
                <div className="flex items-center gap-2 select-none">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <span className="font-bold text-gray-900">AI Advisor</span>
                </div>
                <button
                    onClick={() => setIsChatOpen(false)}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"
                    title="Đóng (Close)"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* ESC Hint Tooltip */}
                {showEscHint && (
                    <div className="absolute top-12 right-2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl animate-bounce pointer-events-none z-50 whitespace-nowrap">
                        Mẹo: Nhấn <b>ESC</b> để đóng
                        <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-800 rotate-45"></div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative bg-white">
                <ChatInterface onUiEffects={(effects) => console.log('UI Effects:', effects)} />
            </div>
        </div>
    );
}
