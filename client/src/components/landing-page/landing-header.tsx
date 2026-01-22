'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function LandingHeader() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const menuItems = [
        { label: 'Tính năng', href: pathname === '/subscription' ? '/#features' : '#features' },
        { label: 'Huy hiệu', href: pathname === '/subscription' ? '/#achievements' : '#achievements' },
        { label: 'Bảng giá', href: '/subscription' },
        { label: 'Liên hệ', href: pathname === '/subscription' ? '/#contact' : '#contact' }
    ];

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
                isScrolled
                    ? 'bg-[#050505]/70 backdrop-blur-xl border-white/5 shadow-lg shadow-violet-900/10'
                    : 'bg-transparent border-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter cursor-pointer">
                        <div className="relative">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-blue-200 drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                                Stockie
                            </span>
                        </div>
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    {menuItems.map((item, i) => (
                        <Link
                            key={i}
                            href={item.href}
                            className="text-sm font-medium text-slate-300 hover:text-white transition-colors hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                        >
                            {item.label}
                        </Link>
                    ))}
                    <Link
                        href="/dashboard"
                        className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl hover:shadow-[0_0_25px_-5px_rgba(124,58,237,0.6)] transition-all text-sm font-medium border border-white/10"
                    >
                        Bắt đầu
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-slate-300 hover:text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-[#050505]/95 border-b border-white/10 p-6 space-y-4 animate-in slide-in-from-top-5 backdrop-blur-xl">
                    {menuItems.map((item, i) => (
                        <Link
                            key={i}
                            href={item.href}
                            className="block text-slate-300 hover:text-violet-400"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <Link
                        href="/dashboard"
                        className="block w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl text-center font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Bắt đầu
                    </Link>
                </div>
            )}
        </nav>
    );
}
