export interface StockHolding {
    stock_code: string;
    stock_name: string;
    quantity: number;
    avg_buy_price: number;
    current_price: number;
    total_invested: number;
    current_value: number;
    profit_loss: number;
    profit_loss_percent: number;
}

export interface PortfolioStats {
    totalInvested: number;
    currentValue: number;
    totalProfit: number;
    totalProfitPercent: number;
}
