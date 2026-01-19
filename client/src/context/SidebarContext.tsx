'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';

type SidebarContextType = {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    toggleCollapsed: () => void;
    isChatOpen: boolean;
    setIsChatOpen: (value: boolean) => void;
    toggleChat: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Routes that should auto-collapse sidebar
const AUTO_COLLAPSE_ROUTES = [
    '/dashboard/market/', // Stock detail pages like /dashboard/market/FPT
];

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Chat state declared here to be accessible
    const [isChatOpen, setIsChatOpen] = useState(false);
    const toggleChat = () => setIsChatOpen(prev => !prev);

    const pathname = usePathname();

    // Auto-collapse for specific routes
    useEffect(() => {
        const shouldAutoCollapse = AUTO_COLLAPSE_ROUTES.some(route =>
            pathname?.startsWith(route) && pathname !== '/dashboard/market'
        );

        if (shouldAutoCollapse) {
            setIsCollapsed(true);
        }
    }, [pathname]);

    // Auto-collapse sidebar when chat opens
    useEffect(() => {
        if (isChatOpen) {
            setIsCollapsed(true);
        }
    }, [isChatOpen]);

    const toggleCollapsed = () => setIsCollapsed(prev => !prev);

    return (
        <SidebarContext.Provider value={{
            isCollapsed, setIsCollapsed, toggleCollapsed,
            isChatOpen, setIsChatOpen, toggleChat
        }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}
