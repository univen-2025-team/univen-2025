import CandlestickChart from "@/components/market/charts/CandlestickChart";
import { formatPrice } from "@/components/market/utils";
import { PriceHistoryPoint, TimeRange } from "@/lib/types/stock-detail";

type PriceChartCardProps = {
  data: PriceHistoryPoint[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  realtimeEnabled: boolean;
  onToggleRealtime: () => void;
};

const TIME_RANGES: TimeRange[] = [
  "15s",
  "1m",
  "3m",
  "5m",
  "15m",
  "30m",
  "1h",
  "6h",
  "12h",
  "1D",
  "1W",
  "1M",
  "3M",
  "1Y",
];

export default function PriceChartCard({
  data,
  timeRange,
  onTimeRangeChange,
  realtimeEnabled,
  onToggleRealtime,
}: PriceChartCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <svg className="w-7 h-7 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Biểu đồ giá
          </h2>
          <button
            onClick={onToggleRealtime}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${realtimeEnabled ? "bg-success text-white hover:bg-green-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {realtimeEnabled ? "Đang cập nhật" : "Cập nhật trực tiếp"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${timeRange === range ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <div className="h-96">
        {data.length > 0 ? (
          <CandlestickChart
            data={data.map((point) => {
              const open = point.open ?? point.price;
              const close = point.close ?? point.price;
              const high = point.high ?? Math.max(open, close);
              const low = point.low ?? Math.min(open, close);
              return {
                time: point.time,
                open,
                close,
                high,
                low,
              };
            })}
            valueFormatter={formatPrice}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Đang thu thập dữ liệu biểu đồ...</p>
          </div>
        )}
      </div>
    </div>
  );
}

