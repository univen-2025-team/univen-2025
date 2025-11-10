"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import { selectUser } from "@/lib/store/authSlice";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname() || "/";
  const user = useAppSelector(selectUser);

  const menuItems = [
    { name: "Trang chủ", path: "/dashboard", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { name: "Thị trường", path: "/market", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )},
    { name: "Danh mục", path: "/portfolio", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )},
    { name: "Giao dịch", path: "/trade", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    )},
    { name: "Lịch sử", path: "/history", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { name: "Báo cáo", path: "/reports", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { name: "Tin tức", path: "/news", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    )},
    { name: "Chatbot AI", path: "/chatbot", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ), badge: "AI" },
    { name: "Huy hiệu", path: "/badges", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ), badge: "3" },
    { name: "Cài đặt", path: "/settings", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
        aria-label="Mở menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 ${isCollapsed ? "w-20" : "w-64"} bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-md flex items-center justify-center text-white bg-gradient-to-r from-blue-500 to-indigo-600`}>{isCollapsed ? "SU" : "SU"}</div>
              {!isCollapsed && (
                <div>
                  <h1 className="text-lg font-bold text-gray-900">SampleUniven2025</h1>
                  <p className="text-xs text-gray-500">Sàn Giao Dịch</p>
                </div>
              )}
            </div>

            {/* Collapse Toggle (desktop) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:inline-flex p-2 rounded-md hover:bg-gray-100"
              title={isCollapsed ? "Mở rộng" : "Thu gọn"}
            >
              <svg className={`w-5 h-5 transform ${isCollapsed ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const active = pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`group flex items-center gap-3 p-3 rounded-md relative transition-colors ${active ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow" : "text-gray-700 hover:bg-gray-100"} ${isCollapsed ? "justify-center" : ""}`}
                  >
                    {/* Active indicator */}
                    {active && !isCollapsed && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />}

                    <div className={`flex-shrink-0 ${active ? "text-white" : "text-gray-600"}`}>{item.icon}</div>

                    {!isCollapsed && (
                      <>
                        <span className="flex-1 font-medium">{item.name}</span>
                        {item.badge && (
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${active ? "bg-white text-blue-600" : "bg-blue-600 text-white"}`}>{item.badge}</span>
                        )}
                      </>
                    )}

                    {/* Tooltip when collapsed */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-white shadow rounded-md text-sm text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer / Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                {user?.user_fullName?.charAt(0).toUpperCase() || "U"}
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.user_fullName || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
