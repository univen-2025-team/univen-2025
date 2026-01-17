import { MainLayout } from '@/components/MainLayout';
import AuthGuard from '@/components/auth/AuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <MainLayout>{children}</MainLayout>
        </AuthGuard>
    );
}
