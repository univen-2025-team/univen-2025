import { VN30Index } from "@/lib/types/market";
import { formatNumber, getChangeColor } from "./utils";

type VN30IndexCardProps = {
  vn30Index: VN30Index;
  timestamp: string;
  isConnected: boolean;
  realtimeEnabled: boolean;
  onToggleRealtime: () => void;
};

export default function VN30IndexCard({
  vn30Index,
  timestamp,
  isConnected,
  realtimeEnabled,
  onToggleRealtime,
}: VN30IndexCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-primary">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <p className="text-gray-600 text-sm font-medium">Chỉ số VN30</p>
            {isConnected && realtimeEnabled && (
              <span className="flex items-center text-xs text-success bg-success-light px-2 py-1 rounded-full">
                <span className="w-2 h-2 bg-success rounded-full mr-1 animate-pulse"></span>
                Trực tiếp
              </span>
            )}
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {formatNumber(vn30Index.index)}
          </h2>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${getChangeColor(vn30Index.change)}`}>
            {vn30Index.change > 0 ? '+' : ''}
            {formatNumber(vn30Index.change)}
          </p>
          <p className={`text-lg font-semibold ${getChangeColor(vn30Index.changePercent)}`}>
            {vn30Index.changePercent > 0 ? '+' : ''}
            {vn30Index.changePercent}%
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-xs">
          Cập nhật lần cuối: {new Date(timestamp).toLocaleString('vi-VN')}
        </p>
        <button
          onClick={onToggleRealtime}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${realtimeEnabled
            ? 'bg-success text-white hover:bg-green-700'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {realtimeEnabled ? 'Đang cập nhật' : 'Cập nhật trực tiếp'}
        </button>
      </div>
    </div>
  );
}

