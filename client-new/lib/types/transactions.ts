export type TransactionType = 'BUY' | 'SELL';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

export interface CreateTransactionPayload {
    userId: string;
    stock_code: string;
    stock_name: string;
    quantity: number;
    price_per_unit: number;
    transaction_type: TransactionType;
    notes?: string;
}

export interface TransactionMetadata {
    transaction_id: string;
    stock_code: string;
    stock_name: string;
    quantity: number;
    price_per_unit: number;
    total_amount: number;
    transaction_type: TransactionType;
    balance_before: number;
    balance_after: number;
    executed_at: string;
}

export interface CreateTransactionResponse {
    message: string;
    transaction: TransactionMetadata;
}

export interface BuyStockFormValues {
    stock_code: string;
    stock_name: string;
    quantity: number;
    price_per_unit: number;
    transaction_type: TransactionType;
    notes: string;
}

export interface TransactionHistoryItem {
    _id: string;
    user_id: string;
    transaction_type: TransactionType;
    stock_code: string;
    stock_name: string;
    quantity: number;
    price_per_unit: number;
    total_amount: number;
    transaction_status: TransactionStatus;
    balance_before: number;
    balance_after?: number;
    notes?: string;
    executed_at?: string;
    cancelled_at?: string;
    cancellation_reason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface TransactionHistoryResponse {
    transactions: TransactionHistoryItem[];
    pagination: PaginationInfo;
}

export interface TransactionHistoryFilters {
    transaction_type?: TransactionType;
    stock_code?: string;
    status?: TransactionStatus;
}

export interface TransactionHistoryParams {
    filters?: TransactionHistoryFilters;
    pagination?: {
        page?: number;
        limit?: number;
    };
}

export interface TransactionStatsEntry {
    _id: TransactionType;
    count: number;
    total_amount: number;
    avg_price: number;
}

export interface TransactionStatsResponse {
    current_balance: number;
    transaction_stats: TransactionStatsEntry[];
}

export interface UserRankingItem {
    rank: number;
    user_fullName: string;
    total_profit: number;
}

export interface UserRankingPagination {
    current_page: number;
    limit: number;
    total_users: number;
    total_pages: number;
    offset: number;
}

export interface UserRankingResponse {
    ranking: UserRankingItem[];
    pagination: UserRankingPagination;
}

