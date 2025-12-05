import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatLargeNumber } from "@/components/market/utils";
import { PriceHistoryPoint } from "@/lib/types/stock-detail";

type VolumeChartCardProps = {
  data: PriceHistoryPoint[];
};

export default function VolumeChartCard({ data }: VolumeChartCardProps) {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <svg className="w-7 h-7 text-accent mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Khối lượng giao dịch
      </h2>
      <div className="h-64">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: "12px" }} />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => formatLargeNumber(Number(value))}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: number) => [formatLargeNumber(value), "Khối lượng"]}
              />
              <Bar dataKey="volume" fill="#0E1A3C" radius={[4, 4, 0, 0]} name="Khối lượng" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Đang thu thập dữ liệu...</p>
          </div>
        )}
      </div>
    </div>
  );
}

