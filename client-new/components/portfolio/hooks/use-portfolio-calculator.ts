import { useCallback } from 'react';
import { transactionApi } from '@/lib/api/transaction.api';
import type { StockHolding, PortfolioStats } from '../types';

export function usePortfolioCalculator() {
    const calculatePortfolio = useCallback(
        async (
            userId: string
        ): Promise<{ holdings: StockHolding[]; stats: PortfolioStats }> => {
            // Fetch all completed transactions
            const response = await transactionApi.getTransactionHistory(userId, {
                filters: {
                    status: 'COMPLETED',
                },
                pagination: {
                    page: 1,
                    limit: 1000, // Get all transactions
                },
            });

            // Calculate holdings by stock code
            const stockMap = new Map<
                string,
                {
                    stock_name: string;
                    quantity: number;
                    total_buy: number;
                    total_sell: number;
                    buy_count: number;
                }
            >();

            response.transactions.forEach((transaction) => {
                const { stock_code, stock_name, quantity, price_per_unit, transaction_type } =
                    transaction;

                if (!stockMap.has(stock_code)) {
                    stockMap.set(stock_code, {
                        stock_name,
                        quantity: 0,
                        total_buy: 0,
                        total_sell: 0,
                        buy_count: 0,
                    });
                }

                const stock = stockMap.get(stock_code)!;

                if (transaction_type === 'BUY') {
                    stock.quantity += quantity;
                    stock.total_buy += quantity * price_per_unit;
                    stock.buy_count += 1;
                } else if (transaction_type === 'SELL') {
                    stock.quantity -= quantity;
                    stock.total_sell += quantity * price_per_unit;
                }
            });

            // Convert to holdings array (only stocks with quantity > 0)
            const holdingsList: StockHolding[] = [];
            let totalInvested = 0;
            let currentValue = 0;

            for (const [stock_code, data] of stockMap.entries()) {
                if (data.quantity > 0) {
                    const avg_buy_price =
                        data.total_buy /
                        (data.quantity + (data.total_sell / data.total_buy) * data.quantity);
                    const total_invested = data.quantity * avg_buy_price;

                    // For now, use avg_buy_price as current_price (should fetch from market API)
                    const current_price = avg_buy_price * 1.05; // Simulate 5% gain for demo
                    const current_value = data.quantity * current_price;
                    const profit_loss = current_value - total_invested;
                    const profit_loss_percent = (profit_loss / total_invested) * 100;

                    holdingsList.push({
                        stock_code,
                        stock_name: data.stock_name,
                        quantity: data.quantity,
                        avg_buy_price,
                        current_price,
                        total_invested,
                        current_value,
                        profit_loss,
                        profit_loss_percent,
                    });

                    totalInvested += total_invested;
                    currentValue += current_value;
                }
            }

            const totalProfit = currentValue - totalInvested;
            const totalProfitPercent =
                totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

            return {
                holdings: holdingsList,
                stats: {
                    totalInvested,
                    currentValue,
                    totalProfit,
                    totalProfitPercent,
                },
            };
        },
        []
    );

    return { calculatePortfolio };
}
