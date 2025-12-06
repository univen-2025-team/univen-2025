'use client';

import { Sidebar } from './Sidebar';

export function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-hidden text-gray-900">{children}</main>
        </div>
    );
}
