'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { selectIsAuthenticated, loginAsGuest } from '@/lib/store/authSlice';
import { API_URL } from '@/config/app';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const [isGuestLoading, setIsGuestLoading] = useState(false);

    const isLoginPage = pathname === '/auth/login';
    const isRegisterPage = pathname === '/auth/register';

    const handleGuestLogin = async () => {
        try {
            setIsGuestLoading(true);
            await dispatch(loginAsGuest()).unwrap();
            router.push('/');
        } catch (error) {
            console.error('Guest login error:', error);
        } finally {
            setIsGuestLoading(false);
        }
    };

    useEffect(() => {
        // If user is already authenticated, redirect to home page
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    // Don't render auth pages if user is authenticated
    if (isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            {/* Main Auth Box */}
            <div className="relative z-10 max-w-md w-full">
                {/* Logo/Brand */}
                <div className="text-center mb-8 animate-fade-in-down">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4 shadow-lg">
                        <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold bg-primary bg-clip-text text-transparent">
                        UniVen Platform
                    </h1>
                    <p className="text-gray-600 mt-2 text-sm">
                        Nền tảng giao dịch chứng khoán thông minh
                    </p>
                </div>

                {/* Auth Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-scale-in">
                    {/* Tab Switcher */}
                    <div className="relative flex border-b border-gray-200 bg-gray-50">
                        {/* Sliding Background Indicator */}
                        <div
                            className={`absolute bottom-0 h-1 bg-primary transition-all duration-300 ease-out ${
                                isLoginPage ? 'left-0 w-1/2' : 'left-1/2 w-1/2'
                            }`}
                        />

                        {/* Login Tab */}
                        <Link
                            href="/auth/login"
                            className={`flex-1 py-4 text-center font-semibold transition-all duration-300 relative ${
                                isLoginPage ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
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
                                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                    />
                                </svg>
                                Đăng nhập
                            </span>

                            {/* Active Tab Background */}
                            {isLoginPage && (
                                <div className="absolute inset-0 bg-white transition-all duration-300" />
                            )}
                        </Link>

                        {/* Register Tab */}
                        <Link
                            href="/auth/register"
                            className={`flex-1 py-4 text-center font-semibold transition-all duration-300 relative ${
                                isRegisterPage
                                    ? 'text-primary'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
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
                                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                    />
                                </svg>
                                Đăng ký
                            </span>

                            {/* Active Tab Background */}
                            {isRegisterPage && (
                                <div className="absolute inset-0 bg-white transition-all duration-300" />
                            )}
                        </Link>
                    </div>

                    {/* Form Content with slide animation */}
                    <div className="p-8">
                        <div key={pathname} className="animate-slide-in">
                            {children}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="px-8 pb-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500 font-medium">
                                    Hoặc tiếp tục với
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Social Login */}
                    <div className="px-8 pb-8">
                        <button
                            type="button"
                            onClick={() => {
                                console.log({ API_URL: process.env.APP_URL });
                                // Redirect to backend Google OAuth endpoint
                                window.location.href = API_URL + '/auth/login/google';
                            }}
                            className="w-full inline-flex justify-center items-center py-3 px-4 border-2 border-gray-200 rounded-lg shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Tiếp tục với Google
                        </button>

                        {/* Guest Login Button */}
                        <button
                            type="button"
                            onClick={handleGuestLogin}
                            disabled={isGuestLoading}
                            className="mt-3 w-full inline-flex justify-center items-center py-3 px-4 border-2 border-gray-200 rounded-lg shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isGuestLoading ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Đang tạo tài khoản...
                                </>
                            ) : (
                                <>
                                    <svg
                                        className="w-5 h-5 mr-3"
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
                                    Tiếp tục với tư cách khách
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Security Note */}
                <div className="mt-6 bg-primary/5 rounded-lg p-4 border border-primary/20 animate-fade-in">
                    <div className="flex">
                        <svg
                            className="h-5 w-5 text-primary mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <p className="ml-3 text-xs text-primary">
                            Thông tin của bạn được mã hóa và bảo mật an toàn
                        </p>
                    </div>
                </div>
            </div>

            {/* Custom Animations */}
            <style jsx global>{`
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }

                @keyframes fade-in-down {
                    0% {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes scale-in {
                    0% {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes slide-in {
                    0% {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes fade-in {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }

                .animate-blob {
                    animation: blob 7s infinite;
                }

                .animation-delay-2000 {
                    animation-delay: 2s;
                }

                .animation-delay-4000 {
                    animation-delay: 4s;
                }

                .animate-fade-in-down {
                    animation: fade-in-down 0.6s ease-out;
                }

                .animate-scale-in {
                    animation: scale-in 0.5s ease-out;
                }

                .animate-slide-in {
                    animation: slide-in 0.4s ease-out;
                }

                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }
            `}</style>
        </div>
    );
}
