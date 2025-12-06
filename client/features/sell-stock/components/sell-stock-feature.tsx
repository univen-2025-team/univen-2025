'use client';

/**
 * Sell Stock Feature - Step-by-step wizard for selling stocks
 *
 * Flow:
 * - Step 0: Chọn cổ phiếu muốn bán và nhập số lượng
 * - Step 1: Chọn loại lệnh (Market/Limit) và ghi chú
 * - Step 2: Xác nhận thông tin giao dịch
 * - Step 3: Hiển thị kết quả (success/failure)
 */

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, TrendingDown } from 'lucide-react';
import { transactionApi } from '@/lib/api/transaction.api';
import { useAppSelector } from '@/lib/store/hooks';
import { selectUser } from '@/lib/store/authSlice';
import { useProfile } from '@/lib/hooks/useProfile';

export type SellStockData = {
    symbol: string;
    companyName?: string;
    currentPrice: number;
    holdingQuantity: number; // Số lượng CP đang có
    averageBuyPrice: number; // Giá mua trung bình
};

type SellStockFeatureProps = {
    data: SellStockData;
    onBack?: () => void;
    onSuccess?: () => void;
};

type TransactionResult = {
    success: boolean;
    message: string;
    balance_after?: number;
    transaction_id?: string;
    profit?: number;
    profitPercent?: number;
};

export function SellStockFeature({ data, onBack, onSuccess }: SellStockFeatureProps) {
    // ==================== HOOKS ====================
    const reduxUser = useAppSelector(selectUser);
    const { profile, refetch: refetchProfile } = useProfile(true);

    const [quantity, setQuantity] = useState<number>(0);
    const [orderType, setOrderType] = useState<string>('Market Order');
    const [notes, setNotes] = useState<string>('');
    const [stepIndex, setStepIndex] = useState(0);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);
    const [quantityError, setQuantityError] = useState<string | null>(null);

    // ==================== COMPUTED VALUES ====================
    const availableBalance =
        (typeof profile?.balance === 'number' ? profile.balance : null) ??
        (typeof reduxUser?.balance === 'number' ? reduxUser.balance : null) ??
        0;

    // Prices are already in VND from market API
    const priceInVND = data.currentPrice;
    const avgBuyPriceInVND = data.averageBuyPrice;

    const estimatedRevenue = useMemo(() => {
        if (!quantity || quantity <= 0) return 0;
        return quantity * priceInVND;
    }, [quantity, priceInVND]);

    const estimatedProfit = useMemo(() => {
        if (!quantity || quantity <= 0) return 0;
        return (priceInVND - avgBuyPriceInVND) * quantity;
    }, [quantity, priceInVND, avgBuyPriceInVND]);

    const profitPercent = useMemo(() => {
        if (avgBuyPriceInVND <= 0) return 0;
        return ((priceInVND - avgBuyPriceInVND) / avgBuyPriceInVND) * 100;
    }, [priceInVND, avgBuyPriceInVND]);

    // Reset when symbol changes
    useEffect(() => {
        setStepIndex(0);
        setQuantity(0);
        setOrderType('Market Order');
        setNotes('');
        setPlacingOrder(false);
        setTransactionResult(null);
        setQuantityError(null);
    }, [data.symbol]);

    // Validate quantity
    useEffect(() => {
        if (quantity > data.holdingQuantity) {
            setQuantityError(`Bạn chỉ có ${data.holdingQuantity} CP ${data.symbol}`);
        } else if (quantity < 0) {
            setQuantityError('Số lượng không hợp lệ');
        } else {
            setQuantityError(null);
        }
    }, [quantity, data.holdingQuantity, data.symbol]);

    // ==================== HANDLERS ====================
    const handleSubmit = () => {
        if (stepIndex === 0) {
            if (quantity <= 0 || quantity > data.holdingQuantity) {
                setQuantityError(`Vui lòng nhập số lượng hợp lệ (1 - ${data.holdingQuantity})`);
                return;
            }
            setStepIndex(1);
            return;
        }

        if (stepIndex === 1) {
            setStepIndex(2);
            return;
        }

        if (stepIndex === 2) {
            handlePlaceOrder();
            return;
        }
    };

    const handlePreviousStep = () => {
        if (stepIndex === 0) return;
        if (transactionResult) {
            setTransactionResult(null);
            setStepIndex(0);
            setQuantity(0);
            return;
        }
        setStepIndex((prev) => Math.max(prev - 1, 0));
        setQuantityError(null);
    };

    const handlePlaceOrder = async () => {
        if (!reduxUser?._id) {
            setTransactionResult({
                success: false,
                message: 'Vui lòng đăng nhập để đặt lệnh.'
            });
            setStepIndex(3);
            return;
        }

        if (!quantity || quantity <= 0 || quantity > data.holdingQuantity) {
            setTransactionResult({
                success: false,
                message: 'Số lượng không hợp lệ.'
            });
            setStepIndex(3);
            return;
        }

        setPlacingOrder(true);

        const payload = {
            userId: reduxUser._id,
            stock_code: data.symbol,
            stock_name: data.companyName || data.symbol,
            quantity,
            price_per_unit: priceInVND, // Already in VND (API returns real VND values)
            transaction_type: 'SELL' as const,
            notes: notes || `${orderType} - Bán ${quantity} CP`
        };

        try {
            const response = await transactionApi.createTransaction(payload);
            await refetchProfile();

            setTransactionResult({
                success: true,
                message: 'Đặt lệnh bán thành công!',
                balance_after: response.transaction.balance_after,
                transaction_id: response.transaction.transaction_id,
                profit: estimatedProfit,
                profitPercent: profitPercent
            });
            setStepIndex(3);
            onSuccess?.();
        } catch (error) {
            let errorMessage = 'Không thể đặt lệnh, vui lòng thử lại sau.';

            if (error && typeof error === 'object' && 'message' in error) {
                errorMessage = (error as any).message;
            } else if (
                error &&
                typeof error === 'object' &&
                'response' in error &&
                (error as any).response?.data?.message
            ) {
                errorMessage = (error as any).response.data.message;
            }

            setTransactionResult({
                success: false,
                message: errorMessage
            });
            setStepIndex(3);
        } finally {
            setPlacingOrder(false);
        }
    };

    const handleSellAll = () => {
        setQuantity(data.holdingQuantity);
        setQuantityError(null);
    };

    // ==================== UI STATE ====================
    const totalSteps = 4;
    const progress = ((stepIndex + 1) / totalSteps) * 100;

    const isNextDisabled = useMemo(() => {
        if (placingOrder || transactionResult) return true;

        if (stepIndex === 0) {
            return !(quantity > 0 && quantity <= data.holdingQuantity);
        }

        if (stepIndex === 1) {
            return !orderType;
        }

        return false;
    }, [stepIndex, quantity, data.holdingQuantity, orderType, placingOrder, transactionResult]);

    // ==================== RENDER RESULT ====================
    if (transactionResult) {
        return (
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center gap-4">
                    {onBack && (
                        <Button variant="ghost" size="icon" onClick={onBack}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold">Kết quả giao dịch</h1>
                        <p className="text-sm text-muted-foreground">{data.symbol}</p>
                    </div>
                </div>

                {/* Result Card */}
                <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                    <CardHeader>
                        <div className="flex items-center justify-center py-4">
                            {transactionResult.success ? (
                                <CheckCircle2 className="h-20 w-20 text-success" />
                            ) : (
                                <XCircle className="h-20 w-20 text-error" />
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2
                                className={`text-2xl font-bold ${
                                    transactionResult.success ? 'text-success' : 'text-error'
                                }`}
                            >
                                {transactionResult.success
                                    ? '✅ Bán thành công!'
                                    : '❌ Giao dịch thất bại'}
                            </h2>
                            <p className="text-muted-foreground">{transactionResult.message}</p>
                        </div>

                        {transactionResult.success && (
                            <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/10 p-4">
                                <h3 className="font-semibold text-lg">📋 Chi tiết giao dịch</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Mã cổ phiếu
                                        </span>
                                        <span className="font-semibold">{data.symbol}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Số lượng đã bán
                                        </span>
                                        <span className="font-semibold">
                                            {quantity.toLocaleString('vi-VN')} CP
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Giá bán/CP
                                        </span>
                                        <span className="font-semibold">
                                            {priceInVND.toLocaleString('vi-VN')} VND
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Tổng tiền nhận
                                        </span>
                                        <span className="font-semibold text-success">
                                            +{estimatedRevenue.toLocaleString('vi-VN')} VND
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t">
                                        <span className="text-sm text-muted-foreground">
                                            Lợi nhuận
                                        </span>
                                        <span
                                            className={`font-semibold ${
                                                estimatedProfit >= 0 ? 'text-success' : 'text-error'
                                            }`}
                                        >
                                            {estimatedProfit >= 0 ? '+' : ''}
                                            {estimatedProfit.toLocaleString('vi-VN')} VND (
                                            {profitPercent.toFixed(2)}%)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {transactionResult.success &&
                            transactionResult.balance_after !== undefined && (
                                <div className="rounded-2xl border border-success bg-success-light p-4">
                                    <h3 className="font-semibold text-green-800 mb-2">
                                        💰 Số dư tài khoản
                                    </h3>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-green-700">
                                                Số dư trước
                                            </span>
                                            <span className="font-semibold text-green-900">
                                                {availableBalance.toLocaleString('vi-VN')} VND
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-green-700">
                                                Tiền nhận được
                                            </span>
                                            <span className="font-semibold text-success">
                                                +{estimatedRevenue.toLocaleString('vi-VN')} VND
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-green-300">
                                            <span className="text-sm font-semibold text-green-700">
                                                Số dư hiện tại
                                            </span>
                                            <span className="text-lg font-bold text-green-900">
                                                {transactionResult.balance_after.toLocaleString(
                                                    'vi-VN'
                                                )}{' '}
                                                VND
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                        {!transactionResult.success && (
                            <div className="rounded-2xl border border-error bg-error-light p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-error mt-0.5" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-red-800 mb-1">
                                            Lý do thất bại
                                        </h3>
                                        <p className="text-sm text-red-700">
                                            {transactionResult.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                                onClick={() => {
                                    setTransactionResult(null);
                                    setStepIndex(0);
                                    setQuantity(0);
                                }}
                                className="flex-1"
                                variant={transactionResult.success ? 'default' : 'outline'}
                            >
                                {transactionResult.success ? 'Bán thêm' : 'Thử lại'}
                            </Button>
                            {onBack && (
                                <Button onClick={onBack} variant="outline" className="flex-1">
                                    Quay về danh mục
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ==================== RENDER FORM ====================
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                {onBack && (
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                )}
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingDown className="h-6 w-6 text-error" />
                        Bán {data.symbol}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Giá hiện tại: {priceInVND.toLocaleString('vi-VN')} VND
                    </p>
                </div>
            </div>

            {/* Stock Info Card */}
            <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Đang nắm giữ</p>
                            <p className="text-xl font-bold">
                                {data.holdingQuantity.toLocaleString('vi-VN')} CP
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Giá mua TB</p>
                            <p className="text-xl font-bold">
                                {avgBuyPriceInVND.toLocaleString('vi-VN')} VND
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Lãi/Lỗ</p>
                            <p
                                className={`text-xl font-bold ${
                                    profitPercent >= 0 ? 'text-success' : 'text-error'
                                }`}
                            >
                                {profitPercent >= 0 ? '+' : ''}
                                {profitPercent.toFixed(2)}%
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Card */}
            <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                    <div className="space-y-2">
                        <CardTitle>
                            {stepIndex === 0 && 'Bước 1/3: Nhập số lượng bán'}
                            {stepIndex === 1 && 'Bước 2/3: Cấu hình lệnh'}
                            {stepIndex === 2 && 'Bước 3/3: Xác nhận bán'}
                        </CardTitle>
                        <Progress value={progress} className="h-2" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {quantityError && (
                        <div className="rounded-lg border border-error bg-error-light px-4 py-3 text-sm font-medium text-error">
                            ⚠️ {quantityError}
                        </div>
                    )}

                    {/* Step 0: Quantity */}
                    {stepIndex === 0 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Số lượng cổ phiếu muốn bán</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="quantity"
                                        type="number"
                                        placeholder="Nhập số lượng"
                                        value={quantity || ''}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        min={1}
                                        max={data.holdingQuantity}
                                    />
                                    <Button variant="outline" onClick={handleSellAll}>
                                        Bán hết
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Tối đa: {data.holdingQuantity.toLocaleString('vi-VN')} CP
                                </p>
                            </div>

                            {quantity > 0 && (
                                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Ước tính tiền nhận được:
                                    </p>
                                    <p className="text-2xl font-bold text-primary">
                                        {estimatedRevenue.toLocaleString('vi-VN')} VND
                                    </p>
                                    <p
                                        className={`text-sm ${
                                            estimatedProfit >= 0 ? 'text-success' : 'text-error'
                                        }`}
                                    >
                                        Lợi nhuận dự kiến: {estimatedProfit >= 0 ? '+' : ''}
                                        {estimatedProfit.toLocaleString('vi-VN')} VND (
                                        {profitPercent.toFixed(2)}%)
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 1: Order Type */}
                    {stepIndex === 1 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="orderType">Loại lệnh</Label>
                                <Select value={orderType} onValueChange={setOrderType}>
                                    <SelectTrigger id="orderType">
                                        <SelectValue placeholder="Chọn loại lệnh" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Market Order">
                                            Market Order (Lệnh thị trường)
                                        </SelectItem>
                                        <SelectItem value="Limit Order">
                                            Limit Order (Lệnh giới hạn)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
                                <Input
                                    id="notes"
                                    type="text"
                                    placeholder="Nhập ghi chú..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Confirmation */}
                    {stepIndex === 2 && (
                        <div className="space-y-4 rounded-lg border border-border/60 bg-muted/10 p-4">
                            <h3 className="font-semibold text-lg">📋 Xác nhận lệnh BÁN</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Mã cổ phiếu
                                    </span>
                                    <span className="font-semibold text-base">{data.symbol}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Số lượng bán
                                    </span>
                                    <span className="font-semibold text-base text-error">
                                        -{quantity.toLocaleString('vi-VN')} CP
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Giá bán/CP
                                    </span>
                                    <span className="font-semibold text-base">
                                        {priceInVND.toLocaleString('vi-VN')} VND
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t">
                                    <span className="text-sm text-muted-foreground">Loại lệnh</span>
                                    <span className="font-semibold">{orderType}</span>
                                </div>
                                {notes && (
                                    <div className="flex items-start justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Ghi chú
                                        </span>
                                        <span className="font-medium text-foreground text-right max-w-[60%]">
                                            {notes}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between pt-2 border-t text-lg font-bold">
                                    <span>Tiền nhận được</span>
                                    <span className="text-success">
                                        +{estimatedRevenue.toLocaleString('vi-VN')} VND
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Lợi nhuận</span>
                                    <span
                                        className={`font-semibold ${
                                            estimatedProfit >= 0 ? 'text-success' : 'text-error'
                                        }`}
                                    >
                                        {estimatedProfit >= 0 ? '+' : ''}
                                        {estimatedProfit.toLocaleString('vi-VN')} VND
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-slate-600">Số dư hiện tại</span>
                                    <span className="font-semibold text-slate-900">
                                        {availableBalance.toLocaleString('vi-VN')} VND
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600">Số dư sau giao dịch</span>
                                    <span className="font-semibold text-success">
                                        {(availableBalance + estimatedRevenue).toLocaleString(
                                            'vi-VN'
                                        )}{' '}
                                        VND
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                        {stepIndex > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                className="sm:flex-1"
                                disabled={placingOrder}
                                onClick={handlePreviousStep}
                            >
                                ← Quay lại
                            </Button>
                        )}
                        <Button
                            onClick={handleSubmit}
                            className="flex-1"
                            disabled={isNextDisabled}
                            variant={stepIndex === 2 ? 'destructive' : 'default'}
                        >
                            {placingOrder ? (
                                <>⏳ Đang xử lý...</>
                            ) : stepIndex === 2 ? (
                                <>🔴 Xác nhận BÁN</>
                            ) : (
                                <>Tiếp tục →</>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
