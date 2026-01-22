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
        <div className="lg:col-span-1 relative group/quick">
            <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                <h2 className="text-xl font-bold text-[#2D3748] mb-4">Thao tác nhanh</h2>
                <div className="space-y-3">
                    <button
                        className="w-full flex items-center justify-between p-4 bg-[#F0F4FF] hover:bg-[#E0E8FF] rounded-lg transition-all group border border-gray-200 hover:border-[#2D5BDE]/30"
                        onClick={() => setSelectedAction('BUY')}
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-[#2D5BDE] rounded-lg p-3 group-hover:scale-110 transition-transform">
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
                            <span className="font-semibold text-[#2D3748]">Mua cổ phiếu</span>
                        </div>
                        <svg
                            className="w-5 h-5 text-[#718096]"
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
                        className="w-full flex items-center justify-between p-4 bg-[#F0F4FF] hover:bg-[#E0E8FF] rounded-lg transition-all group border border-gray-200 hover:border-[#2D5BDE]/30"
                        onClick={() => setSelectedAction('SELL')}
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-[#2D5BDE] rounded-lg p-3 group-hover:scale-110 transition-transform">
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
                                        d="M20 12H4"
                                    />
                                </svg>
                            </div>
                            <span className="font-semibold text-[#2D3748]">Bán cổ phiếu</span>
                        </div>
                        <svg
                            className="w-5 h-5 text-[#718096]"
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

                    <button className="w-full flex items-center justify-between p-4 bg-[#F0F4FF] hover:bg-[#E0E8FF] rounded-lg transition-all group border border-gray-200 hover:border-[#2D5BDE]/30">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#2D5BDE] rounded-lg p-3 group-hover:scale-110 transition-transform">
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
                            <span className="font-semibold text-[#2D3748]">Xem báo cáo</span>
                        </div>
                        <svg
                            className="w-5 h-5 text-[#718096]"
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
                            className="w-full flex items-center justify-between p-4 bg-[#F0F4FF] hover:bg-red-50 rounded-lg transition-all group border border-gray-200 hover:border-red-300"
                            onClick={onLogout}
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-red-100 rounded-lg p-3 group-hover:scale-110 transition-transform">
                                    <svg
                                        className="w-6 h-6 text-red-600"
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
                                <span className="font-semibold text-red-600">Đăng xuất</span>
                            </div>
                            <svg
                                className="w-5 h-5 text-[#718096]"
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
                    <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-3 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold uppercase text-[#2D5BDE]">
                                    {selectedAction === 'BUY' ? 'Mua cổ phiếu' : 'Bán cổ phiếu'}
                                </p>
                                <h3 className="text-lg font-bold text-[#2D3748]">
                                    {ACTION_COPY[selectedAction].title}
                                </h3>
                            </div>
                            <button
                                className="text-[#718096] hover:text-[#2D3748] transition"
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
                        <p className="text-sm text-[#718096]">
                            {ACTION_COPY[selectedAction].description}
                        </p>
                        <div className="flex gap-3">
                            <button
                                className="flex-1 rounded-lg bg-[#2D5BDE] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
                                onClick={handleNavigateTrade}
                            >
                                {ACTION_COPY[selectedAction].buttonLabel}
                            </button>
                            <button
                                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-[#2D3748] hover:bg-gray-50 transition"
                                onClick={() => setSelectedAction(null)}
                            >
                                Để sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
