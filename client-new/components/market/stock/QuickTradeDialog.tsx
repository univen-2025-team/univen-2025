'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BuyOrderForm } from '@/components/trade/BuyOrderForm';
import { TransactionSummaryCard } from '@/components/trade/TransactionSummaryCard';
import { transactionApi } from '@/lib/api/transaction.api';
import { userApi } from '@/lib/api/user.api';
import { useAppSelector } from '@/lib/store/hooks';
import { selectUser } from '@/lib/store/authSlice';
import type { BuyStockFormValues, TransactionMetadata, TransactionType } from '@/lib/types/transactions';

type QuickTradeDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    symbol: string;
    companyName?: string;
    defaultPrice: number;
    mode: TransactionType;
};

const validationSchema = Yup.object({
    stock_code: Yup.string().trim().min(1).required('Vui lòng nhập mã cổ phiếu'),
    stock_name: Yup.string().trim().min(2).required('Vui lòng nhập tên cổ phiếu'),
    quantity: Yup.number().typeError('Số lượng phải là số').integer().min(1, 'Ít nhất 1 CP').required(),
    price_per_unit: Yup.number().typeError('Giá phải là số').min(0, 'Giá không hợp lệ').required(),
    transaction_type: Yup.mixed<TransactionType>().oneOf(['BUY', 'SELL']).required(),
    notes: Yup.string().max(300, 'Tối đa 300 ký tự'),
});

export function QuickTradeDialog({
    open,
    onOpenChange,
    symbol,
    companyName,
    defaultPrice,
    mode,
}: QuickTradeDialogProps) {
    const reduxUser = useAppSelector(selectUser);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [lastTransaction, setLastTransaction] = useState<TransactionMetadata | null>(null);
    const [fallbackBalance, setFallbackBalance] = useState<number | undefined>(reduxUser?.balance);

    useEffect(() => {
        if (reduxUser?.balance !== undefined) {
            setFallbackBalance(reduxUser.balance);
            return;
        }

        let isMounted = true;

        const fetchBalance = async () => {
            try {
                const profile = await userApi.getProfile();
                if (isMounted) {
                    setFallbackBalance(profile.balance);
                }
            } catch (error) {
                console.error('Không thể tải số dư người dùng:', error);
            }
        };

        fetchBalance();

        return () => {
            isMounted = false;
        };
    }, [reduxUser?.balance]);

    const effectiveBalance = reduxUser?.balance ?? fallbackBalance;
    const numericBalance = typeof effectiveBalance === 'number' ? effectiveBalance : undefined;

    const formik = useFormik<BuyStockFormValues>({
        enableReinitialize: true,
        initialValues: {
            stock_code: symbol,
            stock_name: companyName || symbol,
            quantity: 0,
            price_per_unit: defaultPrice,
            transaction_type: mode,
            notes: '',
        },
        validationSchema,
        onSubmit: async (values, helpers) => {
            if (!reduxUser?._id) {
                setErrorMessage('Bạn cần đăng nhập để đặt lệnh.');
                return;
            }
            try {
                setErrorMessage(null);
                setSuccessMessage(null);
                const response = await transactionApi.createTransaction({
                    userId: reduxUser._id,
                    ...values,
                });
                setLastTransaction(response.transaction);
                setFallbackBalance(response.transaction.balance_after);
                setSuccessMessage('Đặt lệnh thành công!');
                helpers.resetForm({
                    values: {
                        ...values,
                        quantity: 0,
                        notes: '',
                    },
                });
            } catch (error) {
                const message =
                    (error &&
                        typeof error === 'object' &&
                        'response' in error &&
                        (error as any).response?.data?.message) ||
                    (error instanceof Error ? error.message : 'Không thể đặt lệnh, thử lại sau.');
                setErrorMessage(message);
            } finally {
                helpers.setSubmitting(false);
            }
        },
    });

    const maxBuyQuantity = useMemo(() => {
        if (formik.values.transaction_type !== 'BUY') return undefined;
        if (numericBalance === undefined) return undefined;
        if (formik.values.price_per_unit <= 0) return undefined;
        return Math.max(Math.floor(numericBalance / formik.values.price_per_unit), 0);
    }, [formik.values.transaction_type, formik.values.price_per_unit, numericBalance]);

    const estimatedQuantity = formik.values.quantity;
    const totalCost = formik.values.quantity * formik.values.price_per_unit;
    const isBalanceInsufficient =
        formik.values.transaction_type === 'BUY' && numericBalance !== undefined && totalCost > numericBalance;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'BUY' ? 'Mua nhanh' : 'Bán nhanh'} {symbol}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {errorMessage && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {errorMessage}
                        </div>
                    )}
                    <form onSubmit={formik.handleSubmit}>
                        <BuyOrderForm
                            formik={formik}
                            maxBuyQuantity={maxBuyQuantity}
                            onUseMaxQuantity={() => {
                                if (maxBuyQuantity !== undefined) {
                                    formik.setFieldValue('quantity', maxBuyQuantity);
                                }
                            }}
                            {...(numericBalance !== undefined ? { availableBalance: numericBalance } : {})}
                            disableSubmit={isBalanceInsufficient || formik.isSubmitting}
                        >
                            <TransactionSummaryCard
                                quantity={estimatedQuantity}
                                pricePerUnit={formik.values.price_per_unit}
                                {...(numericBalance !== undefined ? { balance: numericBalance } : {})}
                                transactionType={formik.values.transaction_type}
                                isSubmitting={formik.isSubmitting}
                                lastTransaction={lastTransaction}
                                successMessage={successMessage || undefined}
                            />

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={formik.isSubmitting}
                                >
                                    Đóng
                                </Button>
                                <Button type="submit" disabled={formik.isSubmitting || isBalanceInsufficient || totalCost <= 0}>
                                    {formik.isSubmitting ? 'Đang xử lý...' : 'Đặt lệnh'}
                                </Button>
                            </div>
                        </BuyOrderForm>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

