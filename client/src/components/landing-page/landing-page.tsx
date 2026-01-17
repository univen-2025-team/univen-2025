
"use client";
import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Award, Shield, BarChart3, LineChart, Menu, X, ChevronRight, Check, Zap, Users, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function StockieHomepage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');

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
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: <LineChart className="w-8 h-8" />,
      title: 'Phân tích thị trường',
      description: 'Dữ liệu thị trường realtime với biểu đồ VN30 và các chỉ số quan trọng',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Hệ thống huy hiệu',
      description: 'Đạt được các thành tích và huy hiệu khi hoàn thành mục tiêu đầu tư',
      color: 'from-pink-500 to-red-600'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'AI Advisor',
      description: 'Trợ lý AI thông minh hỗ trợ quyết định đầu tư của bạn',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Bảng xếp hạng',
      description: 'Xem top cổ phiếu tăng/giảm mạnh và so sánh với thị trường',
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Bảo mật cao',
      description: 'Thông tin đầu tư của bạn được bảo vệ với công nghệ mã hóa hiện đại',
      color: 'from-teal-500 to-cyan-600'
    }
  ];

  const achievements = [
    {
      icon: '🎯',
      title: 'Giao dịch đầu tiên',
      description: 'Hoàn thành giao dịch đầu tiên của bạn'
    },
    {
      icon: '🏆',
      title: 'Top 10',
      description: 'Lọt vào top 10 bảng xếp hạng'
    },
    {
      icon: '👑',
      title: 'Top 3',
      description: 'Lọt vào top 3 bảng xếp hạng'
    },
    {
      icon: '👑',
      title: 'Quán quân',
      description: 'Đứng đầu bảng xếp hạng'
    },
    {
      icon: '📈',
      title: 'Triệu phú',
      description: 'Đạt lợi nhuận 1 triệu đồng'
    },
    {
      icon: '⭐',
      title: 'Cao thủ',
      description: 'Đạt lợi nhuận 10 triệu đồng'
    }
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

  // Supplemented from tradetutor-ai
  const MOCK_CHART_DATA = [
    { time: '10:00', open: 150, close: 152, high: 153, low: 149, volume: 1200 },
    { time: '10:15', open: 152, close: 151, high: 152.5, low: 150.5, volume: 900 },
    { time: '10:30', open: 151, close: 154, high: 155, low: 151, volume: 1500, event: 'Earning Report', insight: "Price spiked due to better-than-expected earnings." },
    { time: '10:45', open: 154, close: 153, high: 154.5, low: 152, volume: 800 },
    { time: '11:00', open: 153, close: 156, high: 157, low: 152.5, volume: 2100, event: 'Breakout', insight: "High volume breakout above resistance level." },
    { time: '11:15', open: 156, close: 155, high: 156.5, low: 154, volume: 1000 },
    { time: '11:30', open: 155, close: 158, high: 159, low: 155, volume: 1800 },
    { time: '11:45', open: 158, close: 157, high: 158.5, low: 156.5, volume: 950 },
    { time: '12:00', open: 157, close: 160, high: 161, low: 157, volume: 2500, event: 'News Alert', insight: "CEO announces new partnership." },
    { time: '12:15', open: 160, close: 159, high: 160.5, low: 158, volume: 1100 },
  ];

  const AI_SUGGESTIONS = [
    "Tại sao giá tăng lúc 11:00?",
    "Đây có phải là xu hướng tăng?",
    "Khối lượng giao dịch có ý nghĩa gì?",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-950/95 backdrop-blur-lg shadow-lg shadow-purple-500/10' : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-xl">
                S
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                STOCKIE
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-purple-400 transition-colors">Tính năng</a>
              <a href="#achievements" className="hover:text-purple-400 transition-colors">Huy hiệu</a>
              <a href="#pricing" className="hover:text-purple-400 transition-colors">Bảng giá</a>
              <a href="#contact" className="hover:text-purple-400 transition-colors">Liên hệ</a>
              <Link href="/dashboard" className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all text-white">
                Bắt đầu
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-4 animate-fadeIn">
              <a href="#features" className="block hover:text-purple-400 transition-colors">Tính năng</a>
              <a href="#achievements" className="block hover:text-purple-400 transition-colors">Huy hiệu</a>
              <a href="#pricing" className="block hover:text-purple-400 transition-colors">Bảng giá</a>
              <a href="#contact" className="block hover:text-purple-400 transition-colors">Liên hệ</a>
              <Link href="/dashboard" className="w-full px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-center block text-white">
                Bắt đầu
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fadeIn">
              <div className="inline-block px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm">
                🚀 Nền tảng đầu tư thông minh #1 Việt Nam
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Đầu tư{' '}
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  chứng khoán
                </span>{' '}
                dễ dàng hơn bao giờ hết
              </h1>

              <p className="text-xl text-slate-400">
                Quản lý danh mục, phân tích thị trường realtime, và nhận tư vấn từ AI.
                Tất cả trong một nền tảng hiện đại.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center gap-2 group text-white">
                  Bắt đầu miễn phí
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/dashboard" className="px-8 py-4 border border-slate-700 rounded-full font-semibold hover:border-purple-500 transition-all text-white">
                  Xem demo
                </Link>
              </div>

              <div className="flex gap-8 pt-4">
                {stats.map((stat, index) => (
                  <div key={index} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Dashboard Preview */}
            <div className="relative animate-fadeIn" style={{ animationDelay: '200ms' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 blur-3xl"></div>
              <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Danh mục đầu tư</h3>
                  <RefreshCw className="w-5 h-5 text-slate-400 hover:text-purple-400 cursor-pointer hover:rotate-180 transition-all duration-500" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="text-sm text-slate-400 mb-1">Số dư khả dụng</div>
                    <div className="text-2xl font-bold">{portfolioData.balance}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="text-sm text-slate-400 mb-1">Tổng đã đầu tư</div>
                    <div className="text-2xl font-bold">{portfolioData.invested}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="text-sm text-slate-400 mb-1">Giá trị hiện tại</div>
                    <div className="text-2xl font-bold">{portfolioData.value}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
                    <div className="text-sm text-slate-400 mb-1">Lãi/Lỗ</div>
                    <div className="text-2xl font-bold text-green-400">{portfolioData.profit}</div>
                    <div className="text-sm text-green-400">{portfolioData.profitPercent}</div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">Cổ phiếu đang có (1)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold">
                        A
                      </div>
                      <div>
                        <div className="font-semibold">ACB</div>
                        <div className="text-sm text-slate-400">10 cổ phiếu</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">243.500 ₫</div>
                      <div className="text-sm text-green-400">+0.00%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Tính năng{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                vượt trội
              </span>
            </h2>
            <p className="text-xl text-slate-400">
              Mọi thứ bạn cần để trở thành nhà đầu tư thông minh
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:-translate-y-2 cursor-pointer animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Preview Section */}
      <section className="py-20 px-6 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">
                Theo dõi{' '}
                <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                  thị trường
                </span>{' '}
                realtime
              </h2>
              <p className="text-xl text-slate-400">
                Cập nhật liên tục chỉ số VN30, top cổ phiếu tăng/giảm mạnh và các thông tin quan trọng khác.
              </p>
              <ul className="space-y-4">
                {[
                  'Biểu đồ giá realtime với độ trễ tối thiểu',
                  'Top 10 cổ phiếu theo giá trị giao dịch',
                  'Danh sách cổ phiếu tăng/giảm mạnh nhất',
                  'AI Advisor phân tích xu hướng thị trường'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-600/20 blur-3xl"></div>
              <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-slate-400">Chỉ số VN30</div>
                    <div className="text-3xl font-bold">1.975,5</div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-400 text-lg font-semibold">-4,03 điểm</div>
                    <div className="text-red-400">-0.20%</div>
                  </div>
                </div>

                <div className="h-48 bg-gradient-to-t from-slate-800/50 to-transparent rounded-xl mb-4 flex items-end p-4">
                  {[65, 45, 70, 55, 80, 60, 75, 50, 85, 65, 90, 70].map((height, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-gradient-to-t from-purple-500 to-blue-500 mx-0.5 rounded-t opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                      style={{ height: `${height}%` }}
                    ></div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Top tăng mạnh</span>
                  </div>
                  {['VJC +6.97%', 'VHM +1.71%', 'VIC +0.73%'].map((stock, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-500/10 rounded-lg">
                      <span className="font-semibold">{stock.split(' ')[0]}</span>
                      <span className="text-green-400">{stock.split(' ')[1]}</span>
                    </div>
                  ))}
                </div>

                {/* AI Insights from tradetutor-ai */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-semibold text-yellow-500">AI Inisghts</span>
                  </div>
                  <div className="space-y-2">
                    {MOCK_CHART_DATA.filter(d => d.insight).slice(0, 2).map((data, i) => (
                      <div key={i} className="text-xs text-slate-400 p-2 bg-slate-800/50 rounded border border-slate-700">
                        <span className="font-bold text-slate-300">{data.event}:</span> {data.insight}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Huy hiệu &{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-600 bg-clip-text text-transparent">
                Thành tích
              </span>
            </h2>
            <p className="text-xl text-slate-400">
              Đạt được các mốc quan trọng trong hành trình đầu tư của bạn
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:-translate-y-2 cursor-pointer group animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {achievement.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{achievement.title}</h3>
                <p className="text-slate-400">{achievement.description}</p>
                <div className="mt-4 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-blue-400 inline-block">
                  ✓ Hoàn thành
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-3xl p-12 border border-purple-500/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 blur-3xl"></div>
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Bắt đầu hành trình đầu tư của bạn
              </h2>
              <p className="text-xl text-slate-300 mb-8">
                Tham gia cùng hàng nghìn nhà đầu tư thông minh đang sử dụng Stockie
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/auth/register" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center gap-2 text-white">
                  Đăng ký miễn phí
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <button className="px-8 py-4 bg-white text-slate-900 rounded-full font-semibold hover:shadow-2xl hover:shadow-white/50 transition-all">
                  Liên hệ tư vấn
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-xl">
                  S
                </div>
                <span className="text-xl font-bold">STOCKIE</span>
              </div>
              <p className="text-slate-400">
                Nền tảng đầu tư chứng khoán thông minh cho mọi người
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Tính năng</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Bảng giá</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Công ty</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Tuyển dụng</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Liên hệ</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Điều khoản</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-slate-400">
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
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}