'use client';

import { useState, type FC } from 'react';
import { Loader2, Eye, TrendingDown } from 'lucide-react';

import type { TransactionHistoryItem } from '@/lib/types/transactions';
import {
    formatCurrency,
    formatDate,
    getTransactionDescription,
    TRANSACTION_STATUS_INFO,
    TRANSACTION_TYPE_INFO
} from '../utils/format';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SellStockFeature, type SellStockData } from '@/features/sell-stock';

interface HistoryTableProps {
    transactions: TransactionHistoryItem[];
    isLoading: boolean;
    isEmpty: boolean;
    onRefresh?: () => void;
}

export const HistoryTable: FC<HistoryTableProps> = ({
    transactions,
    isLoading,
    isEmpty,
    onRefresh
}) => {
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionHistoryItem | null>(
        null
    );
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showSellModal, setShowSellModal] = useState(false);
    const [sellData, setSellData] = useState<SellStockData | null>(null);

    const handleViewDetail = (transaction: TransactionHistoryItem) => {
        setSelectedTransaction(transaction);
        setShowDetailModal(true);
    };

    const handleSell = (transaction: TransactionHistoryItem) => {
        // Only allow selling for completed BUY transactions
        if (
            transaction.transaction_type !== 'BUY' ||
            transaction.transaction_status !== 'COMPLETED'
        ) {
            return;
        }

        setSellData({
            symbol: transaction.stock_code,
            companyName: transaction.stock_name,
            currentPrice: transaction.price_per_unit, // Will be updated with real-time price
            holdingQuantity: transaction.quantity,
            averageBuyPrice: transaction.price_per_unit
        });
        setShowSellModal(true);
    };

    const handleSellSuccess = () => {
        setShowSellModal(false);
        setSellData(null);
        onRefresh?.();
    };

    return (
        <>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <h3 className="text-lg font-bold text-gray-900">
                            Danh sách giao dịch ({transactions.length})
                        </h3>
                        {isLoading ? (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Đang tải...</span>
                            </div>
                        ) : (
                            <button
                                className="text-primary hover:text-primary/80 text-sm font-medium disabled:opacity-40"
                                type="button"
                                disabled
                                title="Tính năng đang được phát triển"
                            >
                                Xuất báo cáo
                            </button>
                        )}
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Loại
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Mô tả
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Số tiền
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Thời gian
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {transactions.map((transaction) => {
                                const typeInfo =
                                    TRANSACTION_TYPE_INFO[transaction.transaction_type];
                                const statusInfo =
                                    TRANSACTION_STATUS_INFO[transaction.transaction_status];
                                const amountClass =
                                    transaction.transaction_type === 'SELL'
                                        ? 'text-success'
                                        : 'text-error';
                                const amountPrefix =
                                    transaction.transaction_type === 'SELL' ? '+' : '-';
                                const timestamp = transaction.executed_at ?? transaction.createdAt;
                                const canSell =
                                    transaction.transaction_type === 'BUY' &&
                                    transaction.transaction_status === 'COMPLETED';

                                return (
                                    <tr
                                        key={transaction._id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div
                                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${typeInfo.bg} ${typeInfo.color}`}
                                            >
                                                <span>{typeInfo.icon}</span>
                                                <span>{typeInfo.label}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {getTransactionDescription(transaction)}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {transaction.stock_code} • {transaction.quantity} CP
                                                @ {formatCurrency(transaction.price_per_unit)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm font-semibold ${amountClass}`}>
                                                {amountPrefix}
                                                {formatCurrency(transaction.total_amount)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.color}`}
                                            >
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {formatDate(timestamp)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewDetail(transaction)}
                                                    className="text-primary hover:text-primary/80"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Chi tiết
                                                </Button>
                                                {canSell && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleSell(transaction)}
                                                        className="text-error border-error/30 hover:bg-error/10"
                                                    >
                                                        <TrendingDown className="h-4 w-4 mr-1" />
                                                        Bán
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {isLoading && !transactions.length && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8">
                                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Đang tải dữ liệu...</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-200">
                    {transactions.map((transaction) => {
                        const typeInfo = TRANSACTION_TYPE_INFO[transaction.transaction_type];
                        const statusInfo = TRANSACTION_STATUS_INFO[transaction.transaction_status];
                        const amountClass =
                            transaction.transaction_type === 'SELL' ? 'text-success' : 'text-error';
                        const amountPrefix = transaction.transaction_type === 'SELL' ? '+' : '-';
                        const timestamp = transaction.executed_at ?? transaction.createdAt;
                        const canSell =
                            transaction.transaction_type === 'BUY' &&
                            transaction.transaction_status === 'COMPLETED';

                        return (
                            <div
                                key={transaction._id}
                                className="p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div
                                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${typeInfo.bg} ${typeInfo.color}`}
                                    >
                                        <span>{typeInfo.icon}</span>
                                        <span>{typeInfo.label}</span>
                                    </div>
                                    <span
                                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.color}`}
                                    >
                                        {statusInfo.label}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-900 mb-1">
                                    {getTransactionDescription(transaction)}
                                </div>
                                <div className="text-xs text-gray-500 mb-2">
                                    {transaction.stock_code} • {transaction.quantity} CP
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className={`text-lg font-bold ${amountClass}`}>
                                        {amountPrefix}
                                        {formatCurrency(transaction.total_amount)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {formatDate(timestamp)}
                                    </div>
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewDetail(transaction)}
                                        className="text-primary hover:text-primary/80"
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        Chi tiết
                                    </Button>
                                    {canSell && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSell(transaction)}
                                            className="text-error border-error/30 hover:bg-error/10"
                                        >
                                            <TrendingDown className="h-4 w-4 mr-1" />
                                            Bán
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {isEmpty && (
                    <div className="px-6 py-12 text-center">
                        <svg
                            className="w-16 h-16 mx-auto text-gray-400 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                            Không có giao dịch
                        </h3>
                        <p className="text-gray-500">
                            Không tìm thấy giao dịch nào phù hợp với bộ lọc hiện tại.
                        </p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Chi tiết giao dịch</DialogTitle>
                    </DialogHeader>
                    {selectedTransaction && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Mã giao dịch</p>
                                    <p className="font-mono text-sm">{selectedTransaction._id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Loại</p>
                                    <p className="font-semibold">
                                        {
                                            TRANSACTION_TYPE_INFO[
                                                selectedTransaction.transaction_type
                                            ].label
                                        }
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Mã cổ phiếu</p>
                                    <p className="font-semibold">
                                        {selectedTransaction.stock_code}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Số lượng</p>
                                    <p className="font-semibold">
                                        {selectedTransaction.quantity} CP
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Giá/CP</p>
                                    <p className="font-semibold">
                                        {formatCurrency(selectedTransaction.price_per_unit)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tổng tiền</p>
                                    <p className="font-semibold">
                                        {formatCurrency(selectedTransaction.total_amount)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Trạng thái</p>
                                    <span
                                        className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                                            TRANSACTION_STATUS_INFO[
                                                selectedTransaction.transaction_status
                                            ].bg
                                        } ${
                                            TRANSACTION_STATUS_INFO[
                                                selectedTransaction.transaction_status
                                            ].color
                                        }`}
                                    >
                                        {
                                            TRANSACTION_STATUS_INFO[
                                                selectedTransaction.transaction_status
                                            ].label
                                        }
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Thời gian</p>
                                    <p className="text-sm">
                                        {formatDate(
                                            selectedTransaction.executed_at ??
                                                selectedTransaction.createdAt
                                        )}
                                    </p>
                                </div>
                            </div>
                            {selectedTransaction.notes && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Ghi chú</p>
                                    <p className="text-sm">{selectedTransaction.notes}</p>
                                </div>
                            )}
                            <div className="border-t pt-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Số dư trước</span>
                                    <span>
                                        {formatCurrency(selectedTransaction.balance_before)}
                                    </span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                    <span>Số dư sau</span>
                                    <span>
                                        {formatCurrency(selectedTransaction.balance_after ?? 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Sell Modal */}
            <Dialog open={showSellModal} onOpenChange={setShowSellModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {sellData && (
                        <SellStockFeature
                            data={sellData}
                            onBack={() => setShowSellModal(false)}
                            onSuccess={handleSellSuccess}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
