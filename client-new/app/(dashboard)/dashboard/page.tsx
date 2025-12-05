'use client';

<<<<<<< HEAD:client-new/app/(dashboard)/dashboard/page.tsx
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectIsAuthenticated, logoutUser } from "@/lib/store/authSlice";
import { useProfile } from "@/lib/hooks/useProfile";
import LoadingSpinner from "@/components/dashboard/LoadingSpinner";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import StatsGrid from "@/components/dashboard/StatsGrid";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import PageHeader from '@/components/dashboard/PageHeader';
import { title } from "process";
import ErrorMessage from "@/components/common/ErrorMessage";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Fetch profile data from API
  const { profile, isLoading, error } = useProfile(true);
=======
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { selectIsAuthenticated, logoutUser } from '@/lib/store/authSlice';
import { useProfile } from '@/lib/hooks/useProfile';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import StatsGrid from '@/components/dashboard/StatsGrid';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';

export default function DashboardPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
>>>>>>> d682d7a1 (fix: build):client-new/app/(dashboard)/page.tsx

    // Fetch profile data from API
    const { profile, isLoading, error } = useProfile(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, router]);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        router.push('/auth/login');
    };

    // Show loading while fetching profile or if not authenticated
    if (!isAuthenticated || isLoading || !profile) {
        return <LoadingSpinner />;
    }

    // Show error state if profile fetch failed
    if (error) {
        return <ErrorMessage message={error} />;
    }

    const userName = profile.user_fullName || 'Admin';

    return (
        <div className="space-y-6">
            <WelcomeHeader userName={userName} />
            <StatsGrid />

<<<<<<< HEAD:client-new/app/(dashboard)/dashboard/page.tsx
  const userName = profile.user_fullName || "Admin";

  return ( <>
    <div className="space-y-6 pb-8">
    <PageHeader
        title="Tổng quan"
        description="" /><div className="space-y-6">
        {/* <WelcomeHeader userName={userName} /> */}
        <StatsGrid />

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuickActions onLogout={handleLogout} />
          <RecentActivity />
        </div>
      </div>
    </div></>
  );
=======
            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <QuickActions onLogout={handleLogout} />
                <RecentActivity />
            </div>
        </div>
    );
>>>>>>> d682d7a1 (fix: build):client-new/app/(dashboard)/page.tsx
}
