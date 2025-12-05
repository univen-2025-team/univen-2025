import { formatPrice } from "@/components/market/utils";
import { StockDetailData } from "@/lib/types/stock-detail";

type CompanyInfoCardProps = {
    stock: StockDetailData;
};

export default function CompanyInfoCard({ stock }: CompanyInfoCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-7 h-7 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Thông tin công ty
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border-l-4 border-primary pl-4">
                    <p className="text-gray-600 text-sm mb-1">P/E Ratio</p>
                    <p className="text-2xl font-bold text-gray-900">{stock.pe.toFixed(2)}</p>
                </div>
                <div className="border-l-4 border-indigo-500 pl-4">
                    <p className="text-gray-600 text-sm mb-1">EPS</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(stock.eps)}</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                    <p className="text-gray-600 text-sm mb-1">Giá trước đó</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(stock.previousClose)}</p>
                </div>
            </div>
        </div>
    );
}

