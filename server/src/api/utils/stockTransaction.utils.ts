/**
 * Tính tổng giá trị giao dịch
 */
export const calculateTotalAmount = (quantity: number, pricePerUnit: number): number => {
    return quantity * pricePerUnit;
};

/**
 * Tính số dư sau giao dịch (BUY)
 */
export const calculateBalanceAfterBuy = (
    balanceBefore: number,
    totalAmount: number
): number => {
    return balanceBefore - totalAmount;
};

/**
 * Tính số dư sau giao dịch (SELL)
 */
export const calculateBalanceAfterSell = (
    balanceBefore: number,
    totalAmount: number
): number => {
    return balanceBefore + totalAmount;
};

/**
 * Kiểm tra xem user có đủ số dư để mua hay không
 */
export const canAffordBuy = (
    balance: number,
    totalAmount: number
): boolean => {
    return balance >= totalAmount;
};

/**
 * Tính giá trị cổ phiếu đang nắm giữ
 */
export const calculateHoldingValue = (quantity: number, currentPrice: number): number => {
    return quantity * currentPrice;
};

/**
 * Tính lợi nhuận/lỗ từ giao dịch
 */
export const calculateProfitLoss = (
    buyPrice: number,
    sellPrice: number,
    quantity: number
): {
    profitLoss: number;
    profitLossPercentage: number;
    netProfit: number;
} => {
    const grossProfit = (sellPrice - buyPrice) * quantity;
    const netProfit = grossProfit;
    const profitLossPercentage = (netProfit / (buyPrice * quantity)) * 100;

    return {
        profitLoss: grossProfit,
        profitLossPercentage,
        netProfit
    };
};

/**
 * Tính giá trung bình (average cost)
 */
export const calculateAverageCost = (
    totalCost: number,
    totalQuantity: number
): number => {
    if (totalQuantity === 0) return 0;
    return totalCost / totalQuantity;
};

/**
 * Format tiền tệ VND
 */
export const formatVND = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

/**
 * Tính ROI (Return on Investment)
 */
export const calculateROI = (initialInvestment: number, currentValue: number): number => {
    if (initialInvestment === 0) return 0;
    return ((currentValue - initialInvestment) / initialInvestment) * 100;
};

/**
 * Validate transaction data
 */
export const validateTransactionData = (data: {
    transaction_type: string;
    stock_code: string;
    stock_name: string;
    quantity: number;
    price_per_unit: number;
    balance_before: number;
}): {
    isValid: boolean;
    errors: string[];
} => {
    const errors: string[] = [];

    if (!['BUY', 'SELL'].includes(data.transaction_type)) {
        errors.push('Invalid transaction type. Must be BUY or SELL.');
    }

    if (!data.stock_code || data.stock_code.trim() === '') {
        errors.push('Stock code is required.');
    }

    if (!data.stock_name || data.stock_name.trim() === '') {
        errors.push('Stock name is required.');
    }

    if (!Number.isInteger(data.quantity) || data.quantity <= 0) {
        errors.push('Quantity must be a positive integer.');
    }

    if (data.price_per_unit <= 0) {
        errors.push('Price per unit must be greater than 0.');
    }

    if (data.balance_before < 0) {
        errors.push('Balance before cannot be negative.');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Get transaction summary
 */
export const getTransactionSummary = (transactions: any[]): {
    totalBuyTransactions: number;
    totalSellTransactions: number;
    totalBuyAmount: number;
    totalSellAmount: number;
    totalBuyQuantity: number;
    totalSellQuantity: number;
    netCashFlow: number;
} => {
    return {
        totalBuyTransactions: transactions.filter(t => t.transaction_type === 'BUY').length,
        totalSellTransactions: transactions.filter(t => t.transaction_type === 'SELL').length,
        totalBuyAmount: transactions
            .filter(t => t.transaction_type === 'BUY')
            .reduce((sum, t) => sum + t.total_amount, 0),
        totalSellAmount: transactions
            .filter(t => t.transaction_type === 'SELL')
            .reduce((sum, t) => sum + t.total_amount, 0),
        totalBuyQuantity: transactions
            .filter(t => t.transaction_type === 'BUY')
            .reduce((sum, t) => sum + t.quantity, 0),
        totalSellQuantity: transactions
            .filter(t => t.transaction_type === 'SELL')
            .reduce((sum, t) => sum + t.quantity, 0),
        netCashFlow: transactions
            .filter(t => t.transaction_type === 'SELL')
            .reduce((sum, t) => sum + t.total_amount, 0) -
            transactions
                .filter(t => t.transaction_type === 'BUY')
                .reduce((sum, t) => sum + t.total_amount, 0)
    };
};

