import { Package } from 'lucide-react';

export function PortfolioEmpty() {
    return (
        <div className="px-6 py-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <p className="text-lg font-semibold mb-2 text-white">Chưa có cổ phiếu nào</p>
            <p className="text-sm text-gray-400">
                Bắt đầu mua cổ phiếu để xây dựng danh mục đầu tư của bạn
            </p>
        </div>
    );
}
