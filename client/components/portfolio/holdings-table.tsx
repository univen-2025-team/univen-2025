import { formatCurrency } from '@/features/history/utils/format';
import type { StockHolding } from './types';

interface HoldingsTableProps {
    holdings: StockHolding[];
    onRefresh?: () => void;
}

export function HoldingsTable({ holdings, onRefresh }: HoldingsTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead className="bg-muted">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground">
                            Mã CK
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground">
                            Tên
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground">
                            Số lượng
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground">
                            Giá TB
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground">
                            Giá hiện tại
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground">
                            Đã đầu tư
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground">
                            Giá trị HT
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground">
                            Lãi/Lỗ
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-card">
                    {holdings.map((holding) => {
                        const isProfit = holding.profit_loss >= 0;
                        return (
                            <tr
                                key={holding.stock_code}
                                className="border-b border-border transition-colors duration-200 hover:bg-muted/50"
                            >
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className="font-bold text-primary">
                                        {holding.stock_code}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-foreground">
                                    {holding.stock_name}
                                </td>
                                <td className="px-6 py-4 text-right font-semibold text-foreground">
                                    {holding.quantity.toLocaleString('vi-VN')}
                                </td>
                                <td className="px-6 py-4 text-right text-muted-foreground">
                                    {formatCurrency(holding.avg_buy_price)}
                                </td>
                                <td className="px-6 py-4 text-right font-semibold text-foreground">
                                    {formatCurrency(holding.current_price)}
                                </td>
                                <td className="px-6 py-4 text-right text-muted-foreground">
                                    {formatCurrency(holding.total_invested)}
                                </td>
                                <td className="px-6 py-4 text-right font-semibold text-foreground">
                                    {formatCurrency(holding.current_value)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div>
                                        <p
                                            className={`font-bold ${
                                                isProfit ? 'text-success' : 'text-destructive'
                                            }`}
                                        >
                                            {isProfit ? '+' : ''}
                                            {formatCurrency(holding.profit_loss)}
                                        </p>
                                        <p
                                            className={`text-sm ${
                                                isProfit ? 'text-success' : 'text-destructive'
                                            }`}
                                        >
                                            {isProfit ? '+' : ''}
                                            {holding.profit_loss_percent.toFixed(2)}%
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
