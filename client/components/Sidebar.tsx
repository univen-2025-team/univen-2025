'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { selectUser, logoutUser } from '@/lib/store/authSlice';
import { appConfig } from '@/config';
import { sidebarRoutes, isRouteActive } from '@/config/sidebar.config';
import { getMediaUrl } from '@/lib/api/media.api';

export function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname() || '/';
    const router = useRouter();
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        router.push('/auth/login');
    };

    // Close profile menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        }

        if (showProfileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showProfileMenu]);

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
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    ) : (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    )}
                </svg>
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`fixed lg:static inset-y-0 left-0 z-40 ${
                    isCollapsed ? 'w-20' : 'w-64'
                } bg-white/95 backdrop-blur-sm border-r border-gray-200 shadow-xl transform transition-all duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/stockie-logo.png"
                                alt="Stockie"
                                width={isCollapsed ? 40 : 120}
                                height={isCollapsed ? 40 : 40}
                                className="object-contain"
                                priority
                            />
                        </div>

                        {/* Collapse Toggle (desktop) */}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden lg:inline-flex p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                            title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
                        >
                            <svg
                                className={`w-5 h-5 transform ${isCollapsed ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 overflow-y-auto">
                        <div className="space-y-1">
                            {sidebarRoutes.map((route) => {
                                const active = isRouteActive(route, pathname);

                                return (
                                    <Link
                                        key={route.path}
                                        href={route.path}
                                        onClick={() => setIsOpen(false)}
                                        className={`group flex items-center gap-3 p-3 rounded-md relative transition-colors ${
                                            active
                                                ? 'bg-primary text-white shadow'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        } ${isCollapsed ? 'justify-center' : ''}`}
                                    >
                                        {/* Active indicator */}
                                        {active && !isCollapsed && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary/50 rounded-r-full" />
                                        )}

                                        <div
                                            className={`flex-shrink-0 ${
                                                active ? 'text-white' : 'text-gray-600'
                                            }`}
                                        >
                                            {route.icon}
                                        </div>

                                        {!isCollapsed && (
                                            <>
                                                <span className="flex-1 font-medium">
                                                    {route.name}
                                                </span>
                                                {route.badge && (
                                                    <span
                                                        className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                            active
                                                                ? 'bg-white text-primary'
                                                                : 'bg-primary text-white'
                                                        }`}
                                                    >
                                                        {route.badge}
                                                    </span>
                                                )}
                                            </>
                                        )}

                                        {/* Tooltip when collapsed */}
                                        {isCollapsed && (
                                            <div className="absolute left-full ml-2 px-3 py-2 bg-white shadow rounded-md text-sm text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                                {route.name}
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Footer / Profile */}
                    <div className="p-4 border-t border-gray-200 relative" ref={profileMenuRef}>
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className={`w-full flex items-center gap-3 ${
                                isCollapsed ? 'justify-center' : ''
                            } hover:bg-gray-50 rounded-lg p-2 transition-colors`}
                        >
                            {(() => {
                                const avatarUrl = getMediaUrl(user?.user_avatar);
                                return avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={user?.user_fullName || 'User'}
                                        className="w-9 h-9 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                                        {user?.user_fullName?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                );
                            })()}
                            {!isCollapsed && (
                                <div className="min-w-0 flex-1 text-left">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {user?.user_fullName || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {user?.email || 'user@example.com'}
                                    </p>
                                </div>
                            )}
                            {!isCollapsed && (
                                <svg
                                    className={`w-4 h-4 text-gray-400 transition-transform ${
                                        showProfileMenu ? 'rotate-180' : ''
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            )}
                        </button>

                        {/* Profile Dropdown Menu */}
                        {showProfileMenu && !isCollapsed && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                <Link
                                    href="/profile"
                                    onClick={() => setShowProfileMenu(false)}
                                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium">Thông tin cá nhân</span>
                                </Link>

                                <div className="border-t border-gray-200 my-2"></div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-error-light transition-colors text-error"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium">Đăng xuất</span>
                                </button>
                            </div>
                        )}

                        {/* Tooltip for collapsed sidebar */}
                        {isCollapsed && showProfileMenu && (
                            <div className="absolute bottom-full left-full ml-2 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 w-48">
                                <Link
                                    href="/profile"
                                    onClick={() => setShowProfileMenu(false)}
                                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium">Thông tin cá nhân</span>
                                </Link>

                                <div className="border-t border-gray-200 my-2"></div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-error-light transition-colors text-error"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium">Đăng xuất</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
