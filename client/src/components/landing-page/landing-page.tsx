"use client";
import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Award, Shield, BarChart3, LineChart, Menu, X, ChevronRight, Check, Zap, Users, RefreshCw } from 'lucide-react';
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
    { icon: '🎯', title: 'Giao dịch đầu tiên', description: 'Hoàn thành giao dịch đầu tiên của bạn' },
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
    <div className="min-h-screen bg-background text-gray-900">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image
                src="/stockie-logo.png"
                alt="Stockie"
                width={120}
                height={40}
                className="object-contain"
                priority
              />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary transition-colors">Tính năng</a>
              <a href="#achievements" className="text-gray-600 hover:text-primary transition-colors">Huy hiệu</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary transition-colors">Bảng giá</a>
              <a href="#contact" className="text-gray-600 hover:text-primary transition-colors">Liên hệ</a>
              <Link href="/dashboard" className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 hover:shadow-lg transition-all">
                Bắt đầu
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-4 animate-fadeIn">
              <a href="#features" className="block text-gray-600 hover:text-primary transition-colors">Tính năng</a>
              <a href="#achievements" className="block text-gray-600 hover:text-primary transition-colors">Huy hiệu</a>
              <a href="#pricing" className="block text-gray-600 hover:text-primary transition-colors">Bảng giá</a>
              <a href="#contact" className="block text-gray-600 hover:text-primary transition-colors">Liên hệ</a>
              <Link href="/dashboard" className="w-full px-6 py-2 bg-primary text-white rounded-full text-center block">
                Bắt đầu
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-1/4 w-72 h-72 bg-accent/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fadeIn">
              <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary font-medium">
                🚀 Học đầu tư chứng khoán qua thực hành
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Đầu tư{' '}
                <span className="text-primary">
                  chứng khoán
                </span>{' '}
                dễ dàng hơn bao giờ hết
              </h1>

              <p className="text-xl text-gray-600">
                Quản lý danh mục, phân tích thị trường realtime, và nhận tư vấn từ AI.
                Tất cả trong một nền tảng hiện đại.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard" className="px-8 py-4 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 hover:shadow-xl transition-all flex items-center gap-2 group">
                  Bắt đầu miễn phí
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/dashboard" className="px-8 py-4 border-2 border-gray-200 rounded-full font-semibold hover:border-primary hover:text-primary transition-all">
                  Xem demo
                </Link>
              </div>

              <div className="flex gap-8 pt-4">
                {stats.map((stat, index) => (
                  <div key={index} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="text-3xl font-bold text-primary">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Dashboard Preview */}
            <div className="relative animate-fadeIn" style={{ animationDelay: '200ms' }}>
              <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Danh mục đầu tư</h3>
                  <RefreshCw className="w-5 h-5 text-gray-400 hover:text-primary cursor-pointer hover:rotate-180 transition-all duration-500" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 mb-1">Số dư khả dụng</div>
                    <div className="text-2xl font-bold text-gray-900">{portfolioData.balance}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 mb-1">Tổng đã đầu tư</div>
                    <div className="text-2xl font-bold text-gray-900">{portfolioData.invested}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 mb-1">Giá trị hiện tại</div>
                    <div className="text-2xl font-bold text-gray-900">{portfolioData.value}</div>
                  </div>
                  <div className="bg-success/10 rounded-xl p-4 border border-success/30">
                    <div className="text-sm text-gray-500 mb-1">Lãi/Lỗ</div>
                    <div className="text-2xl font-bold text-success">{portfolioData.profit}</div>
                    <div className="text-sm text-success">{portfolioData.profitPercent}</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">Cổ phiếu đang có (1)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-bold text-white">
                        A
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">ACB</div>
                        <div className="text-sm text-gray-500">10 cổ phiếu</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">243.500 ₫</div>
                      <div className="text-sm text-success">+0.00%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Tính năng{' '}
              <span className="text-primary">
                vượt trội
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Mọi thứ bạn cần để trở thành nhà đầu tư thông minh
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Preview Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">
                Theo dõi{' '}
                <span className="text-success">
                  thị trường
                </span>{' '}
                realtime
              </h2>
              <p className="text-xl text-gray-600">
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
                    <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Chỉ số VN30</div>
                    <div className="text-3xl font-bold text-gray-900">1.975,5</div>
                  </div>
                  <div className="text-right">
                    <div className="text-error text-lg font-semibold">-4,03 điểm</div>
                    <div className="text-error">-0.20%</div>
                  </div>
                </div>

                <div className="h-48 bg-gray-50 rounded-xl mb-4 flex items-end p-4">
                  {[65, 45, 70, 55, 80, 60, 75, 50, 85, 65, 90, 70].map((height, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-primary mx-0.5 rounded-t opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                      style={{ height: `${height}%` }}
                    ></div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Top tăng mạnh</span>
                  </div>
                  {['VJC +6.97%', 'VHM +1.71%', 'VIC +0.73%'].map((stock, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-success/10 rounded-lg">
                      <span className="font-semibold text-gray-900">{stock.split(' ')[0]}</span>
                      <span className="text-success">{stock.split(' ')[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Huy hiệu &{' '}
              <span className="text-warning">
                Thành tích
              </span>
            </h2>
            <p className="text-xl text-gray-600">
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
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-primary/5 rounded-3xl p-12 border border-primary/20 relative overflow-hidden">
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                Bắt đầu hành trình đầu tư của bạn
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Tham gia cùng hàng nghìn nhà đầu tư thông minh đang sử dụng Stockie
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/auth/register" className="px-8 py-4 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 hover:shadow-xl transition-all flex items-center gap-2">
                  Đăng ký miễn phí
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <button className="px-8 py-4 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 hover:shadow-xl transition-all">
                  Liên hệ tư vấn
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src="/stockie-logo.png"
                  alt="Stockie"
                  width={100}
                  height={32}
                  className="object-contain"
                />
              </div>
              <p className="text-gray-600">
                Nền tảng đầu tư chứng khoán thông minh cho mọi người
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Sản phẩm</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-primary transition-colors">Tính năng</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Bảng giá</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Công ty</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-primary transition-colors">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Tuyển dụng</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Hỗ trợ</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-primary transition-colors">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Liên hệ</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Điều khoản</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 text-center text-gray-500">
            <p>© 2025 Stockie. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
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
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}