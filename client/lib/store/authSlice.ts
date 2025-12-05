import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi, type AuthResponse } from '../api/auth.api';
import { userApi, type UserProfile } from '../api/user.api';

// Types
export interface User {
    _id: string;
    email: string;
    user_fullName: string;
    user_avatar: string;
    user_role: string;
    balance: number;
    user_gender: boolean;
    user_status: string; // "ACTIVE" | "INACTIVE" | "BLOCKED"
    user_dayOfBirth?: string;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const buildUserFromProfile = (profile: UserProfile): User => ({
    _id: profile._id,
    email: profile.email,
    user_fullName: profile.user_fullName,
    user_avatar: profile.user_avatar,
    user_role: profile.user_role,
    balance: profile.balance ?? 0,
    user_gender: profile.user_gender,
    user_status: profile.user_status,
    user_dayOfBirth: profile.user_dayOfBirth
});

const buildUserFromAuthResponse = (
    authUser: AuthResponse['user'],
    profile?: UserProfile | null
): User => {
    if (profile) {
        return buildUserFromProfile(profile);
    }

    return {
        _id: authUser._id,
        email: authUser.email,
        user_fullName: authUser.user_fullName,
        user_avatar: authUser.user_avatar,
        user_role: authUser.user_role,
        balance: authUser.balance ?? 0,
        user_gender: authUser.user_gender,
        user_status: authUser.user_status,
        user_dayOfBirth: authUser.user_dayOfBirth
    };
};

const fetchProfileSafely = async (accessToken?: string) => {
    if (!accessToken) return null;

    try {
        return await userApi.getProfile(accessToken);
    } catch (error) {
        console.warn('Không thể đồng bộ profile sau khi đăng nhập:', error);
        return null;
    }
};

// Initial state - Redux Persist will handle rehydration
const initialState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
};

// Async thunks
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            console.log('Login credentials:', credentials);
            const response = await authApi.login(credentials);
            console.log('Login response:', response);

            // Save tokens to localStorage for direct access
            if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', response.token.accessToken);
                localStorage.setItem('refreshToken', response.token.refreshToken);
            }

            const profile = await fetchProfileSafely(response.token.accessToken);
            return {
                ...response,
                user: buildUserFromAuthResponse(response.user, profile)
            };
        } catch (error: unknown) {
            console.error('Login error:', error);

            // Extract error message from API response
            let errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.';

            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as {
                    response?: { data?: { message?: string; error?: string } };
                };
                errorMessage =
                    axiosError.response?.data?.message ||
                    axiosError.response?.data?.error ||
                    errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            return rejectWithValue(errorMessage);
        }
    }
);

export const signUpUser = createAsyncThunk(
    'auth/signUp',
    async (
        data: { user_fullName: string; email: string; password: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await authApi.signUp(data);

            // Save tokens to localStorage for direct access
            if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', response.token.accessToken);
                localStorage.setItem('refreshToken', response.token.refreshToken);
            }

            const profile = await fetchProfileSafely(response.token.accessToken);
            return {
                ...response,
                user: buildUserFromAuthResponse(response.user, profile)
            };
        } catch (error: unknown) {
            console.error('Sign up error:', error);

            // Extract error message from API response
            let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';

            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as {
                    response?: { data?: { message?: string; error?: string } };
                };
                errorMessage =
                    axiosError.response?.data?.message ||
                    axiosError.response?.data?.error ||
                    errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            return rejectWithValue(errorMessage);
        }
    }
);

export const loginAsGuest = createAsyncThunk(
    'auth/loginAsGuest',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authApi.loginAsGuest();

            // Save tokens to localStorage for direct access
            if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', response.token.accessToken);
                localStorage.setItem('refreshToken', response.token.refreshToken);
            }

            return response;
        } catch (error: unknown) {
            console.error('Guest login error:', error);

            let errorMessage = 'Đăng nhập khách thất bại. Vui lòng thử lại.';

            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as {
                    response?: { data?: { message?: string; error?: string } };
                };
                errorMessage =
                    axiosError.response?.data?.message ||
                    axiosError.response?.data?.error ||
                    errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            return rejectWithValue(errorMessage);
        }
    }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
    try {
        await authApi.logout();
    } catch (error) {
        // Continue with logout even if API call fails
        console.error('Logout API error:', error);
    }

    // Remove tokens from localStorage
    if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }

    return;
});

export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const profile = await userApi.getProfile();
            return buildUserFromProfile(profile);
        } catch (error: unknown) {
            console.error('Get current user error:', error);

            // Extract error message from API response
            let errorMessage = 'Không thể lấy thông tin người dùng.';

            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as {
                    response?: { data?: { message?: string; error?: string } };
                };
                errorMessage =
                    axiosError.response?.data?.message ||
                    axiosError.response?.data?.error ||
                    errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            return rejectWithValue(errorMessage);
        }
    }
);

// Auth slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        setTokens: (
            state,
            action: PayloadAction<{ accessToken: string; refreshToken: string }>
        ) => {
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
        },
        clearAuth: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.token.accessToken;
                state.refreshToken = action.payload.token.refreshToken;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Sign up
        builder
            .addCase(signUpUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signUpUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.token.accessToken;
                state.refreshToken = action.payload.token.refreshToken;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(signUpUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Login as Guest
        builder
            .addCase(loginAsGuest.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginAsGuest.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.token.accessToken;
                state.refreshToken = action.payload.token.refreshToken;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginAsGuest.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Logout
        builder
            .addCase(logoutUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state) => {
                // Clear state even if API call fails
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                state.isLoading = false;
            });

        // Get current user
        builder
            .addCase(getCurrentUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                // Don't clear auth on error - token might still be valid
            });
    }
});

// Actions
export const { setUser, setTokens, clearAuth, clearError } = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectError = (state: { auth: AuthState }) => state.auth.error;

// Reducer
export default authSlice.reducer;
