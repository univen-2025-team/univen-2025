'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Crown, Zap, Loader2 } from 'lucide-react';
import { subscriptionApi, SubscriptionTier, SubscriptionLimits } from '@/lib/api/subscription.api';

const tierDisplayNames: Record<SubscriptionTier, string> = {
    freemium: 'Freemium',
    standard: 'Standard',
    advanced: 'Advanced',
    academic: 'Academic'
};

const tierColors: Record<SubscriptionTier, string> = {
    freemium: 'border-gray-200',
    standard: 'border-primary',
    advanced: 'border-accent',
    academic: 'border-warning'
};

export default function SubscriptionPage() {
    const [currentLimits, setCurrentLimits] = useState<SubscriptionLimits | null>(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState<SubscriptionTier | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadSubscriptionInfo();
    }, []);

    const loadSubscriptionInfo = async () => {
        try {
            const limits = await subscriptionApi.getLimits();
            setCurrentLimits(limits);
        } catch (error) {
            console.error('Failed to load subscription info', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (tier: SubscriptionTier) => {
        if (currentLimits?.tier === tier) {
            setMessage({ type: 'error', text: 'Bạn đã đang sử dụng gói này' });
            return;
        }

        setSubscribing(tier);
        setMessage(null);
        try {
            await subscriptionApi.subscribe(tier);
            setMessage({ type: 'success', text: `Đã nâng cấp thành công lên gói ${tierDisplayNames[tier]}!` });
            await loadSubscriptionInfo();
            // Reload page to refresh user data
            window.location.reload();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Có lỗi xảy ra' });
        } finally {
            setSubscribing(null);
        }
    };

    const plans = [
        {
            tier: 'freemium' as SubscriptionTier,
            name: 'Freemium',
            description: 'Dành cho người mới',
            price: 0,
            features: [
                { text: 'Vốn ảo 10 triệu VND', included: true },
                { text: '1 danh mục đầu tư', included: true },
                { text: 'Reset danh mục 1 lần/tháng', included: true },
                { text: 'Thị trường cổ phiếu VN', included: true },
                { text: 'AI Mentor cơ bản', included: true },
                { text: 'Tham gia phòng công khai', included: true },
                { text: 'Chứng chỉ', included: false },
            ]
        },
        {
            tier: 'standard' as SubscriptionTier,
            name: 'Standard',
            description: 'Dành cho sinh viên',
            price: 99000,
            popular: true,
            features: [
                { text: 'Vốn ảo 100 triệu VND', included: true },
                { text: '3 danh mục đầu tư', included: true },
                { text: 'Reset danh mục 3 lần/tháng', included: true },
                { text: 'Thị trường cổ phiếu VN', included: true },
                { text: 'AI Mentor nâng cao', included: true },
                { text: 'Tạo phòng riêng (10 người)', included: true },
                { text: 'Chứng chỉ hoàn thành', included: true },
            ]
        },
        {
            tier: 'advanced' as SubscriptionTier,
            name: 'Advanced',
            description: 'Dành cho chuyên gia',
            price: 349000,
            features: [
                { text: 'Vốn ảo không giới hạn', included: true },
                { text: '10+ danh mục đầu tư', included: true },
                { text: 'Reset không giới hạn', included: true },
                { text: 'VN + Crypto + US Stocks', included: true },
                { text: 'AI Mentor cao cấp', included: true },
                { text: 'Tổ chức cuộc thi lớn', included: true },
                { text: 'Không quảng cáo + Huy hiệu', included: true },
            ]
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold mb-2">Nâng cấp gói của bạn</h1>
                <p className="text-gray-600">
                    Gói hiện tại: <span className="font-semibold text-primary">{tierDisplayNames[currentLimits?.tier || 'freemium']}</span>
                </p>
            </div>

            {/* Message display */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 
                    'bg-red-100 text-red-800 border border-red-200'
                }`}>
                    {message.text}
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const isCurrentPlan = currentLimits?.tier === plan.tier;
                    const isSubscribing = subscribing === plan.tier;

                    return (
                        <div
                            key={plan.tier}
                            className={`bg-white rounded-2xl p-6 border-2 ${
                                isCurrentPlan ? 'border-primary ring-2 ring-primary/20' : 
                                plan.popular ? 'border-primary shadow-lg' : 'border-gray-200'
                            } relative transition-all hover:shadow-xl`}
                        >
                            {plan.popular && !isCurrentPlan && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                                    Phổ biến nhất
                                </div>
                            )}
                            {isCurrentPlan && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-success text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                    <Crown className="w-3 h-3" />
                                    Gói hiện tại
                                </div>
                            )}

                            <div className="text-sm font-medium text-gray-500 mb-1">{plan.description}</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                            <div className="mb-4">
                                <span className="text-3xl font-bold text-gray-900">
                                    {plan.price.toLocaleString('vi-VN')} ₫
                                </span>
                                <span className="text-gray-500">/tháng</span>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-sm">
                                        {feature.included ? (
                                            <Check className="w-4 h-4 text-success flex-shrink-0" />
                                        ) : (
                                            <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                        )}
                                        <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                                            {feature.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSubscribe(plan.tier)}
                                disabled={isCurrentPlan || isSubscribing}
                                className={`w-full py-3 rounded-full font-semibold transition-all flex items-center justify-center gap-2 ${
                                    isCurrentPlan
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : plan.popular
                                        ? 'bg-primary text-white hover:bg-primary/90'
                                        : 'border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                                }`}
                            >
                                {isSubscribing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : isCurrentPlan ? (
                                    'Đang sử dụng'
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4" />
                                        Nâng cấp ngay
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                <h3 className="font-semibold mb-2">📝 Lưu ý</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Việc nâng cấp sẽ có hiệu lực ngay lập tức</li>
                    <li>• Balance sẽ được cập nhật theo gói mới</li>
                    <li>• Bạn có thể hạ cấp hoặc nâng cấp bất kỳ lúc nào</li>
                </ul>
            </div>
        </div>
    );
}
