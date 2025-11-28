import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TransactionMetadata, TransactionType } from "@/lib/types/transactions";

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
    <span className="font-semibold text-gray-900">
        {value.toLocaleString("vi-VN")} <span className="text-xs text-gray-500">VND</span>
    </span>
);

export function TransactionSummaryCard({
    quantity,
    pricePerUnit,
    balance,
    transactionType,
    isSubmitting,
    lastTransaction,
    successMessage,
}: TransactionSummaryCardProps) {
    const totalAmount = quantity > 0 && pricePerUnit > 0 ? quantity * pricePerUnit : 0;
    const totalCost = totalAmount;

    let balanceAfter = balance;
    if (typeof balance === "number") {
        balanceAfter = transactionType === "BUY" ? balance - totalCost : balance + totalAmount;
    }

    const insufficientBalance =
        transactionType === "BUY" &&
        typeof balance === "number" &&
        totalCost > 0 &&
        balance < totalCost;

    return (
        <Card className="border border-gray-100 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Tóm tắt lệnh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                        <span>Khối lượng</span>
                        <span className="font-semibold text-gray-900">
                            {quantity > 0 ? quantity.toLocaleString("vi-VN") : 0} CP
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
                    <div className="flex justify-between text-base font-semibold text-gray-900">
                        <span>{transactionType === "BUY" ? "Tổng chi phí" : "Số tiền nhận"}</span>
                        <CurrencyText value={totalCost} />
                    </div>
                </div>

                {typeof balance === "number" && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Số dư khả dụng</span>
                            <CurrencyText value={balance} />
                        </div>
                        <div className="mt-1 flex justify-between text-gray-600">
                            <span>Số dư dự kiến</span>
                            <CurrencyText value={balanceAfter || balance} />
                        </div>
                        {insufficientBalance && (
                            <p className="mt-2 text-sm font-medium text-red-600">
                                Số dư hiện tại không đủ để thực hiện lệnh mua.
                            </p>
                        )}
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                    disabled={isSubmitting || insufficientBalance || quantity <= 0 || pricePerUnit <= 0}
                >
                    {isSubmitting ? "Đang thực hiện..." : transactionType === "BUY" ? "Đặt lệnh mua" : "Đặt lệnh bán"}
                </Button>

                {successMessage && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {successMessage}
                    </div>
                )}

                {lastTransaction && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-900">
                        <p className="font-semibold">Lệnh gần nhất</p>
                        <p>
                            {lastTransaction.transaction_type} {lastTransaction.stock_code} •{" "}
                            {lastTransaction.quantity.toLocaleString("vi-VN")} CP ở mức{" "}
                            {lastTransaction.price_per_unit.toLocaleString("vi-VN")} VND.
                        </p>
                        <p className="mt-1 text-green-800">
                            Khớp lúc {new Date(lastTransaction.executed_at).toLocaleString("vi-VN")}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

