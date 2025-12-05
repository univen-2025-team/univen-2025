import React from "react";

type StatsCardProps = {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  borderColor: string;
  icon: React.ReactNode;
  iconBgColor: string;
};

export default function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  borderColor,
  icon,
  iconBgColor,
}: StatsCardProps) {
  const changeColorMap = {
    positive: "text-success",
    negative: "text-error",
    neutral: "text-gray-600",
  };

  const changeIcon = changeType === "positive" ? (
    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  ) : changeType === "negative" ? (
    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  ) : (
    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${borderColor} hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">
            {value}
          </h3>
          {change && (
            <p className={`${changeColorMap[changeType]} text-sm mt-2 flex items-center`}>
              {changeIcon}
              {change}
            </p>
          )}
        </div>
        <div className={iconBgColor}>
          {icon}
        </div>
      </div>
    </div>
  );
}

