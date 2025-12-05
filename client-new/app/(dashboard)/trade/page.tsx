"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card, CardContent } from "@/components/ui/card";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { userApi, type UserProfile } from "@/lib/api/user.api";
import { transactionApi } from "@/lib/api/transaction.api";
import { useAppSelector } from "@/lib/store/hooks";
import { selectUser } from "@/lib/store/authSlice";
import type {
    BuyStockFormValues,
    TransactionMetadata,
    TransactionType,
} from "@/lib/types/transactions";
import { BuyOrderForm } from "@/components/trade/BuyOrderForm";
import { TransactionSummaryCard } from "@/components/trade/TransactionSummaryCard";
import { TransactionGuideCard } from "@/components/trade/TransactionGuideCard";

const INITIAL_FORM_VALUES: BuyStockFormValues = {
    stock_code: "",
    stock_name: "",
    quantity: 0,
    price_per_unit: 0,
    transaction_type: "BUY",
    notes: "",
};

const validationSchema = Yup.object({
    stock_code: Yup.string()
        .trim()
        .min(1, "Mã cổ phiếu không hợp lệ")
        .max(10, "Tối đa 10 ký tự")
        .required("Vui lòng nhập mã cổ phiếu"),
    stock_name: Yup.string().trim().min(2, "Tên quá ngắn").required("Vui lòng nhập tên cổ phiếu"),
    quantity: Yup.number()
        .typeError("Số lượng phải là số")
        .integer("Số lượng phải là số nguyên")
        .min(1, "Ít nhất 1 cổ phiếu")
        .required("Vui lòng nhập số lượng"),
    price_per_unit: Yup.number()
        .typeError("Giá phải là số")
        .min(0, "Giá không được âm")
        .required("Vui lòng nhập giá"),
    transaction_type: Yup.mixed<TransactionType>().oneOf(["BUY", "SELL"]).required(),
    notes: Yup.string().max(300, "Tối đa 300 ký tự"),
});

export default function TradePage() {
    const reduxUser = useAppSelector(selectUser);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [lastTransaction, setLastTransaction] = useState<TransactionMetadata | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoadingProfile(true);
                const data = await userApi.getProfile();
                setProfile(data);
                setProfileError(null);
            } catch (error) {
                const message = error instanceof Error ? error.message : "Không thể tải thông tin người dùng.";
                setProfileError(message);
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchProfile();
    }, []);

    const userId = reduxUser?._id || profile?._id;

    const formik = useFormik<BuyStockFormValues>({
        initialValues: INITIAL_FORM_VALUES,
        validationSchema,
        onSubmit: async (values, helpers) => {
            if (!userId) {
                setSubmitError("Vui lòng đăng nhập để giao dịch.");
                return;
            }

            try {
                setSubmitError(null);
                setSuccessMessage(null);
                const payload = {
                    ...values,
                    userId,
                };

                const response = await transactionApi.createTransaction(payload);
                setLastTransaction(response.transaction);
                setSuccessMessage(response.message);

                if (profile) {
                    setProfile({
                        ...profile,
                        balance: response.transaction.balance_after,
                    });
                }

                helpers.resetForm({
                    values: {
                        ...values,
                        quantity: 0,
                        notes: "",
                    },
                });
            } catch (error) {
                const message = error instanceof Error ? error.message : "Không thể tạo giao dịch.";
                setSubmitError(message);
            }
        },
    });

    const { quantity, price_per_unit, transaction_type } = formik.values;
    const availableBalance = profile?.balance;
    const totalCost = quantity > 0 && price_per_unit > 0 ? quantity * price_per_unit : 0;
    const isBalanceInsufficient =
        transaction_type === "BUY" &&
        typeof availableBalance === "number" &&
        totalCost > availableBalance;

    const maxBuyQuantity = useMemo(() => {
        if (transaction_type !== "BUY" || !profile?.balance) return undefined;
        if (price_per_unit <= 0) return 0;
        return Math.max(Math.floor(profile.balance / price_per_unit), 0);
    }, [transaction_type, profile?.balance, price_per_unit]);

    if (loadingProfile) {
        return (
            <div className="flex h-full items-center justify-center py-20">
                <LoadingSpinner />
            </div>
        );
    }

    const formattedBalance =
        typeof profile?.balance === "number"
            ? profile.balance.toLocaleString("vi-VN", { maximumFractionDigits: 0 })
            : "--";

    return (
        <div className="space-y-6 pb-8">
            {/* Header styled similar to Market page */}
            <div className="bg-primary rounded-2xl shadow-xl p-8 text-white">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Giao dịch cổ phiếu</h1>
                        <p className="text-primary-foreground/80 text-lg">
                            Đặt lệnh mua / bán cổ phiếu
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-white/10 backdrop-blur-sm px-6 py-4 text-center border border-white/20">
                            <p className="text-sm text-primary-foreground/80">Số dư khả dụng</p>
                            <p className="text-2xl font-semibold text-white">{formattedBalance} VND</p>
                        </div>
                    </div>
                </div>
            </div>

            {profileError && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {profileError}
                </div>
            )}

            {submitError && (
                <div className="rounded-lg border border-error bg-error-light px-4 py-3 text-sm text-error">
                    {submitError}
                </div>
            )}

            {successMessage && (
                <div className="rounded-lg border border-success bg-success-light px-4 py-3 text-sm text-success">
                    {successMessage}
                </div>
            )}

            <form onSubmit={formik.handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <Card className="border border-gray-100 shadow-sm">
                        <CardContent className="p-6">
                            <BuyOrderForm
                                formik={formik}
                                maxBuyQuantity={maxBuyQuantity}
                                onUseMaxQuantity={() => {
                                    if (maxBuyQuantity !== undefined) {
                                        formik.setFieldValue("quantity", maxBuyQuantity);
                                    }
                                }}
                                availableBalance={availableBalance}
                                disableSubmit={formik.isSubmitting || isBalanceInsufficient}
                            />
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <TransactionSummaryCard
                            quantity={quantity}
                            pricePerUnit={price_per_unit}
                            balance={availableBalance}
                            transactionType={transaction_type}
                            isSubmitting={formik.isSubmitting}
                            lastTransaction={lastTransaction}
                        />
                        {/* <TransactionGuideCard /> */}
                    </div>
                </div>
            </form>
        </div>
    );
}

