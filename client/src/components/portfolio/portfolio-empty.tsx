'use client';

import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';

const MUTED = '#64748B';
const PRIMARY = '#1F3A8A';
const SECONDARY = '#2563EB';

export function PortfolioEmpty() {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed"
                style={{ borderColor: '#E5E7EB', backgroundColor: 'rgba(31, 58, 138, 0.04)' }}
            >
                <Package className="h-10 w-10" style={{ color: MUTED }} aria-hidden />
            </div>
            <h3 className="mb-2 text-xl font-semibold" style={{ color: PRIMARY }}>
                Chưa có cổ phiếu nào
            </h3>
            <p className="mb-8 max-w-sm text-sm" style={{ color: MUTED }}>
                Bắt đầu mua cổ phiếu để xây dựng danh mục đầu tư và học cách theo dõi lợi nhuận.
            </p>
            <Link
                href="/dashboard/trade"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{ backgroundColor: SECONDARY }}
            >
                Bắt đầu mua cổ phiếu
                <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
        </div>
    );
}
