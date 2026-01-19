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

    // Always render for transition
    const isOpen = isChatOpen;

    return (
        <div
            ref={sidebarRef}
            className={`h-full bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out shrink-0 overflow-hidden relative shadow-xl ${isOpen ? 'opacity-100' : 'opacity-0'
                }`}
            style={{
                width: isOpen ? chatWidth : 0,
                minWidth: isOpen ? MIN_CHAT_WIDTH : 0
            }}
        >
            {/* Resize Handle */}
            <div
                className="absolute top-0 bottom-0 left-0 w-1.5 cursor-col-resize hover:bg-primary/20 flex items-center justify-center z-50"
                onMouseDown={() => setIsResizing(true)}
            >
                <div className="h-8 w-1 bg-gray-300 rounded-full" />
            </div>

            {/* Close Button Overlay */}
            <button
                onClick={() => setIsChatOpen(false)}
                className="absolute top-3 right-3 z-50 p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                title="Đóng"
            >
                <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
                <ChatInterface onUiEffects={(effects) => console.log('UI Effects:', effects)} />
            </div>
        </div>
    );
}
