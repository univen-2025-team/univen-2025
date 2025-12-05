import { formatPrice } from "@/components/market/utils";
import { StockDetailData, TechnicalIndicator } from "@/lib/types/stock-detail";

type TechnicalIndicatorsCardProps = {
  stock: StockDetailData;
  indicators: TechnicalIndicator;
};

export default function TechnicalIndicatorsCard({ stock, indicators }: TechnicalIndicatorsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <svg className="w-7 h-7 text-accent mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Phân tích kỹ thuật
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold text-gray-900 mb-4">Đường trung bình</h3>
          <div className="space-y-3">
            {[
              { label: "MA5", value: indicators.ma5 },
              { label: "MA10", value: indicators.ma10 },
              { label: "MA20", value: indicators.ma20 },
            ].map((ma) => (
              <div key={ma.label} className="flex justify-between items-center">
                <span className="text-gray-600">{ma.label}:</span>
                <span className={`font-bold ${stock.price > ma.value ? "text-success" : "text-error"}`}>
                  {formatPrice(ma.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold text-gray-900 mb-4">RSI (Relative Strength Index)</h3>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              <span className={indicators.rsi > 70 ? "text-error" : indicators.rsi < 30 ? "text-success" : "text-warning"}>
                {indicators.rsi.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className={`h-3 rounded-full transition-all ${
                  indicators.rsi > 70 ? "bg-error" : indicators.rsi < 30 ? "bg-success" : "bg-warning"
                }`}
                style={{ width: `${indicators.rsi}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {indicators.rsi > 70 ? "Quá mua" : indicators.rsi < 30 ? "Quá bán" : "Trung lập"}
            </p>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold text-gray-900 mb-4">MACD</h3>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              <span className={indicators.macd > 0 ? "text-success" : "text-error"}>{indicators.macd.toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{indicators.macd > 0 ? "Tín hiệu mua" : "Tín hiệu bán"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

