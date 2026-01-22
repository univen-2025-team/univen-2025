'use client';
import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Target,
    Award,
    Shield,
    BarChart3,
    LineChart,
    Menu,
    X,
    ChevronRight,
    Check,
    Zap,
    Users,
    RefreshCw
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function StockieHomepage() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: <Target className="w-8 h-8" />,
            title: 'Quản lý danh mục',
            description: 'Theo dõi và quản lý danh mục đầu tư của bạn một cách dễ dàng',
            color: 'bg-primary'
        },
        {
            icon: <LineChart className="w-8 h-8" />,
            title: 'Phân tích thị trường',
            description: 'Dữ liệu thị trường realtime với biểu đồ VN30 và các chỉ số quan trọng',
            color: 'bg-accent'
        },
        {
            icon: <Award className="w-8 h-8" />,
            title: 'Hệ thống huy hiệu',
            description: 'Đạt được các thành tích và huy hiệu khi hoàn thành mục tiêu đầu tư',
            color: 'bg-warning'
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: 'AI Advisor',
            description: 'Trợ lý AI thông minh hỗ trợ quyết định đầu tư của bạn',
            color: 'bg-success'
        },
        {
            icon: <BarChart3 className="w-8 h-8" />,
            title: 'Bảng xếp hạng',
            description: 'Xem top cổ phiếu tăng/giảm mạnh và so sánh với thị trường',
            color: 'bg-primary'
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: 'Bảo mật cao',
            description: 'Thông tin đầu tư của bạn được bảo vệ với công nghệ mã hóa hiện đại',
            color: 'bg-accent'
        }
    ];

    const achievements = [
        {
            icon: '🎯',
            title: 'Giao dịch đầu tiên',
            description: 'Hoàn thành giao dịch đầu tiên của bạn'
        },
        { icon: '🏆', title: 'Top 10', description: 'Lọt vào top 10 bảng xếp hạng' },
        { icon: '👑', title: 'Top 3', description: 'Lọt vào top 3 bảng xếp hạng' },
        { icon: '👑', title: 'Quán quân', description: 'Đứng đầu bảng xếp hạng' },
        { icon: '📈', title: 'Triệu phú', description: 'Đạt lợi nhuận 1 triệu đồng' },
        { icon: '⭐', title: 'Cao thủ', description: 'Đạt lợi nhuận 10 triệu đồng' }
    ];

    const stats = [
        { value: '50K+', label: 'Người dùng' },
        { value: '2.4 tỷ', label: 'Tổng lợi nhuận' },
        { value: '99.9%', label: 'Uptime' },
        { value: '4.9/5', label: 'Đánh giá' }
    ];

    const portfolioData = {
        balance: '19.756.500 ₫',
        invested: '243.500 ₫',
        value: '243.500 ₫',
        profit: '0 ₫',
        profitPercent: '+0.00%'
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-pink-500/30 font-sans overflow-x-hidden relative">
            {/* --- ZENOX STYLE BACKGROUND BLOBS --- */}
            {/* Large vibrant glowing orbs behind the glass content */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Top Left - Pink/Red Glow */}
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-pink-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[10s]"></div>
                {/* Top Right - Violet/Blue Glow */}
                <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
                {/* Bottom Left - Blue Glow */}
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen"></div>
            </div>

            {/* Navigation */}
            <nav
                className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-[#050505]/70 backdrop-blur-xl border-white/5 shadow-lg shadow-violet-900/10' : 'bg-transparent border-transparent'}`}
            >
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {/* Logo Text with Neon Gradient */}
                        <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter cursor-pointer">
                            <div className="relative">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-blue-200 drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                                    Stockie
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {['Tính năng', 'Huy hiệu', 'Bảng giá', 'Liên hệ'].map((item, i) => (
                            <a
                                key={i}
                                href={`#${item === 'Huy hiệu' ? 'achievements' : item === 'Tính năng' ? 'features' : ''}`}
                                className="text-sm font-medium text-slate-300 hover:text-white transition-colors hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                            >
                                {item}
                            </a>
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
                        <a href="#features" className="block text-slate-300 hover:text-violet-400">
                            Tính năng
                        </a>
                        <a
                            href="#achievements"
                            className="block text-slate-300 hover:text-violet-400"
                        >
                            Huy hiệu
                        </a>
                        <a href="#pricing" className="block text-slate-300 hover:text-violet-400">
                            Bảng giá
                        </a>
                        <a href="#contact" className="block text-slate-300 hover:text-violet-400">
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

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8 animate-fadeIn relative">
                            {/* Text Glow Effect */}
                            <div className="absolute -left-20 -top-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl mix-blend-screen"></div>

                            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-2xl">
                                Đầu tư{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                                    chứng khoán
                                </span>{' '}
                                dễ dàng hơn bao giờ hết
                            </h1>

                            <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
                                Quản lý danh mục, phân tích thị trường realtime, và nhận tư vấn từ
                                AI. Tất cả trong một nền tảng hiện đại.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-2">
                                <Link
                                    href="/dashboard"
                                    className="px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 text-white rounded-2xl font-semibold hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.6)] hover:scale-105 transition-all flex items-center gap-2 group border border-white/10"
                                >
                                    Bắt đầu miễn phí
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-semibold hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
                                >
                                    Xem demo
                                </Link>
                            </div>

                            <div className="flex gap-8 pt-8 border-t border-white/5">
                                {stats.map((stat, index) => (
                                    <div
                                        key={index}
                                        className="animate-fadeIn"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="text-2xl font-bold text-white mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                            {stat.value}
                                        </div>
                                        <div className="text-xs text-slate-400 uppercase tracking-wider">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Portfolio Dashboard Preview - Zenox Style */}
                        <div className="relative animate-fadeIn delay-200 perspective-1000">
                            {/* Strong glow behind the card */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-gradient-to-r from-violet-600 to-pink-600 rounded-full blur-[80px] opacity-40"></div>

                            {/* Main Glass Card */}
                            <div className="relative bg-[#0F111A]/60 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl ring-1 ring-white/5">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">
                                            Danh mục đầu tư
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Real-time updates
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 cursor-pointer transition-colors group">
                                        <RefreshCw className="w-5 h-5 text-slate-300 group-hover:text-white group-hover:rotate-180 transition-all duration-700" />
                                    </div>
                                </div>

                                {/* Main Balance Card - Gradient like Zenox */}
                                <div className="mb-6 relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                                    <div className="relative bg-gradient-to-br from-[#1E1B2E] to-[#13131F] rounded-2xl p-6 border border-white/10 overflow-hidden">
                                        {/* Decorative blob inside card */}
                                        <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-violet-500/20 rounded-full blur-2xl"></div>
                                        <div className="absolute left-[-20px] bottom-[-20px] w-32 h-32 bg-pink-500/20 rounded-full blur-2xl"></div>

                                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-4">
                                            <div>
                                                <div className="text-sm text-slate-300 mb-1">
                                                    Tổng số dư
                                                </div>
                                                <div className="text-3xl font-bold text-white tracking-tight drop-shadow-md">
                                                    {portfolioData.balance}
                                                </div>
                                            </div>
                                            <div className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-lg text-emerald-400 text-sm font-semibold flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                                <TrendingUp size={14} /> +12.5%
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="text-xs text-slate-400 mb-1">
                                            Tổng đã đầu tư
                                        </div>
                                        <div className="text-lg font-bold text-white">
                                            {portfolioData.invested}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="text-xs text-slate-400 mb-1">Lợi nhuận</div>
                                        <div className="text-lg font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                                            {portfolioData.profit}
                                        </div>
                                    </div>
                                </div>

                                {/* Stock Item */}
                                <div className="bg-[#13141C]/80 rounded-2xl p-1 border border-white/5">
                                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg">
                                                A
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm group-hover:text-violet-300 transition-colors">
                                                    ACB
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    10 cổ phiếu
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-white text-sm">
                                                243.500 ₫
                                            </div>
                                            <div className="text-xs text-slate-400">0.00%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-white/[0.02] mask-image-linear-gradient"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                            Tính năng{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400 drop-shadow-lg">
                                vượt trội
                            </span>
                        </h2>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                            Mọi thứ bạn cần để trở thành nhà đầu tư thông minh
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group relative p-[1px] rounded-2xl bg-gradient-to-b from-white/10 to-transparent hover:from-violet-500/50 hover:to-blue-500/50 transition-all duration-500"
                            >
                                <div className="bg-[#0A0C12] h-full rounded-2xl p-8 relative overflow-hidden backdrop-blur-sm">
                                    {/* Neon Icon Container */}
                                    <div
                                        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-white shadow-inner border border-white/10 bg-gradient-to-br ${
                                            index % 3 === 0
                                                ? 'from-violet-500/20 to-purple-500/5 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                                                : index % 3 === 1
                                                  ? 'from-blue-500/20 to-cyan-400/5 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                                                  : 'from-fuchsia-500/20 to-pink-500/5 shadow-[0_0_20px_rgba(236,72,153,0.15)]'
                                        } group-hover:scale-110 transition-transform duration-300`}
                                    >
                                        <div
                                            className={
                                                index % 3 === 0
                                                    ? 'text-violet-400'
                                                    : index % 3 === 1
                                                      ? 'text-blue-400'
                                                      : 'text-fuchsia-400'
                                            }
                                        >
                                            {feature.icon}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-violet-300 transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-400 leading-relaxed text-sm">
                                        {feature.description}
                                    </p>

                                    {/* Hover Glow Effect */}
                                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-violet-600/10 to-blue-600/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Market Preview Section */}
            <section className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-bold text-white">
                                Theo dõi <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                                    thị trường
                                </span>{' '}
                                realtime
                            </h2>
                            <p className="text-lg text-slate-400">
                                Cập nhật liên tục chỉ số VN30, top cổ phiếu tăng/giảm mạnh và các
                                thông tin quan trọng khác.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Biểu đồ giá realtime với độ trễ tối thiểu',
                                    'Top 10 cổ phiếu theo giá trị giao dịch',
                                    'Danh sách cổ phiếu tăng/giảm mạnh nhất',
                                    'AI Advisor phân tích xu hướng thị trường'
                                ].map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
                                    >
                                        <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        <span className="text-slate-300 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="relative group">
                            {/* Glow Behind Market Card */}
                            <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full opacity-50"></div>

                            <div className="relative bg-[#0F111A]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                                    <div>
                                        <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">
                                            Chỉ số VN30
                                        </div>
                                        <div className="text-4xl font-bold text-white">1.975,5</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 font-mono text-sm inline-block mb-1 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                                            -4,03
                                        </div>
                                        <div className="text-xs text-red-400 font-medium">
                                            -0.20%
                                        </div>
                                    </div>
                                </div>

                                {/* Chart Bars */}
                                <div className="h-48 w-full mb-8 relative flex items-end justify-between gap-1.5">
                                    {[65, 45, 70, 55, 80, 60, 75, 50, 85, 65, 90, 70].map(
                                        (height, index) => (
                                            <div
                                                key={index}
                                                className={`flex-1 rounded-t-sm transition-all duration-300 hover:scale-y-110 cursor-pointer ${
                                                    index % 2 === 0
                                                        ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                                                        : 'bg-emerald-500/30'
                                                }`}
                                                style={{ height: `${height}%` }}
                                            ></div>
                                        )
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        <span>Top tăng mạnh</span>
                                    </div>
                                    {['VJC +6.97%', 'VHM +1.71%', 'VIC +0.73%'].map(
                                        (stock, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-transparent hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all cursor-pointer"
                                            >
                                                <span className="font-bold text-white">
                                                    {stock.split(' ')[0]}
                                                </span>
                                                <span className="text-emerald-400 font-mono font-bold drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">
                                                    {stock.split(' ')[1]}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Achievements Section */}
            <section
                id="achievements"
                className="py-24 px-6 bg-[#0A0C12]/50 border-y border-white/5 relative overflow-hidden"
            >
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                            Huy hiệu &{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 drop-shadow-md">
                                Thành tích
                            </span>
                        </h2>
                        <p className="text-lg text-slate-400">
                            Đạt được các mốc quan trọng trong hành trình đầu tư của bạn
                        </p>
                    </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {achievement.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{achievement.title}</h3>
                <p className="text-gray-600">{achievement.description}</p>
                <div className="mt-4 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary inline-block">
                  ✓ Hoàn thành
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Bảng{' '}
              <span className="text-primary">
                giá
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Chọn gói phù hợp với nhu cầu đầu tư của bạn
            </p>
          </div>

          {/* B2C Pricing */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Freemium */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
              <div className="text-sm font-medium text-gray-500 mb-2">Dành cho người mới</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Freemium</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">0 ₫</span>
                <span className="text-gray-500">/tháng</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-gray-700">Vốn ảo 10 triệu VND</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-gray-700">1 danh mục đầu tư</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-gray-700">Reset danh mục 1 lần/tháng</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-gray-700">Thị trường cổ phiếu VN</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-gray-700">AI Mentor cơ bản</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-gray-700">Tham gia phòng công khai</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <X className="w-5 h-5 flex-shrink-0" />
                  <span>Không có chứng chỉ</span>
                </li>
              </ul>
              <Link 
                href="/auth/register?tier=freemium" 
                className="block w-full py-3 text-center border-2 border-gray-200 rounded-full font-semibold hover:border-primary hover:text-primary transition-all"
              >
                Bắt đầu miễn phí
              </Link>
            </div>

            {/* Standard - Popular */}
            <div className="bg-white rounded-3xl p-8 border-2 border-primary shadow-xl relative transform scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-sm font-semibold rounded-full">
                Phổ biến nhất
              </div>
              <div className="text-sm font-medium text-primary mb-2">Dành cho sinh viên</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Standard</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">99.000 ₫</span>
                <span className="text-gray-500">/tháng</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-gray-700">Vốn ảo 100 triệu VND</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-gray-700">3 danh mục đầu tư</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-gray-700">Reset danh mục 3 lần/tháng</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-gray-700">Thị trường cổ phiếu VN</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-gray-700">AI Mentor nâng cao</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-gray-700">Tạo phòng riêng (tối đa 10 người)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-gray-700">Chứng chỉ hoàn thành khóa học</span>
                </li>
              </ul>
              <Link 
                href="/auth/register?tier=standard" 
                className="block w-full py-3 text-center bg-primary text-white rounded-full font-semibold hover:bg-primary/90 hover:shadow-lg transition-all"
              >
                Đăng ký ngay
              </Link>
            </div>

            {/* Advanced */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
              <div className="text-sm font-medium text-accent mb-2">Dành cho chuyên gia</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Advanced</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">349.000 ₫</span>
                <span className="text-gray-500">/tháng</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-gray-700">Vốn ảo không giới hạn</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-gray-700">10+ danh mục đầu tư</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-gray-700">Reset danh mục không giới hạn</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-gray-700">VN + Crypto + US Stocks</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-gray-700">AI Mentor cao cấp</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-gray-700">Tổ chức cuộc thi lớn</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-gray-700">Không quảng cáo + Huy hiệu kỹ năng</span>
                </li>
              </ul>
              <Link 
                href="/auth/register?tier=advanced" 
                className="block w-full py-3 text-center border-2 border-gray-200 rounded-full font-semibold hover:border-primary hover:text-primary transition-all"
              >
                Nâng cấp Pro
              </Link>
            </div>
          </div>

          {/* B2B Academic License */}
          <div className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-200">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-block px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-sm text-accent font-medium mb-4">
                  🎓 Dành cho tổ chức giáo dục
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Academic License</h3>
                <p className="text-xl text-gray-600 mb-6">
                  Giải pháp đào tạo đầu tư cho trường đại học, cao đẳng và trung tâm đào tạo
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">69.000 ₫</span>
                  <span className="text-gray-500">/sinh viên/tháng</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-gray-700">Mua theo gói số lượng lớn</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-gray-700">Quản lý sinh viên tập trung</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-gray-700">Phòng thực hành ảo cho sinh viên</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-gray-700">Báo cáo tiến độ học tập</span>
                  </li>
                </ul>
                <button className="px-8 py-4 bg-accent text-white rounded-full font-semibold hover:bg-accent/90 hover:shadow-xl transition-all flex items-center gap-2">
                  Liên hệ tư vấn
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="hidden md:block">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">🏫</div>
                    <h4 className="text-xl font-semibold text-gray-900">Đối tác của chúng tôi</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center text-gray-600">
                    <div className="p-4 bg-gray-50 rounded-lg">Đại học</div>
                    <div className="p-4 bg-gray-50 rounded-lg">Cao đẳng</div>
                    <div className="p-4 bg-gray-50 rounded-lg">THPT</div>
                    <div className="p-4 bg-gray-50 rounded-lg">Trung tâm đào tạo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

            {/* CTA Section */}
            <section className="py-32 px-6 relative overflow-hidden">
                {/* Center Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-violet-600/20 to-blue-600/20 blur-[120px] rounded-full"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] p-12 border border-white/10 shadow-2xl relative overflow-hidden group">
                        {/* Shimmer Border Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight">
                                Bắt đầu hành trình đầu tư của bạn
                            </h2>
                            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                                Tham gia cùng hàng nghìn nhà đầu tư thông minh đang sử dụng Stockie
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/auth/register"
                                    className="px-10 py-4 bg-white text-[#0B0E14] rounded-2xl font-bold text-lg hover:bg-slate-200 hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                >
                                    Đăng ký miễn phí
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                                <button className="px-10 py-4 bg-transparent border border-white/20 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all">
                                    Liên hệ tư vấn
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 px-6 border-t border-white/10 bg-[#020203]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 mb-4">
                                <span className="text-2xl font-bold text-white tracking-tighter">
                                    Stockie
                                </span>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Nền tảng đầu tư chứng khoán thông minh cho mọi người
                            </p>
                        </div>
                        {['Sản phẩm', 'Công ty', 'Hỗ trợ'].map((col, idx) => (
                            <div key={idx}>
                                <h4 className="font-bold text-white mb-6">{col}</h4>
                                <ul className="space-y-4 text-slate-400 text-sm">
                                    {[1, 2, 3].map((i) => (
                                        <li key={i}>
                                            <a
                                                href="#"
                                                className="hover:text-violet-400 transition-colors"
                                            >
                                                {col === 'Sản phẩm'
                                                    ? ['Tính năng', 'Bảng giá', 'API'][i - 1]
                                                    : col === 'Công ty'
                                                      ? ['Về chúng tôi', 'Blog', 'Tuyển dụng'][
                                                            i - 1
                                                        ]
                                                      : [
                                                            'Trung tâm trợ giúp',
                                                            'Liên hệ',
                                                            'Điều khoản'
                                                        ][i - 1]}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="pt-8 border-t border-white/10 text-center text-slate-500">
                        <p>© 2025 Stockie. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                .delay-200 {
                    animation-delay: 0.2s;
                }
            `}</style>
        </div>
    );
}
