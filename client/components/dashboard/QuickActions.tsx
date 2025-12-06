import { useState } from 'react';
import { useRouter } from 'next/navigation';

type QuickActionsProps = {
    onLogout?: () => void;
};

const ACTION_COPY = {
    BUY: {
        title: 'Mua cổ phiếu ngay',
        description:
            'Chuyển tới màn hình trading để đặt lệnh mua, theo dõi phí và tổng chi phí thời gian thực.',
        buttonLabel: 'Đi tới giao dịch'
    },
    SELL: {
        title: 'Bán cổ phiếu',
        description: 'Đặt lệnh bán nhanh chóng và đồng bộ số dư theo hướng dẫn stock-transactions.',
        buttonLabel: 'Mở trading'
    }
} as const;

export default function QuickActions({ onLogout }: QuickActionsProps) {
    const router = useRouter();
    const [selectedAction, setSelectedAction] = useState<keyof typeof ACTION_COPY | null>(null);

    const handleNavigateTrade = () => {
        router.push('/trade');
    };

    return (
        <div className="lg:col-span-1 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl p-6 space-y-4 transition-all duration-300 animate-scale-in">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
            <div className="space-y-3">
                <button
                    className="w-full flex items-center justify-between p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-all group"
                    onClick={() => setSelectedAction('BUY')}
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-primary rounded-lg p-3 group-hover:scale-110 transition-transform">
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                        </div>
                        <span className="font-semibold text-gray-900">Mua cổ phiếu</span>
                    </div>
                    <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </button>

                <button
                    className="w-full flex items-center justify-between p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-all group"
                    onClick={() => setSelectedAction('SELL')}
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-primary rounded-lg p-3 group-hover:scale-110 transition-transform">
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                            </svg>
                        </div>
                        <span className="font-semibold text-gray-900">Bán cổ phiếu</span>
                    </div>
                    <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary rounded-lg p-3 group-hover:scale-110 transition-transform">
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                        </div>
                        <span className="font-semibold text-gray-900">Xem báo cáo</span>
                    </div>
                    <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </button>

                {onLogout && (
                    <button
                        className="w-full flex items-center justify-between p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-all group"
                        onClick={onLogout}
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-primary rounded-lg p-3 group-hover:scale-110 transition-transform">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    />
                                </svg>
                            </div>
                            <span className="font-semibold text-gray-900">Đăng xuất</span>
                        </div>
                        <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                )}
            </div>
            {selectedAction && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 space-y-3 shadow-inner">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold uppercase text-primary">
                                {selectedAction === 'BUY' ? 'Mua cổ phiếu' : 'Bán cổ phiếu'}
                            </p>
                            <h3 className="text-lg font-bold text-gray-900">
                                {ACTION_COPY[selectedAction].title}
                            </h3>
                        </div>
                        <button
                            className="text-gray-400 hover:text-gray-600 transition"
                            onClick={() => setSelectedAction(null)}
                            aria-label="Đóng hộp thoại thao tác"
                        >
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
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                    <p className="text-sm text-gray-600">
                        {ACTION_COPY[selectedAction].description}
                    </p>
                    <div className="flex gap-3">
                        <button
                            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition"
                            onClick={handleNavigateTrade}
                        >
                            {ACTION_COPY[selectedAction].buttonLabel}
                        </button>
                        <button
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white"
                            onClick={() => setSelectedAction(null)}
                        >
                            Để sau
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
