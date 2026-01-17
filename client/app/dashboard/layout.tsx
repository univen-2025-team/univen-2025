import { MainLayout } from '@/components/MainLayout';
<<<<<<< HEAD
import AuthGuard from '@/components/auth/AuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <MainLayout>{children}</MainLayout>
        </AuthGuard>
    );
=======

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <MainLayout>{children}</MainLayout>;
>>>>>>> f255a1a0 (rename: client-new => client)
}
