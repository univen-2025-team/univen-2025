'use client';

import { Sidebar } from './Sidebar';
import { SidebarProvider } from '@/context/SidebarContext';

import { GlobalChatSidebar } from './GlobalChatSidebar';
import { useSidebar } from '@/context/SidebarContext';
import { MessageCircle } from 'lucide-react';

export function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <MainLayoutContent>{children}</MainLayoutContent>
        </SidebarProvider>
    );
}

function MainLayoutContent({ children }: { children: React.ReactNode }) {
    const { isChatOpen, setIsChatOpen } = useSidebar();

    return (
        <div className="flex h-screen overflow-hidden bg-background relative">
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-40 right-1/4 w-72 h-72 bg-accent/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <Sidebar />

            <main className="flex-1 overflow-y-auto text-gray-900 p-4 md:p-6 relative z-10 scroll-smooth">
                {children}
            </main>

            <GlobalChatSidebar />

            {/* Chat Trigger Button (Visible when chat is closed) */}
            {!isChatOpen && (
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 animate-bounce-in"
                    title="Mở Trợ lý ảo"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            )}
        </div>
    );
}

