/**
 * Sidebar Route Configuration
 * Centralized route definitions with icons and metadata
 */

import { ReactNode } from 'react';
import {
    Home,
    TrendingUp,
    Newspaper,
    Briefcase,
    ArrowLeftRight,
    Trophy,
    Brain,
    BookOpen,
    Clock,
    Award
} from 'lucide-react';

export interface SidebarRoute {
    name: string;
    path: string;
    icon: ReactNode;
    badge?: string;
    /**
     * Exact match - only highlight if pathname exactly matches
     * Default: false (will match if pathname starts with path)
     */
    exact?: boolean;
    /**
     * Additional paths that should also highlight this route
     */
    aliases?: string[];
}

export const sidebarRoutes: SidebarRoute[] = [
    {
        name: 'Trang chủ',
        path: '/dashboard',
        exact: true,
        aliases: ['/dashboard'],
        icon: <Home className="w-5 h-5" />
    },

    {
        name: 'Thị trường',
        path: '/dashboard/market',
        icon: <TrendingUp className="w-5 h-5" />
    },
    {
        name: 'Tin tức',
        path: '/dashboard/news',
        icon: <Newspaper className="w-5 h-5" />
    },
    {
        name: 'Danh mục',
        path: '/dashboard/portfolio',
        icon: <Briefcase className="w-5 h-5" />
    },
    {
        name: 'Giao dịch',
        path: '/dashboard/trade',
        icon: <ArrowLeftRight className="w-5 h-5" />
    },
    {
        name: 'Bảng xếp hạng',
        path: '/dashboard/ranking',
        icon: <Trophy className="w-5 h-5" />
    },
    {
        name: 'Phân tích đầu tư',
        path: '/dashboard/stock-analysis',
        icon: <Brain className="w-5 h-5" />
    },
    {
        name: 'Học đầu tư',
        path: '/dashboard/learn-trading',
        aliases: ['/dashboard/learn-trading'],
        icon: <BookOpen className="w-5 h-5" />
    },
    {
        name: 'Lịch sử',
        path: '/dashboard/history',
        icon: <Clock className="w-5 h-5" />
    },
    {
        name: 'Huy hiệu',
        path: '/dashboard/badges',
        icon: <Award className="w-5 h-5" />
    }
];

/**
 * Check if a route is active based on current pathname
 */
export function isRouteActive(route: SidebarRoute, pathname: string): boolean {
    // Check exact match
    if (route.exact) {
        return pathname === route.path || route.aliases?.includes(pathname) || false;
    }

    // Check if pathname starts with route path (for nested routes)
    if (pathname.startsWith(route.path) && route.path !== '/') {
        return true;
    }

    // Check aliases
    if (route.aliases) {
        return route.aliases.some((alias) => {
            if (alias === pathname) return true;
            return pathname.startsWith(alias) && alias !== '/';
        });
    }

    return false;
}
