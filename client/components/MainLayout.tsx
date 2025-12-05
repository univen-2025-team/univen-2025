"use client";

import { Sidebar } from "./Sidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto text-gray-900">
        <div className="p-1 md:p-3">
          <div className="p-3">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
