'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function LandingHeader() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
                isScrolled
                    ? 'bg-[#050505]/70 backdrop-blur-xl border-white/5 shadow-lg shadow-violet-900/10'
                    : 'bg-transparent border-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <span className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-blue-200 drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                        Stockie
                    </span>
                </Link>

                <div className="hidden md:flex items-center space-x-8">
                    <a
                        href="/#features"
                        className="text-sm font-medium text-slate-300 hover:text-white transition-colors hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                    >
                        Tính năng
                    </a>
                    <a
                        href="/#achievements"
                        className="text-sm font-medium text-slate-300 hover:text-white transition-colors hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                    >
                        Huy hiệu
                    </a>
                    <Link
                        href="/subscription"
                        className="text-sm font-medium text-slate-300 hover:text-white transition-colors hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                    >
                        Bảng giá
                    </Link>
                    <a
                        href="/#contact"
                        className="text-sm font-medium text-slate-300 hover:text-white transition-colors hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                    >
                        Liên hệ
                    </a>
                    <Link
                        href="/dashboard"
                        className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl hover:shadow-[0_0_25px_-5px_rgba(124,58,237,0.6)] transition-all text-sm font-medium border border-white/10"
                    >
                        Bắt đầu
                    </Link>
                </div>

                <button
                    type="button"
                    className="md:hidden text-slate-300 hover:text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-expanded={mobileMenuOpen}
                >
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {mobileMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 right-0 bg-[#050505]/95 border-b border-white/10 p-6 space-y-4 animate-in slide-in-from-top-5 backdrop-blur-xl">
                    <a href="/#features" className="block text-slate-300 hover:text-violet-400">
                        Tính năng
                    </a>
                    <a href="/#achievements" className="block text-slate-300 hover:text-violet-400">
                        Huy hiệu
                    </a>
                    <Link href="/subscription" className="block text-slate-300 hover:text-violet-400">
                        Bảng giá
                    </Link>
                    <a href="/#contact" className="block text-slate-300 hover:text-violet-400">
                        Liên hệ
                    </a>
                    <Link
                        href="/dashboard"
                        className="block w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl text-center font-medium"
                    >
                        Bắt đầu
                    </Link>
                </div>
            )}
        </nav>
    );
}
