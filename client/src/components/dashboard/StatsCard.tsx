import React from 'react';

type StatsCardProps = {
    title: string;
    value: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    borderColor: string;
    icon: React.ReactNode;
    iconBgColor: string;
};

export default function StatsCard({
    title,
    value,
    change,
    changeType = 'neutral',
    borderColor,
    icon,
    iconBgColor
}: StatsCardProps) {
    const changeColorMap = {
        positive: 'text-green-400',
        negative: 'text-red-400',
        neutral: 'text-gray-400'
    };

    const changeIcon =
        changeType === 'positive' ? (
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
            </svg>
        ) : changeType === 'negative' ? (
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
            </svg>
        ) : (
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
            </svg>
        );

    return (
        <div className="relative group">
            {/* Gradient glow effect */}
            <div
                className={`absolute -inset-0.5 bg-gradient-to-r ${borderColor === 'border-l-violet-500' ? 'from-violet-500 to-pink-500' : borderColor === 'border-l-emerald-500' ? 'from-emerald-500 to-cyan-500' : borderColor === 'border-l-amber-500' ? 'from-amber-500 to-orange-500' : 'from-blue-500 to-indigo-500'} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500`}
            ></div>
            <div className="relative bg-[#0F111A]/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 border border-white/10 ring-1 ring-white/5 hover:shadow-violet-500/10 transition-all duration-300">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm font-medium">{title}</p>
                        <h3 className="text-2xl font-bold text-white mt-2 drop-shadow-md">
                            {value}
                        </h3>
                        {change && (
                            <p
                                className={`${changeColorMap[changeType]} text-sm mt-2 flex items-center`}
                            >
                                {changeIcon}
                                {change}
                            </p>
                        )}
                    </div>
                    <div className={iconBgColor}>{icon}</div>
                </div>
            </div>
        </div>
    );
}
