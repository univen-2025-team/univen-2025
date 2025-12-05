'use client';

import { StockSearch } from './stock-search';

export function MarketHeader() {
    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 md:p-8 text-white">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Thị trường VN30</h1>
                    <p className="text-blue-100 text-sm md:text-base">
                        Theo dõi và giao dịch 30 cổ phiếu vốn hóa lớn nhất
                    </p>
                </div>
                <div className="w-full lg:w-96">
                    <StockSearch
                        stocks={[]}
                        onSelect={(stock) => {
                            console.log('Selected stock:', stock);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
