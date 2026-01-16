'use client';

import { useState, useMemo, type FC } from 'react';
import { Loader2, Eye } from 'lucide-react';

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

interface HistoryTableProps {
    transactions: TransactionHistoryItem[];
    isLoading: boolean;
    isEmpty: boolean;
    onRefresh?: () => void;
}

// Calculate holdings from transaction history
type HoldingsMap = Map<string, { quantity: number; avgPrice: number; stockName: string }>;

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

    // Calculate current holdings from all transactions
    const holdings: HoldingsMap = useMemo(() => {
        const map = new Map<
            string,
            { quantity: number; avgPrice: number; stockName: string; totalCost: number }
        >();

        // Process all completed transactions to calculate net holdings
        for (const tx of transactions) {
            if (tx.transaction_status !== 'COMPLETED') continue;

            const stockCode = tx.stock_code;
            const current = map.get(stockCode) || {
                quantity: 0,
                avgPrice: 0,
                stockName: tx.stock_name,
                totalCost: 0
            };

            if (tx.transaction_type === 'BUY') {
                current.totalCost += tx.total_amount;
                current.quantity += tx.quantity;
            } else if (tx.transaction_type === 'SELL') {
                current.quantity -= tx.quantity;
            }

            // Calculate average price from total cost / quantity
            current.avgPrice = current.quantity > 0 ? current.totalCost / current.quantity : 0;
            map.set(stockCode, current);
        }

        return map;
    }, [transactions]);

    const handleViewDetail = (transaction: TransactionHistoryItem) => {
        setSelectedTransaction(transaction);
        setShowDetailModal(true);
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
                <DialogContent className="max-w-md p-0 overflow-hidden">
                    {selectedTransaction &&
                        (() => {
                            const typeInfo =
                                TRANSACTION_TYPE_INFO[selectedTransaction.transaction_type];
                            const statusInfo =
                                TRANSACTION_STATUS_INFO[selectedTransaction.transaction_status];
                            const isBuy = selectedTransaction.transaction_type === 'BUY';
                            const balanceChange =
                                (selectedTransaction.balance_after ?? 0) -
                                selectedTransaction.balance_before;

                            return (
                                <>
                                    {/* Header Banner */}
                                    <div
                                        className={`px-6 py-5 ${
                                            isBuy
                                                ? 'bg-gradient-to-r from-red-500 to-red-600'
                                                : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                    <span className="text-2xl">
                                                        {typeInfo.icon}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-white/80 text-sm font-medium">
                                                        Giao dịch {typeInfo.label}
                                                    </p>
                                                    <p className="text-white text-xl font-bold">
                                                        {selectedTransaction.stock_code}
                                                    </p>
                                                </div>
                                            </div>
                                            <span
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusInfo.bg} ${statusInfo.color}`}
                                            >
                                                {statusInfo.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-5">
                                        {/* Stock Info */}
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <p className="text-sm text-gray-500 mb-1">
                                                {selectedTransaction.stock_name}
                                            </p>
                                            <div className="flex items-baseline justify-between">
                                                <span
                                                    className={`text-2xl font-bold ${
                                                        isBuy ? 'text-red-600' : 'text-emerald-600'
                                                    }`}
                                                >
                                                    {isBuy ? '-' : '+'}
                                                    {formatCurrency(
                                                        selectedTransaction.total_amount
                                                    )}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {selectedTransaction.quantity} CP ×{' '}
                                                    {formatCurrency(
                                                        selectedTransaction.price_per_unit
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50/50 rounded-lg p-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <svg
                                                        className="w-4 h-4 text-gray-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                                                        />
                                                    </svg>
                                                    <span className="text-xs text-gray-500">
                                                        Số lượng
                                                    </span>
                                                </div>
                                                <p className="font-semibold text-gray-900">
                                                    {selectedTransaction.quantity} CP
                                                </p>
                                            </div>
                                            <div className="bg-gray-50/50 rounded-lg p-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <svg
                                                        className="w-4 h-4 text-gray-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                    <span className="text-xs text-gray-500">
                                                        Giá/CP
                                                    </span>
                                                </div>
                                                <p className="font-semibold text-gray-900">
                                                    {formatCurrency(
                                                        selectedTransaction.price_per_unit
                                                    )}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50/50 rounded-lg p-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <svg
                                                        className="w-4 h-4 text-gray-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                    <span className="text-xs text-gray-500">
                                                        Thời gian
                                                    </span>
                                                </div>
                                                <p className="font-semibold text-gray-900 text-sm">
                                                    {formatDate(
                                                        selectedTransaction.executed_at ??
                                                            selectedTransaction.createdAt
                                                    )}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50/50 rounded-lg p-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <svg
                                                        className="w-4 h-4 text-gray-400"
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
                                                    <span className="text-xs text-gray-500">
                                                        Mã GD
                                                    </span>
                                                </div>
                                                <p
                                                    className="font-mono text-xs text-gray-700 truncate"
                                                    title={selectedTransaction._id}
                                                >
                                                    {selectedTransaction._id.slice(-12)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {selectedTransaction.notes && (
                                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <svg
                                                        className="w-4 h-4 text-amber-500"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        />
                                                    </svg>
                                                    <span className="text-xs text-amber-600 font-medium">
                                                        Ghi chú
                                                    </span>
                                                </div>
                                                <p className="text-sm text-amber-800">
                                                    {selectedTransaction.notes}
                                                </p>
                                            </div>
                                        )}

                                        {/* Balance Section */}
                                        <div className="border-t border-gray-100 pt-4">
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="text-gray-500">
                                                    Số dư trước GD
                                                </span>
                                                <span className="text-gray-700">
                                                    {formatCurrency(
                                                        selectedTransaction.balance_before
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm mb-3">
                                                <span className="text-gray-500">Thay đổi</span>
                                                <span
                                                    className={`font-medium ${
                                                        balanceChange >= 0
                                                            ? 'text-emerald-600'
                                                            : 'text-red-600'
                                                    }`}
                                                >
                                                    {balanceChange >= 0 ? '+' : ''}
                                                    {formatCurrency(balanceChange)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-3">
                                                <span className="font-medium text-gray-900">
                                                    Số dư sau GD
                                                </span>
                                                <span className="text-lg font-bold text-primary">
                                                    {formatCurrency(
                                                        selectedTransaction.balance_after ?? 0
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                </DialogContent>
            </Dialog>
        </>
    );
};
