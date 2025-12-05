import { Package } from 'lucide-react';

export function PortfolioEmpty() {
    return (
        <div className="px-6 py-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
            <p className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                Chưa có cổ phiếu nào
            </p>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Bắt đầu mua cổ phiếu để xây dựng danh mục đầu tư của bạn
            </p>
        </div>
    );
}
