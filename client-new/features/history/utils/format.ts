import type { TransactionHistoryItem, TransactionStatus, TransactionType } from '@/lib/types/transactions';

export const TRANSACTION_TYPE_INFO: Record<
    TransactionType,
    { label: string; color: string; bg: string; icon: string }
> = {
    BUY: { label: 'Mua', color: 'text-blue-600', bg: 'bg-blue-50', icon: '🛒' },
    SELL: { label: 'Bán', color: 'text-orange-600', bg: 'bg-orange-50', icon: '💰' },
};

export const TRANSACTION_STATUS_INFO: Record<
    TransactionStatus,
    { label: string; color: string; bg: string }
> = {
    COMPLETED: { label: 'Hoàn thành', color: 'text-green-700', bg: 'bg-green-100' },
    PENDING: { label: 'Đang xử lý', color: 'text-yellow-700', bg: 'bg-yellow-100' },
    FAILED: { label: 'Thất bại', color: 'text-red-700', bg: 'bg-red-100' },
    CANCELLED: { label: 'Đã hủy', color: 'text-gray-700', bg: 'bg-gray-100' },
};

export const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export const formatDate = (dateString?: string) => {
    if (!dateString) return '—';

    return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const getTransactionDescription = (transaction: TransactionHistoryItem) => {
    if (transaction.notes) {
        return transaction.notes;
    }

    const action = transaction.transaction_type === 'BUY' ? 'Mua' : 'Bán';
    return `${action} ${transaction.quantity} CP ${transaction.stock_code} (${transaction.stock_name})`;
};


