'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { selectIsAuthenticated, selectUser } from '@/lib/store/authSlice';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const user = useAppSelector(selectUser);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Wait for hydration to complete
        const checkAuth = () => {
            // Check if we have persisted auth state
            if (typeof window !== 'undefined') {
                const persistedState = localStorage.getItem('persist:root');

                if (!persistedState) {
                    // No persisted state, redirect to login
                    router.replace('/auth/login');
                    return;
                }

                try {
                    const parsed = JSON.parse(persistedState);
                    const authState = JSON.parse(parsed.auth);

                    if (!authState.accessToken || !authState.user) {
                        // No valid auth, redirect to login
                        router.replace('/auth/login');
                        return;
                    }

                    // Auth valid, allow access
                    setIsLoading(false);
                } catch {
                    // Parse failed, redirect to login
                    router.replace('/auth/login');
                }
            }
        };

        // Small delay to allow Redux Persist to hydrate
        const timer = setTimeout(checkAuth, 100);

        return () => clearTimeout(timer);
    }, [router]);

    // Also watch Redux state after hydration
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/auth/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
