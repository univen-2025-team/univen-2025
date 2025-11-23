import { formatNumber, formatPrice } from "@/components/market/utils";
import { StockDetailData } from "@/lib/types/stock-detail";

type StockHeaderCardProps = {
  stock: StockDetailData;
  showRealtimeBadge: boolean;
};

export default function StockHeaderCard({ stock, showRealtimeBadge }: StockHeaderCardProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="mb-4 md:mb-0 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">{stock.symbol}</h1>
            <span className="text-lg text-blue-100">{stock.companyName}</span>
            {showRealtimeBadge && (
              <span className="flex items-center text-xs bg-green-500 px-2 py-1 rounded-full">
                <span className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span>
                Trực tiếp
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-4">
            <p className="text-4xl font-bold">{formatPrice(stock.price)}</p>
            <div className={`text-xl font-semibold ${stock.change >= 0 ? "text-green-300" : "text-red-300"}`}>
              {stock.change > 0 ? "+" : ""}
              {formatNumber(stock.change)}
              <span className="ml-2">
                ({stock.changePercent > 0 ? "+" : ""}
                {stock.changePercent}%)
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
          <div className="text-sm text-blue-100 mb-1">Cập nhật lần cuối</div>
          <div className="font-semibold">{new Date(stock.lastUpdate).toLocaleString("vi-VN")}</div>
        </div>
      </div>
    </div>
  );
}

