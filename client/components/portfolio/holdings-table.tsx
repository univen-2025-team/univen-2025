import { formatCurrency } from '@/features/history/utils/format';
import type { StockHolding } from './types';

interface HoldingsTableProps {
    holdings: StockHolding[];
}

export function HoldingsTable({ holdings }: HoldingsTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead style={{ backgroundColor: 'var(--muted)' }}>
                    <tr>
                        <th
                            className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                            style={{ color: 'var(--foreground)' }}
                        >
                            Mã CK
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                            style={{ color: 'var(--foreground)' }}
                        >
                            Tên
                        </th>
                        <th
                            className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                            style={{ color: 'var(--foreground)' }}
                        >
                            Số lượng
                        </th>
                        <th
                            className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                            style={{ color: 'var(--foreground)' }}
                        >
                            Giá TB
                        </th>
                        <th
                            className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                            style={{ color: 'var(--foreground)' }}
                        >
                            Giá hiện tại
                        </th>
                        <th
                            className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                            style={{ color: 'var(--foreground)' }}
                        >
                            Đã đầu tư
                        </th>
                        <th
                            className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                            style={{ color: 'var(--foreground)' }}
                        >
                            Giá trị HT
                        </th>
                        <th
                            className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                            style={{ color: 'var(--foreground)' }}
                        >
                            Lãi/Lỗ
                        </th>
                    </tr>
                </thead>
                <tbody style={{ backgroundColor: 'var(--card)' }}>
                    {holdings.map((holding) => (
                        <tr
                            key={holding.stock_code}
                            className="hover:opacity-80 transition-opacity"
                            style={{ borderBottom: '1px solid var(--border)' }}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-bold text-primary">{holding.stock_code}</span>
                            </td>
                            <td className="px-6 py-4" style={{ color: 'var(--foreground)' }}>
                                {holding.stock_name}
                            </td>
                            <td
                                className="px-6 py-4 text-right font-semibold"
                                style={{ color: 'var(--foreground)' }}
                            >
                                {holding.quantity.toLocaleString('vi-VN')}
                            </td>
                            <td
                                className="px-6 py-4 text-right"
                                style={{ color: 'var(--muted-foreground)' }}
                            >
                                {formatCurrency(holding.avg_buy_price)}
                            </td>
                            <td
                                className="px-6 py-4 text-right font-semibold"
                                style={{ color: 'var(--foreground)' }}
                            >
                                {formatCurrency(holding.current_price)}
                            </td>
                            <td
                                className="px-6 py-4 text-right"
                                style={{ color: 'var(--muted-foreground)' }}
                            >
                                {formatCurrency(holding.total_invested)}
                            </td>
                            <td
                                className="px-6 py-4 text-right font-semibold"
                                style={{ color: 'var(--foreground)' }}
                            >
                                {formatCurrency(holding.current_value)}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div>
                                    <p
                                        className={`font-bold ${
                                            holding.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}
                                    >
                                        {holding.profit_loss >= 0 ? '+' : ''}
                                        {formatCurrency(holding.profit_loss)}
                                    </p>
                                    <p
                                        className={`text-sm ${
                                            holding.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}
                                    >
                                        {holding.profit_loss >= 0 ? '+' : ''}
                                        {holding.profit_loss_percent.toFixed(2)}%
                                    </p>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
