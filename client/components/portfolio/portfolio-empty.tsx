import { Package } from 'lucide-react';

export function PortfolioEmpty() {
    return (
        <div className="px-6 py-12 text-center">
            <Package
                className="mx-auto mb-4 h-16 w-16 text-muted-foreground"
                aria-hidden
            />
            <p className="mb-2 text-lg font-semibold text-foreground">
                Chưa có cổ phiếu nào
            </p>
            <p className="text-sm text-muted-foreground">
                Bắt đầu mua cổ phiếu để xây dựng danh mục đầu tư của bạn
            </p>
        </div>
    );
}
