import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { TransactionMetadata, TransactionType } from '@/lib/types/transactions';

type TransactionSummaryCardProps = {
    quantity: number;
    pricePerUnit: number;
    balance?: number;
    transactionType: TransactionType;
    isSubmitting?: boolean;
    lastTransaction?: TransactionMetadata | null;
    successMessage?: string;
};

const CurrencyText = ({ value }: { value: number }) => (
    <span className="font-semibold text-white">
        {value.toLocaleString('vi-VN')} <span className="text-xs text-gray-400">VND</span>
    </span>
);

export function TransactionSummaryCard({
    quantity,
    pricePerUnit,
    balance,
    transactionType,
    isSubmitting,
    lastTransaction,
    successMessage
}: TransactionSummaryCardProps) {
    const totalAmount = quantity > 0 && pricePerUnit > 0 ? quantity * pricePerUnit : 0;
    const totalCost = totalAmount;

    let balanceAfter = balance;
    if (typeof balance === 'number') {
        balanceAfter = transactionType === 'BUY' ? balance - totalCost : balance + totalAmount;
    }

    const insufficientBalance =
        transactionType === 'BUY' &&
        typeof balance === 'number' &&
        totalCost > 0 &&
        balance < totalCost;

    return (
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <Card className="relative border border-white/10 bg-[#0F111A]/80 backdrop-blur-2xl shadow-2xl ring-1 ring-white/5">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-white">Tóm tắt lệnh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="space-y-1 text-sm text-slate-400">
                        <div className="flex justify-between">
                            <span>Khối lượng</span>
                            <span className="font-semibold text-white">
                                {quantity > 0 ? quantity.toLocaleString('vi-VN') : 0} CP
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Giá/CP</span>
                            <CurrencyText value={pricePerUnit} />
                        </div>
                        <div className="flex justify-between">
                            <span>Tổng giá trị</span>
                            <CurrencyText value={totalAmount} />
                        </div>
                        <div className="flex justify-between text-base font-semibold text-white">
                            <span>
                                {transactionType === 'BUY' ? 'Tổng chi phí' : 'Số tiền nhận'}
                            </span>
                            <CurrencyText value={totalCost} />
                        </div>
                    </div>

                    {typeof balance === 'number' && (
                        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                            <div className="flex justify-between text-gray-400">
                                <span>Số dư khả dụng</span>
                                <CurrencyText value={balance} />
                            </div>
                            <div className="mt-1 flex justify-between text-gray-400">
                                <span>Số dư dự kiến</span>
                                <CurrencyText value={balanceAfter || balance} />
                            </div>
                            {insufficientBalance && (
                                <p className="mt-2 text-sm font-medium text-red-400">
                                    Số dư hiện tại không đủ để thực hiện lệnh mua.
                                </p>
                            )}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20"
                        disabled={
                            isSubmitting ||
                            insufficientBalance ||
                            quantity <= 0 ||
                            pricePerUnit <= 0
                        }
                    >
                        {isSubmitting
                            ? 'Đang thực hiện...'
                            : transactionType === 'BUY'
                              ? 'Đặt lệnh mua'
                              : 'Đặt lệnh bán'}
                    </Button>

                    {successMessage && (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                            {successMessage}
                        </div>
                    )}

                    {lastTransaction && (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">
                            <p className="font-semibold">Lệnh gần nhất</p>
                            <p>
                                {lastTransaction.transaction_type} {lastTransaction.stock_code} •{' '}
                                {lastTransaction.quantity.toLocaleString('vi-VN')} CP ở mức{' '}
                                {lastTransaction.price_per_unit.toLocaleString('vi-VN')} VND.
                            </p>
                            <p className="mt-1 text-emerald-400">
                                Khớp lúc{' '}
                                {new Date(lastTransaction.executed_at).toLocaleString('vi-VN')}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
