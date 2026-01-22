import { FormikProps } from 'formik';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import type { BuyStockFormValues, TransactionType } from '@/lib/types/transactions';
import { ChangeEvent, ReactNode } from 'react';

type BuyOrderFormProps = {
    formik: FormikProps<BuyStockFormValues>;
    maxBuyQuantity?: number;
    onUseMaxQuantity?: () => void;
    children?: ReactNode;
    availableBalance?: number;
    disableSubmit?: boolean;
};

const TRANSACTION_OPTIONS: TransactionType[] = ['BUY', 'SELL'];

const getNumberValue = (value: number) => (value ? value : '');

export function BuyOrderForm({
    formik,
    maxBuyQuantity,
    onUseMaxQuantity,
    children,
    availableBalance,
    disableSubmit
}: BuyOrderFormProps) {
    const renderError = (field: keyof BuyStockFormValues) => {
        if (!formik.touched[field] || !formik.errors[field]) return null;
        return <p className="text-sm text-destructive">{formik.errors[field]}</p>;
    };

    const inputClass =
        'bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20';
    const triggerClass =
        'w-full bg-background border-input text-foreground hover:bg-muted/50 [&_svg]:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20';

    const isBuyTransaction = formik.values.transaction_type === 'BUY';
    const numericBalance = typeof availableBalance === 'number' ? availableBalance : undefined;
    const totalCost =
        formik.values.quantity > 0 && formik.values.price_per_unit > 0
            ? formik.values.quantity * formik.values.price_per_unit
            : 0;
    const exceedsBalance = Boolean(
        isBuyTransaction && numericBalance !== undefined && totalCost > numericBalance
    );

    const balanceDerivedMaxQuantity =
        isBuyTransaction && numericBalance !== undefined && formik.values.price_per_unit > 0
            ? Math.max(Math.floor(numericBalance / formik.values.price_per_unit), 0)
            : undefined;

    const maxQuantityOptions = [maxBuyQuantity, balanceDerivedMaxQuantity].filter(
        (value): value is number =>
            typeof value === 'number' && Number.isFinite(value) && value >= 0
    );

    const resolvedMaxQuantity =
        isBuyTransaction && maxQuantityOptions.length > 0
            ? Math.min(...maxQuantityOptions)
            : undefined;

    const clampQuantity = (value: number) => {
        if (!isBuyTransaction || resolvedMaxQuantity === undefined) return value;
        return Math.min(value, resolvedMaxQuantity);
    };

    const handleQuantityChange = (event: ChangeEvent<HTMLInputElement>) => {
        const numericValue = Number(event.target.value);
        const safeValue = Number.isNaN(numericValue) ? 0 : Math.max(numericValue, 0);
        formik.setFieldValue('quantity', clampQuantity(safeValue));
    };

    const handlePriceChange = (event: ChangeEvent<HTMLInputElement>) => {
        const numericValue = Number(event.target.value);
        const safeValue = Number.isNaN(numericValue) ? 0 : Math.max(numericValue, 0);
        formik.setFieldValue('price_per_unit', safeValue);

        if (
            isBuyTransaction &&
            numericBalance !== undefined &&
            safeValue > 0 &&
            (maxBuyQuantity !== undefined || numericBalance >= 0)
        ) {
            const nextBalanceMax = Math.max(Math.floor(numericBalance / safeValue), 0);
            const nextOptions = [maxBuyQuantity, nextBalanceMax].filter(
                (value): value is number =>
                    typeof value === 'number' && Number.isFinite(value) && value >= 0
            );

            if (nextOptions.length > 0) {
                const nextResolvedMax = Math.min(...nextOptions);
                if (formik.values.quantity > nextResolvedMax) {
                    formik.setFieldValue('quantity', nextResolvedMax);
                }
            }
        }
    };

    const formattedBalance =
        numericBalance !== undefined ? numericBalance.toLocaleString('vi-VN') : null;
    const formattedTotalCost = totalCost > 0 ? totalCost.toLocaleString('vi-VN') : null;
    const remainingBalance =
        isBuyTransaction && numericBalance !== undefined && totalCost > 0
            ? Math.max(numericBalance - totalCost, 0).toLocaleString('vi-VN')
            : null;

    return (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="space-y-6">
                <section className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="stock_code">Mã cổ phiếu</Label>
                        <Input
                            id="stock_code"
                            name="stock_code"
                            placeholder="VD: VNM"
                            value={formik.values.stock_code}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            autoComplete="off"
                            className={inputClass}
                        />
                        {renderError('stock_code')}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="stock_name">Tên cổ phiếu</Label>
                        <Input
                            id="stock_name"
                            name="stock_name"
                            placeholder="Vinamilk"
                            value={formik.values.stock_name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={inputClass}
                        />
                        {renderError('stock_name')}
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="transaction_type">Loại giao dịch</Label>
                        <Select
                            value={formik.values.transaction_type}
                            onValueChange={(value) =>
                                formik.setFieldValue('transaction_type', value)
                            }
                        >
                            <SelectTrigger id="transaction_type" className={triggerClass}>
                                <SelectValue placeholder="Chọn loại lệnh" />
                            </SelectTrigger>
                            <SelectContent>
                                {TRANSACTION_OPTIONS.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option === 'BUY' ? 'Mua (BUY)' : 'Bán (SELL)'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {renderError('transaction_type')}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quantity">Số lượng</Label>
                        <div className="flex gap-2">
                            <Input
                                id="quantity"
                                type="number"
                                min={0}
                                step={1}
                                value={getNumberValue(formik.values.quantity)}
                                onChange={handleQuantityChange}
                                onBlur={formik.handleBlur}
                                className={inputClass}
                            />
                            {isBuyTransaction && resolvedMaxQuantity !== undefined && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (onUseMaxQuantity) {
                                            onUseMaxQuantity();
                                        } else {
                                            formik.setFieldValue('quantity', resolvedMaxQuantity);
                                        }
                                    }}
                                    className="rounded-md border border-input bg-muted px-3 text-sm font-semibold text-foreground transition hover:bg-muted/80"
                                >
                                    MAX
                                </button>
                            )}
                        </div>
                        {isBuyTransaction && resolvedMaxQuantity !== undefined && (
                            <p className="text-xs text-muted-foreground">
                                Có thể mua tối đa {resolvedMaxQuantity.toLocaleString('vi-VN')} cổ
                                phiếu
                            </p>
                        )}
                        {exceedsBalance && (
                            <p className="text-xs text-destructive">
                                Tổng giá trị lệnh ({formattedTotalCost} VND) lớn hơn số dư khả dụng
                                của bạn.
                            </p>
                        )}
                        {renderError('quantity')}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price_per_unit">Giá/CP (VND)</Label>
                        <Input
                            id="price_per_unit"
                            type="number"
                            min={0}
                            step="100"
                            value={getNumberValue(formik.values.price_per_unit)}
                            onChange={handlePriceChange}
                            onBlur={formik.handleBlur}
                            className={inputClass}
                        />
                        {renderError('price_per_unit')}
                    </div>
                </section>

                <section className="space-y-2">
                    <Label htmlFor="notes">Ghi chú</Label>
                    <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        placeholder="Ví dụ: Khớp lệnh theo báo cáo phân tích, cân nhắc giữ tối thiểu 3 tháng..."
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                        value={formik.values.notes}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    {renderError('notes')}
                </section>

                {formattedBalance && (
                    <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Số dư khả dụng</span>
                            <span className="font-semibold text-foreground">{formattedBalance} VND</span>
                        </div>
                        {isBuyTransaction && formattedTotalCost && (
                            <div className="mt-2 space-y-1">
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span>Tổng giá trị dự kiến</span>
                                    <span className="font-semibold text-foreground">{formattedTotalCost} VND</span>
                                </div>
                                {remainingBalance && (
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span>Số dư còn lại sau lệnh</span>
                                        <span className="font-semibold text-foreground">
                                            {remainingBalance} VND
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                        {isBuyTransaction && (exceedsBalance || disableSubmit) && (
                            <p className="mt-2 text-xs text-destructive">
                                Số dư không đủ để đặt lệnh mua. Vui lòng giảm số lượng hoặc nạp thêm
                                tiền.
                            </p>
                        )}
                    </div>
                )}

                <div className="pt-2">{children}</div>
            </div>
        </div>
    );
}
