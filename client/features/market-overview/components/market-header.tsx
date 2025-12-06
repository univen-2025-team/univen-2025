'use client';

import { StockSearch } from './stock-search';

export function MarketHeader() {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-primary">Thị trường VN30</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Theo dõi và giao dịch 30 cổ phiếu vốn hóa lớn nhất
                </p>
            </div>
            <div className="w-full sm:w-80 lg:w-96">
                <StockSearch
                    stocks={[]}
                    onSelect={(stock) => {
                        console.log('Selected stock:', stock);
                    }}
                />
            </div>
        </div>
    );
}
