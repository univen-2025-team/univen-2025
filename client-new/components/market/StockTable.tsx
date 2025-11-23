"use client";

import { useRouter } from "next/navigation";
import { StockData } from "@/lib/types/market";
import { MarketSortField, MarketSortOrder } from "@/lib/services/marketService";
import { formatNumber, formatPrice, getChangeColor } from "./utils";

type StockTableProps = {
  stocks: StockData[];
  sortBy: MarketSortField;
  order: MarketSortOrder;
  onSortChange: (sortBy: MarketSortField) => void;
  onOrderChange: (order: MarketSortOrder) => void;
  onRefresh: () => void;
};

export default function StockTable({
  stocks,
  sortBy,
  order,
  onSortChange,
  onOrderChange,
  onRefresh,
}: StockTableProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <h2 className="text-xl font-bold text-gray-900">Danh sách cổ phiếu VN30</h2>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm font-medium text-gray-700">Sắp xếp theo:</label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as MarketSortField)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="price">Giá</option>
            <option value="change">Thay đổi</option>
            <option value="changePercent">% Thay đổi</option>
            <option value="volume">Khối lượng</option>
          </select>
          <select
            value={order}
            onChange={(e) => onOrderChange(e.target.value as MarketSortOrder)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Giảm dần</option>
            <option value="asc">Tăng dần</option>
          </select>
          <button
            onClick={onRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* Stock Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Mã CK</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Giá</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Thay đổi</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">% Thay đổi</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Khối lượng</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Cao</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Thấp</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <tr
                key={stock.symbol}
                onClick={() => router.push(`/market/${stock.symbol}`)}
                className="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3">
                  <span className="font-bold text-blue-600 hover:text-blue-800">{stock.symbol}</span>
                </td>
                <td className={`px-4 py-3 text-right font-semibold ${getChangeColor(stock.change)}`}>
                  {formatPrice(stock.price)}
                </td>
                <td className={`px-4 py-3 text-right font-semibold ${getChangeColor(stock.change)}`}>
                  {stock.change > 0 ? '+' : ''}{formatNumber(stock.change)}
                </td>
                <td className={`px-4 py-3 text-right font-semibold ${getChangeColor(stock.changePercent)}`}>
                  {stock.changePercent > 0 ? '+' : ''}{stock.changePercent}%
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {formatNumber(stock.volume)}
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {formatPrice(stock.high)}
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {formatPrice(stock.low)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

