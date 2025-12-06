type ActivityItem = {
    id: string;
    type: 'buy' | 'sell' | 'dividend' | 'completed';
    title: string;
    description: string;
    amount: string;
    price: string;
    iconColor: string;
    iconBgColor: string;
};

const activities: ActivityItem[] = [
    {
        id: '1',
        type: 'buy',
        title: 'Mua VNM',
        description: '100 cổ phiếu • 09:30 AM',
        amount: '+5,250,000 ₫',
        price: '52,500 ₫/CP',
        iconColor: 'text-success',
        iconBgColor: 'bg-green-100'
    },
    {
        id: '2',
        type: 'sell',
        title: 'Bán HPG',
        description: '50 cổ phiếu • 08:15 AM',
        amount: '-1,575,000 ₫',
        price: '31,500 ₫/CP',
        iconColor: 'text-error',
        iconBgColor: 'bg-red-100'
    },
    {
        id: '3',
        type: 'dividend',
        title: 'Nhận cổ tức VIC',
        description: '200 cổ phiếu • Hôm qua',
        amount: '+600,000 ₫',
        price: '3,000 ₫/CP',
        iconColor: 'text-primary',
        iconBgColor: 'bg-primary/10'
    },
    {
        id: '4',
        type: 'completed',
        title: 'Lệnh đặt mua FPT thành công',
        description: '75 cổ phiếu • 2 ngày trước',
        amount: 'Hoàn tất',
        price: '85,500 ₫/CP',
        iconColor: 'text-accent',
        iconBgColor: 'bg-accent/10'
    }
];

const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
        case 'buy':
            return (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
            );
        case 'sell':
            return (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
            );
        case 'dividend':
            return (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            );
        case 'completed':
            return (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            );
    }
};

const getAmountColor = (type: ActivityItem['type']) => {
    switch (type) {
        case 'buy':
            return 'text-success';
        case 'sell':
            return 'text-error';
        case 'dividend':
            return 'text-primary';
        case 'completed':
            return 'text-accent';
    }
};

export default function RecentActivity() {
    return (
        <div className="lg:col-span-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl p-6 transition-all duration-300 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Hoạt động gần đây</h2>
                <button className="text-primary hover:text-primary text-sm font-semibold">
                    Xem tất cả →
                </button>
            </div>
            <div className="space-y-4">
                {activities.map((activity) => (
                    <div
                        key={activity.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <div className={`${activity.iconBgColor} rounded-full p-3`}>
                            <svg
                                className={`w-6 h-6 ${activity.iconColor}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {getIcon(activity.type)}
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-600">{activity.description}</p>
                        </div>
                        <div className="text-right">
                            <p className={`font-bold ${getAmountColor(activity.type)}`}>
                                {activity.amount}
                            </p>
                            <p className="text-sm text-gray-600">{activity.price}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
