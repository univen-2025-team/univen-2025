'use client';

import { useState } from 'react';
import { TrendingDown, History, X } from 'lucide-react';
import { formatCurrency } from '@/features/history/utils/format';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SellStockFeature, type SellStockData } from '@/features/sell-stock';
import { transactionApi } from '@/lib/api/transaction.api';
import { useAppSelector } from '@/lib/store/hooks';
import { selectUser } from '@/lib/store/authSlice';
import type { TransactionHistoryItem } from '@/lib/types/transactions';
import type { StockHolding } from './types';

interface HoldingsTableProps {
    holdings: StockHolding[];
    onRefresh?: () => void;
}

export function HoldingsTable({ holdings, onRefresh }: HoldingsTableProps) {
    const user = useAppSelector(selectUser);
    const [showSellModal, setShowSellModal] = useState(false);
    const [sellData, setSellData] = useState<SellStockData | null>(null);

    // Transaction details modal state
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedStock, setSelectedStock] = useState<StockHolding | null>(null);
    const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);

    const handleSell = (holding: StockHolding) => {
        setSellData({
            symbol: holding.stock_code,
            companyName: holding.stock_name,
            currentPrice: holding.current_price,
            holdingQuantity: holding.quantity,
            averageBuyPrice: holding.avg_buy_price
        });
        setShowSellModal(true);
    };

    const handleSellSuccess = () => {
        setShowSellModal(false);
        setSellData(null);
        onRefresh?.();
    };

    const handleShowDetails = async (holding: StockHolding) => {
        if (!user?._id) return;

        setSelectedStock(holding);
        setShowDetailsModal(true);
        setLoadingTransactions(true);

        try {
            const response = await transactionApi.getTransactionHistory(user._id, {
                filters: {
                    stock_code: holding.stock_code,
                    status: 'COMPLETED'
                },
                pagination: {
                    page: 1,
                    limit: 100
                }
            });
            setTransactions(response.transactions);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            setTransactions([]);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
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
                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-foreground">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-card">
                        {holdings.map((holding) => {
                            const isProfit = holding.profit_loss >= 0;
                            return (
                                <tr
                                    key={holding.stock_code}
                                    className="cursor-pointer border-b border-border transition-colors duration-200 hover:bg-muted/50"
                                    onClick={() => handleShowDetails(holding)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleShowDetails(holding);
                                        }
                                    }}
                                >
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-1 font-bold text-primary">
                                            {holding.stock_code}
                                            <History className="h-3 w-3 opacity-50" aria-hidden />
                                        </div>
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
                                    <td className="px-6 py-4 text-center">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="cursor-pointer transition-colors duration-200"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSell(holding);
                                            }}
                                        >
                                            <TrendingDown className="mr-1 h-4 w-4" aria-hidden />
                                            Bán
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Sell Modal */}
            <Dialog open={showSellModal} onOpenChange={setShowSellModal}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
                    {sellData && (
                        <SellStockFeature
                            data={sellData}
                            onBack={() => setShowSellModal(false)}
                            onSuccess={handleSellSuccess}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Transaction Details Modal */}
            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <History className="h-6 w-6" aria-hidden />
                            Lịch sử giao dịch - {selectedStock?.stock_code}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden p-6 pt-2">
                        {loadingTransactions ? (
                            <div className="flex h-full flex-col items-center justify-center">
                                <div
                                    className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary"
                                    role="status"
                                    aria-label="Đang tải"
                                />
                                <p className="mt-4 text-lg text-muted-foreground">
                                    Đang tải dữ liệu...
                                </p>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-lg">
                                Không có giao dịch nào
                            </div>
                        ) : (
                            <div className="h-full flex flex-col">
                                <div className="flex-1 overflow-auto border rounded-md">
                                    <table className="min-w-full text-sm relative">
                                        <thead className="bg-muted sticky top-0 z-10">
                                            <tr>
                                                <th className="px-6 py-4 text-left font-semibold text-base">
                                                    Thời gian
                                                </th>
                                                <th className="px-6 py-4 text-center font-semibold text-base">
                                                    Loại
                                                </th>
                                                <th className="px-6 py-4 text-right font-semibold text-base">
                                                    Số lượng
                                                </th>
                                                <th className="px-6 py-4 text-right font-semibold text-base">
                                                    Giá/CP
                                                </th>
                                                <th className="px-6 py-4 text-right font-semibold text-base">
                                                    Tổng tiền
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {transactions.map((tx) => (
                                                <tr key={tx._id} className="hover:bg-muted/50">
                                                    <td className="px-6 py-4 text-muted-foreground">
                                                        {formatDate(tx.executed_at || tx.createdAt)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span
                                                            className={`rounded-full border px-3 py-1 text-xs font-bold ${
                                                                tx.transaction_type === 'BUY'
                                                                    ? 'border-success bg-success-light text-success'
                                                                    : 'border-error bg-error-light text-error'
                                                            }`}
                                                        >
                                                            {tx.transaction_type === 'BUY'
                                                                ? 'MUA'
                                                                : 'BÁN'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium text-base">
                                                        {tx.quantity.toLocaleString('vi-VN')}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-base">
                                                        {formatCurrency(tx.price_per_unit)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-base">
                                                        {formatCurrency(tx.total_amount)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Summary Footer */}
                                <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
                                    <div className="grid grid-cols-2 gap-8 text-base">
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">
                                                Tổng số giao dịch:
                                            </span>
                                            <span className="font-bold text-lg">
                                                {transactions.length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">
                                                Số lượng hiện tại:
                                            </span>
                                            <span className="font-bold text-lg text-primary">
                                                {selectedStock?.quantity.toLocaleString('vi-VN')} CP
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
