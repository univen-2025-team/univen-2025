import axiosInstance from '../axios';
import { userApi } from './user.api';

// Response types
export interface AuthResponse {
    token: {
        accessToken: string;
        refreshToken: string;
    };
    user: {
        _id: string;
        email: string;
        user_fullName: string;
        user_avatar: string;
        user_role: string;
        balance: number;
        user_gender: boolean;
        user_status: string; // "ACTIVE" | "INACTIVE" | "BLOCKED"
        user_dayOfBirth?: string;
    };
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignUpRequest {
    user_fullName: string;
    email: string;
    password: string;
}

export interface NewTokenResponse {
    accessToken: string;
    refreshToken: string;
}

/**
 * API Auth Service
 */
export const authApi = {
    /**
     * Đăng nhập
     */
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await axiosInstance.post('/auth/login', data);
        return response.data.metadata;
    },

    /**
     * Đăng ký
     */
    signUp: async (data: SignUpRequest): Promise<AuthResponse> => {
        const response = await axiosInstance.post('/auth/sign-up', data);
        return response.data.metadata;
    },

    /**
     * Đăng xuất
     */
    logout: async (): Promise<void> => {
        await axiosInstance.post('/auth/logout');
    },

    /**
     * Refresh token
     */
    newToken: async (refreshToken: string): Promise<NewTokenResponse> => {
        const response = await axiosInstance.post('/auth/new-token', {
            refreshToken
        });
        return response.data.metadata;
    },

    /**
     * Quên mật khẩu
     */
    forgotPassword: async (email: string): Promise<{ message: string }> => {
        const response = await axiosInstance.post('/auth/forgot-password', { email });
        return response.data;
    },

    /**
     * Reset mật khẩu
     */
    resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
        const response = await axiosInstance.post('/auth/reset-password', {
            token,
            newPassword
        });
        return response.data;
    },

    /**
     * Lấy thông tin user hiện tại
     */
    getCurrentUser: async (): Promise<AuthResponse['user']> => {
        const profile = await userApi.getProfile();
        return {
            _id: profile._id,
            email: profile.email,
            user_fullName: profile.user_fullName,
            user_avatar: profile.user_avatar,
            user_role: profile.user_role,
            balance: profile.balance,
            user_gender: profile.user_gender,
            user_status: profile.user_status,
            user_dayOfBirth: profile.user_dayOfBirth
        };
    },

    /**
     * Đăng nhập bằng Google
     */
    loginWithGoogle: async (token: string): Promise<AuthResponse> => {
        const response = await axiosInstance.post('/auth/google', { token });
        return response.data.metadata;
    },

    /**
     * Đăng nhập với tư cách khách
     */
    loginAsGuest: async (): Promise<AuthResponse> => {
        const response = await axiosInstance.post('/auth/login/guest');
        return response.data.metadata;
    }
};
