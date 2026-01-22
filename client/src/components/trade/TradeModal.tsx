'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { X, ShoppingCart, DollarSign, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { userApi, type UserProfile } from '@/lib/api/user.api';
import { transactionApi } from '@/lib/api/transaction.api';
import { useAppSelector } from '@/lib/store/hooks';
import { selectUser } from '@/lib/store/authSlice';
import type { BuyStockFormValues, TransactionType } from '@/lib/types/transactions';

interface TradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    symbol: string;
    companyName?: string;
    currentPrice?: number;
    initialAction?: 'buy' | 'sell';
    currentHolding?: number; // Number of shares user currently holds
}

const validationSchema = Yup.object({
    stock_code: Yup.string().required(),
    stock_name: Yup.string().required(),
    quantity: Yup.number()
        .typeError('Số lượng phải là số')
        .integer('Số lượng phải là số nguyên')
        .min(1, 'Ít nhất 1 cổ phiếu')
        .required('Vui lòng nhập số lượng'),
    price_per_unit: Yup.number()
        .typeError('Giá phải là số')
        .min(0, 'Giá không được âm')
        .required('Vui lòng nhập giá'),
    transaction_type: Yup.mixed<TransactionType>().oneOf(['BUY', 'SELL']).required(),
    notes: Yup.string().max(300, 'Tối đa 300 ký tự'),
});

export default function TradeModal({
    isOpen,
    onClose,
    symbol,
    companyName,
    currentPrice = 0,
    initialAction = 'buy',
    currentHolding = 0
}: TradeModalProps) {
    const reduxUser = useAppSelector(selectUser);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [lastTransactionDetails, setLastTransactionDetails] = useState<{ quantity: number; total: number } | null>(null);

    // Fetch user profile
    useEffect(() => {
        if (!isOpen) return;

        const fetchProfile = async () => {
            try {
                setLoadingProfile(true);
                const data = await userApi.getProfile();
                setProfile(data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchProfile();
    }, [isOpen]);

    const userId = reduxUser?._id || profile?._id;

    const formik = useFormik<BuyStockFormValues>({
        initialValues: {
            stock_code: symbol,
            stock_name: companyName || symbol,
            quantity: 0,
            price_per_unit: currentPrice,
            transaction_type: initialAction.toUpperCase() as TransactionType,
            notes: '',
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values, helpers) => {
            if (!userId) {
                setSubmitError('Vui lòng đăng nhập để giao dịch.');
                return;
            }

            try {
                setSubmitError(null);
                setSuccessMessage(null);

                const response = await transactionApi.createTransaction({
                    ...values,
                    userId,
                });

                setSuccessMessage(response.message);
                setLastTransactionDetails({ quantity: values.quantity, total: values.quantity * values.price_per_unit });
                if (profile) {
                    setProfile({
                        ...profile,
                        balance: response.transaction.balance_after,
                    });
                }

                // Keep modal open to show success message - user closes manually
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Không thể tạo giao dịch.';
                setSubmitError(message);
            }
        },
    });

    // Update form when initialAction changes
    useEffect(() => {
        formik.setFieldValue('transaction_type', initialAction.toUpperCase() as TransactionType);
    }, [initialAction]);

    const { quantity, price_per_unit, transaction_type } = formik.values;
    const totalCost = quantity > 0 && price_per_unit > 0 ? quantity * price_per_unit : 0;
    const availableBalance = profile?.balance || 0;
    const isBalanceInsufficient = transaction_type === 'BUY' && totalCost > availableBalance;
    const isBuy = transaction_type === 'BUY';

    const maxBuyQuantity = useMemo(() => {
        if (transaction_type !== 'BUY' || !profile?.balance) return 0;
        if (price_per_unit <= 0) return 0;
        return Math.max(Math.floor(profile.balance / price_per_unit), 0);
    }, [transaction_type, profile?.balance, price_per_unit]);

    const handleClose = useCallback(() => {
        setSubmitError(null);
        setSuccessMessage(null);
        setLastTransactionDetails(null);
        formik.resetForm();
        onClose();
    }, [onClose, formik]);

    // Handle "Buy more" - reset to form state
    const handleBuyMore = useCallback(() => {
        setSuccessMessage(null);
        setLastTransactionDetails(null);
        formik.setFieldValue('quantity', 0);
    }, [formik]);

    // ESC key handler
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleClose]);

    if (!isOpen || typeof document === 'undefined') return null;

    // Success State UI
    if (successMessage && lastTransactionDetails) {
        return createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 animate-fade-in">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                    {/* Success Header */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-center">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Giao dịch thành công!</h2>
                        <p className="text-white/90">{successMessage}</p>
                    </div>

                    {/* Transaction Details */}
                    <div className="p-6 space-y-4">
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Mã cổ phiếu</span>
                                <span className="font-bold text-gray-900">{symbol}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Số lượng</span>
                                <span className="font-bold text-gray-900">{lastTransactionDetails.quantity.toLocaleString()} CP</span>
                            </div>
                            <div className="flex justify-between border-t pt-3">
                                <span className="text-gray-500">Tổng giá trị</span>
                                <span className="font-bold text-emerald-600 text-lg">{lastTransactionDetails.total.toLocaleString('vi-VN')} VND</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Số dư còn lại</span>
                                <span className="font-semibold text-gray-700">{availableBalance.toLocaleString('vi-VN')} VND</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className="flex-1 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={handleBuyMore}
                                className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {isBuy ? 'Mua tiếp' : 'Bán tiếp'}
                            </button>
                        </div>

                        <p className="text-center text-xs text-gray-400">Nhấn ESC để đóng</p>
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                {/* Header */}
                <div className={`p-6 pb-4 ${isBuy ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-white">
                            {isBuy ? (
                                <ShoppingCart className="w-6 h-6" />
                            ) : (
                                <DollarSign className="w-6 h-6" />
                            )}
                            <div>
                                <h2 className="text-xl font-bold">
                                    {isBuy ? 'Mua' : 'Bán'} {symbol}
                                </h2>
                                <p className="text-sm opacity-90">{companyName}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Transaction Type Toggle */}
                    <div className="flex mt-4 bg-white/20 rounded-lg p-1">
                        <button
                            type="button"
                            onClick={() => formik.setFieldValue('transaction_type', 'BUY')}
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${isBuy
                                ? 'bg-white text-emerald-600 shadow-sm'
                                : 'text-white/80 hover:text-white'
                                }`}
                        >
                            MUA
                        </button>
                        <button
                            type="button"
                            onClick={() => formik.setFieldValue('transaction_type', 'SELL')}
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${!isBuy
                                ? 'bg-white text-red-600 shadow-sm'
                                : 'text-white/80 hover:text-white'
                                }`}
                        >
                            BÁN
                        </button>
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
                    {/* Balance Info (for BUY) or Holding Info (for SELL) */}
                    {isBuy ? (
                        <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                            <span className="text-sm text-gray-500">Số dư khả dụng</span>
                            <span className="font-bold text-gray-900">
                                {loadingProfile ? '...' : availableBalance.toLocaleString('vi-VN')} <span className="text-xs text-gray-500">VND</span>
                            </span>
                        </div>
                    ) : (
                        <div className="bg-red-50 rounded-lg p-3 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-red-600">Đang nắm giữ</span>
                                <span className="font-bold text-red-700">
                                    {currentHolding.toLocaleString()} <span className="text-xs">CP</span>
                                </span>
                            </div>
                            {currentHolding > 0 && (
                                <button
                                    type="button"
                                    onClick={() => formik.setFieldValue('quantity', Math.floor(currentHolding / 10) * 10)}
                                    className="w-full py-2 text-sm font-bold text-red-600 bg-white rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                                >
                                    Bán tất cả ({Math.floor(currentHolding / 10)} lô)
                                </button>
                            )}
                            {currentHolding <= 0 && (
                                <p className="text-xs text-red-500 text-center">Bạn không có cổ phiếu này để bán</p>
                            )}
                        </div>
                    )}

                    {/* Price Display (Read-only - determined by market) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giá thị trường (VND)
                        </label>
                        <div className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-lg font-mono text-gray-700">
                            {price_per_unit.toLocaleString('vi-VN')}
                        </div>
                        <p className="mt-1 text-xs text-gray-400">Giá do thị trường quyết định</p>
                    </div>

                    {/* Quantity Input - Lot Based (1 lot = 10 shares) */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-medium text-gray-700">Số lượng (lô)</label>
                            {isBuy && maxBuyQuantity > 0 && (
                                <button
                                    type="button"
                                    onClick={() => formik.setFieldValue('quantity', Math.floor(maxBuyQuantity / 10) * 10)}
                                    className="text-xs text-emerald-600 font-medium hover:underline"
                                >
                                    Tối đa: {Math.floor(maxBuyQuantity / 10)} lô
                                </button>
                            )}
                        </div>

                        {/* Quick Lot Buttons */}
                        <div className="flex gap-2 mb-2">
                            {[1, 5, 10, 20, 50, 100].map((lots) => (
                                <button
                                    key={lots}
                                    type="button"
                                    onClick={() => formik.setFieldValue('quantity', lots * 10)}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all border ${quantity === lots * 10
                                        ? (isBuy ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-red-100 text-red-700 border-red-300')
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                        }`}
                                >
                                    {lots}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <input
                                type="number"
                                name="quantity"
                                value={quantity ? quantity / 10 : ''}
                                onChange={(e) => {
                                    const lots = parseInt(e.target.value) || 0;
                                    formik.setFieldValue('quantity', lots * 10);
                                }}
                                onBlur={formik.handleBlur}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-lg font-mono transition-all pr-20"
                                placeholder="Nhập số lô"
                                min={1}
                                step={1}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                lô
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            = <span className="font-semibold text-gray-700">{quantity.toLocaleString()}</span> cổ phiếu (1 lô = 10 CP)
                        </p>
                        {formik.touched.quantity && formik.errors.quantity && (
                            <p className="mt-1 text-sm text-red-500">{formik.errors.quantity}</p>
                        )}
                    </div>

                    {/* Total */}
                    <div className="border-t border-gray-100 pt-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Tổng giá trị</span>
                            <span className={`text-2xl font-bold ${isBalanceInsufficient ? 'text-red-500' : 'text-gray-900'}`}>
                                {totalCost.toLocaleString('vi-VN')} <span className="text-sm text-gray-500">VND</span>
                            </span>
                        </div>
                        {isBalanceInsufficient && (
                            <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Số dư không đủ để thực hiện giao dịch
                            </p>
                        )}
                    </div>

                    {/* Error/Success Messages */}
                    {submitError && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {submitError}
                        </div>
                    )}
                    {successMessage && (
                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            {successMessage}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={formik.isSubmitting || isBalanceInsufficient || !quantity || !price_per_unit}
                        className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isBuy
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-200'
                            : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-200'
                            }`}
                    >
                        {formik.isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                {isBuy ? <ShoppingCart className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                                {isBuy ? 'Xác nhận MUA' : 'Xác nhận BÁN'}
                            </>
                        )}
                    </button>
                </form>
            </div >
        </div >,
        document.body
    );
}
