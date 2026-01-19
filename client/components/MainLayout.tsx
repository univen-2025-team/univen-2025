'use client';

import { Sidebar } from './Sidebar';

export function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-[#050505] text-white relative">
            {/* --- ZENOX STYLE BACKGROUND BLOBS --- */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Top Left - Pink/Red Glow */}
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-pink-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
                {/* Top Right - Violet/Blue Glow */}
                <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
                {/* Bottom Left - Blue Glow */}
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen"></div>
                {/* Center - Subtle Violet Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/5 rounded-full blur-[150px] mix-blend-screen"></div>
            </div>

            <Sidebar />
            <main className="flex-1 overflow-y-auto relative z-10">
                <div className="p-1 md:p-3">
                    <div className="p-3">{children}</div>
                </div>
            </main>
        </div>
    );
}
