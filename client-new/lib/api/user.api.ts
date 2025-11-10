import axiosInstance from '../axios';

// User profile response type
export interface UserProfile {
  _id: string;
  email: string;
  user_avatar: string;
  user_fullName: string;
  user_gender: boolean;
  user_role: string;
  user_status: string; // "ACTIVE" | "INACTIVE" | "BLOCKED"
  role_name: string;
  user_dayOfBirth?: string;
}

export interface UserProfileResponse {
  statusCode: number;
  name: string;
  message: string;
  metadata: {
    user: UserProfile;
  };
}

/**
 * API User Service
 */
export const userApi = {
  /**
   * Get user profile
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await axiosInstance.get('/user/profile');
    return response.data.metadata.user;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await axiosInstance.patch('/user/profile', data);
    return response.data.metadata.user;
  },
};
