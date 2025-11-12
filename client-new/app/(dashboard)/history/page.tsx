"use client";

import { useState } from "react";
import Link from "next/link";

// Mock data types
type TransactionType = 'DEPOSIT' | 'WITHDRAW' | 'BUY' | 'SELL' | 'TRANSFER';
type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

interface Transaction {
  _id: string;
  transaction_type: TransactionType;
  transaction_amount: number;
  transaction_status: TransactionStatus;
  transaction_description: string;
  transaction_date: string;
  stock_symbol?: string;
  quantity?: number;
}

// Mock data
const mockBalance = {
  balance_amount: 50000000,
  balance_available: 45000000,
  balance_locked: 5000000,
};

const mockTransactions: Transaction[] = [
  {
    _id: "1",
    transaction_type: "DEPOSIT",
    transaction_amount: 10000000,
    transaction_status: "COMPLETED",
    transaction_description: "Nạp tiền vào tài khoản",
    transaction_date: "2025-11-10T10:30:00Z",
  },
  {
    _id: "2",
    transaction_type: "BUY",
    transaction_amount: 5000000,
    transaction_status: "COMPLETED",
    transaction_description: "Mua cổ phiếu VNM",
    transaction_date: "2025-11-09T14:20:00Z",
    stock_symbol: "VNM",
    quantity: 100,
  },
  {
    _id: "3",
    transaction_type: "SELL",
    transaction_amount: 3000000,
    transaction_status: "COMPLETED",
    transaction_description: "Bán cổ phiếu FPT",
    transaction_date: "2025-11-08T11:15:00Z",
    stock_symbol: "FPT",
    quantity: 50,
  },
  {
    _id: "4",
    transaction_type: "WITHDRAW",
    transaction_amount: 2000000,
    transaction_status: "PENDING",
    transaction_description: "Rút tiền về tài khoản ngân hàng",
    transaction_date: "2025-11-07T16:45:00Z",
  },
  {
    _id: "5",
    transaction_type: "BUY",
    transaction_amount: 7500000,
    transaction_status: "COMPLETED",
    transaction_description: "Mua cổ phiếu VIC",
    transaction_date: "2025-11-06T09:00:00Z",
    stock_symbol: "VIC",
    quantity: 200,
  },
  {
    _id: "6",
    transaction_type: "DEPOSIT",
    transaction_amount: 20000000,
    transaction_status: "COMPLETED",
    transaction_description: "Nạp tiền từ VNPay",
    transaction_date: "2025-11-05T13:30:00Z",
  },
  {
    _id: "7",
    transaction_type: "BUY",
    transaction_amount: 4000000,
    transaction_status: "FAILED",
    transaction_description: "Mua cổ phiếu HPG - Không đủ tiền",
    transaction_date: "2025-11-04T10:00:00Z",
    stock_symbol: "HPG",
    quantity: 150,
  },
  {
    _id: "8",
    transaction_type: "SELL",
    transaction_amount: 6000000,
    transaction_status: "COMPLETED",
    transaction_description: "Bán cổ phiếu VCB",
    transaction_date: "2025-11-03T15:20:00Z",
    stock_symbol: "VCB",
    quantity: 80,
  },
];

export default function HistoryPage() {
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | 'ALL'>('ALL');

  // Filter transactions
  const filteredTransactions = mockTransactions.filter(transaction => {
    const typeMatch = filterType === 'ALL' || transaction.transaction_type === filterType;
    const statusMatch = filterStatus === 'ALL' || transaction.transaction_status === filterStatus;
    return typeMatch && statusMatch;
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get transaction type info
  const getTransactionTypeInfo = (type: TransactionType) => {
    const types = {
      DEPOSIT: { label: 'Nạp tiền', color: 'text-green-600', bg: 'bg-green-50', icon: '↓' },
      WITHDRAW: { label: 'Rút tiền', color: 'text-red-600', bg: 'bg-red-50', icon: '↑' },
      BUY: { label: 'Mua', color: 'text-blue-600', bg: 'bg-blue-50', icon: '🛒' },
      SELL: { label: 'Bán', color: 'text-orange-600', bg: 'bg-orange-50', icon: '💰' },
      TRANSFER: { label: 'Chuyển', color: 'text-purple-600', bg: 'bg-purple-50', icon: '⇄' },
    };
    return types[type];
  };

  // Get status info
  const getStatusInfo = (status: TransactionStatus) => {
    const statuses = {
      COMPLETED: { label: 'Hoàn thành', color: 'text-green-700', bg: 'bg-green-100' },
      PENDING: { label: 'Đang xử lý', color: 'text-yellow-700', bg: 'bg-yellow-100' },
      FAILED: { label: 'Thất bại', color: 'text-red-700', bg: 'bg-red-100' },
      CANCELLED: { label: 'Đã hủy', color: 'text-gray-700', bg: 'bg-gray-100' },
    };
    return statuses[status];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lịch sử giao dịch</h1>
        <p className="text-gray-600 mt-1">Quản lý và theo dõi các giao dịch của bạn</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Balance */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100 text-sm font-medium">Tổng số dư</span>
            <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(mockBalance.balance_amount)}</p>
        </div>

        {/* Available Balance */}
        <div className="bg-white rounded-xl p-6 border-2 border-green-200 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Khả dụng</span>
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockBalance.balance_available)}</p>
          <p className="text-sm text-green-600 mt-1">Sẵn sàng giao dịch</p>
        </div>

        {/* Locked Balance */}
        <div className="bg-white rounded-xl p-6 border-2 border-orange-200 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Đang chờ</span>
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockBalance.balance_locked)}</p>
          <p className="text-sm text-orange-600 mt-1">Đang xử lý</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/deposit"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nạp tiền
          </Link>
          <Link
            href="/withdraw"
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
            Rút tiền
          </Link>
          <Link
            href="/trade"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Giao dịch
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Bộ lọc</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filter by Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại giao dịch</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as TransactionType | 'ALL')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="ALL">Tất cả</option>
              <option value="DEPOSIT">Nạp tiền</option>
              <option value="WITHDRAW">Rút tiền</option>
              <option value="BUY">Mua</option>
              <option value="SELL">Bán</option>
              <option value="TRANSFER">Chuyển</option>
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TransactionStatus | 'ALL')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="ALL">Tất cả</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="PENDING">Đang xử lý</option>
              <option value="FAILED">Thất bại</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              Danh sách giao dịch ({filteredTransactions.length})
            </h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Xuất báo cáo
            </button>
          </div>
        </div>

        {/* Desktop View */}
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
              {filteredTransactions.map((transaction) => {
                const typeInfo = getTransactionTypeInfo(transaction.transaction_type);
                const statusInfo = getStatusInfo(transaction.transaction_status);
                
                return (
                  <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${typeInfo.bg} ${typeInfo.color}`}>
                        <span>{typeInfo.icon}</span>
                        <span>{typeInfo.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{transaction.transaction_description}</div>
                      {transaction.stock_symbol && (
                        <div className="text-xs text-gray-500 mt-1">
                          {transaction.stock_symbol} • {transaction.quantity} CP
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${
                        transaction.transaction_type === 'DEPOSIT' || transaction.transaction_type === 'SELL'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {transaction.transaction_type === 'DEPOSIT' || transaction.transaction_type === 'SELL' ? '+' : '-'}
                        {formatCurrency(transaction.transaction_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(transaction.transaction_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredTransactions.map((transaction) => {
            const typeInfo = getTransactionTypeInfo(transaction.transaction_type);
            const statusInfo = getStatusInfo(transaction.transaction_status);
            
            return (
              <div key={transaction._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${typeInfo.bg} ${typeInfo.color}`}>
                    <span>{typeInfo.icon}</span>
                    <span>{typeInfo.label}</span>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="text-sm text-gray-900 mb-1">{transaction.transaction_description}</div>
                {transaction.stock_symbol && (
                  <div className="text-xs text-gray-500 mb-2">
                    {transaction.stock_symbol} • {transaction.quantity} CP
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className={`text-lg font-bold ${
                    transaction.transaction_type === 'DEPOSIT' || transaction.transaction_type === 'SELL'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {transaction.transaction_type === 'DEPOSIT' || transaction.transaction_type === 'SELL' ? '+' : '-'}
                    {formatCurrency(transaction.transaction_amount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(transaction.transaction_date)}
                  </div>
                </div>
                <div className="mt-3">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Xem chi tiết →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <div className="px-6 py-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Không có giao dịch</h3>
            <p className="text-gray-500">Không tìm thấy giao dịch nào phù hợp với bộ lọc</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredTransactions.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Hiển thị <span className="font-semibold">1-{filteredTransactions.length}</span> trong tổng số <span className="font-semibold">{filteredTransactions.length}</span> giao dịch
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                Trước
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                1
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
