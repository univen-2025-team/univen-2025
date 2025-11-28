import axiosInstance from '../axios';
import type {
  CreateTransactionPayload,
  CreateTransactionResponse,
  TransactionHistoryParams,
  TransactionHistoryResponse,
  TransactionMetadata,
  TransactionStatsResponse,
} from '../types/transactions';

const extractErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
    return (
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      'Thao tác thất bại. Vui lòng thử lại.'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Có lỗi xảy ra. Vui lòng thử lại.';
};

export const transactionApi = {
  async createTransaction(payload: CreateTransactionPayload): Promise<CreateTransactionResponse> {
    try {
      const response = await axiosInstance.post('/stock-transactions/transactions', payload);

      return {
        message: response.data.message,
        transaction: response.data.metadata as TransactionMetadata,
      };
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async getTransactionHistory(
    userId: string,
    params?: TransactionHistoryParams,
  ): Promise<TransactionHistoryResponse> {
    try {
      const response = await axiosInstance.get(`/stock-transactions/transactions/${userId}`, {
        params: {
          transaction_type: params?.filters?.transaction_type,
          stock_code: params?.filters?.stock_code,
          status: params?.filters?.status,
          page: params?.pagination?.page,
          limit: params?.pagination?.limit,
        },
      });

      return response.data.metadata as TransactionHistoryResponse;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async getUserTransactionStats(userId: string): Promise<TransactionStatsResponse> {
    try {
      const response = await axiosInstance.get(`/stock-transactions/transactions/${userId}/stats`);
      return response.data.metadata as TransactionStatsResponse;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
};

