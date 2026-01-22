'use client';

import { Sidebar } from './Sidebar';

export function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-b from-white via-[#F0F4FF]/30 to-white text-foreground relative">
            {/* Light blue subtle background gradient */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Top Left - Light Blue Glow */}
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#F0F4FF]/40 rounded-full blur-[120px]"></div>
                {/* Top Right - Light Blue Glow */}
                <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-[#F0F4FF]/30 rounded-full blur-[120px]"></div>
                {/* Bottom Left - Very Light Blue Glow */}
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-[#F0F4FF]/20 rounded-full blur-[100px]"></div>
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
