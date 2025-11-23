import { formatLargeNumber, formatPrice } from "@/components/market/utils";
import { StockDetailData } from "@/lib/types/stock-detail";

type StockMetricsGridProps = {
  stock: StockDetailData;
};

const metrics = [
  { label: "Mở cửa", key: "open", className: "text-gray-900" },
  { label: "Cao nhất", key: "high", className: "text-green-600" },
  { label: "Thấp nhất", key: "low", className: "text-red-600" },
  { label: "Đóng cửa", key: "close", className: "text-gray-900" },
];

export default function StockMetricsGrid({ stock }: StockMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {metrics.map(({ label, key, className }) => (
        <div key={key} className="bg-white rounded-xl shadow-md p-4">
          <p className="text-gray-600 text-sm mb-1">{label}</p>
          <p className={`text-lg font-bold ${className}`}>{formatPrice(stock[key as keyof StockDetailData] as number)}</p>
        </div>
      ))}
      <div className="bg-white rounded-xl shadow-md p-4">
        <p className="text-gray-600 text-sm mb-1">Khối lượng</p>
        <p className="text-lg font-bold text-gray-900">{formatLargeNumber(stock.volume)}</p>
      </div>
      <div className="bg-white rounded-xl shadow-md p-4">
        <p className="text-gray-600 text-sm mb-1">Vốn hóa</p>
        <p className="text-lg font-bold text-gray-900">{formatLargeNumber(stock.marketCap)}</p>
      </div>
    </div>
  );
}

