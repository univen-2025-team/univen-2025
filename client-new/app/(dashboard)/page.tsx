"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectUser, selectIsAuthenticated, logoutUser } from "@/lib/store/authSlice";
import LoadingSpinner from "@/components/dashboard/LoadingSpinner";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import StatsGrid from "@/components/dashboard/StatsGrid";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  // const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAuthenticated = true;

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push("/auth/login");
  //   }
  // }, [isAuthenticated, router]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/auth/login");
  };

  if (!isAuthenticated || !user) {
    return <LoadingSpinner />;
  }

  const userName = user.user_fullName || "Admin";

  return (
    <div className="space-y-6">
      <WelcomeHeader userName={userName} />
      <StatsGrid />

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickActions onLogout={handleLogout} />
        <RecentActivity />
      </div>
    </div>
  );
}
