import axiosInstance from '../axios';

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
    user_gender: boolean;
    user_status: string; // "ACTIVE" | "INACTIVE" | "BLOCKED"
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
    return axiosInstance.post('/auth/login', data);
  },

  /**
   * Đăng ký
   */
  signUp: async (data: SignUpRequest): Promise<AuthResponse> => {
    return axiosInstance.post('/auth/sign-up', data);
  },

  /**
   * Đăng xuất
   */
  logout: async (): Promise<void> => {
    return axiosInstance.post('/auth/logout');
  },

  /**
   * Refresh token
   */
  newToken: async (refreshToken: string): Promise<NewTokenResponse> => {
    return axiosInstance.post('/auth/new-token', {
      refreshToken,
    });
  },

  /**
   * Quên mật khẩu
   */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return axiosInstance.post('/auth/forgot-password', { email });
  },

  /**
   * Reset mật khẩu
   */
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    return axiosInstance.post('/auth/reset-password', {
      token,
      newPassword,
    });
  },

  /**
   * Lấy thông tin user hiện tại
   */
  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    return axiosInstance.get('/auth/me');
  },

  /**
   * Đăng nhập bằng Google
   */
  loginWithGoogle: async (token: string): Promise<AuthResponse> => {
    return axiosInstance.post('/auth/google', { token });
  },
};
