import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { selectUser, setUser, selectIsAuthenticated } from '@/lib/store/authSlice';
import { userApi, type UserProfile } from '@/lib/api/user.api';

interface UseProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage user profile data
 * Automatically syncs with Redux store
 */
export function useProfile(autoFetch: boolean = true): UseProfileReturn {
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  const [profile, setProfile] = useState<UserProfile | null>(reduxUser as UserProfile | null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    // Only fetch if authenticated
    if (!isAuthenticated) {
      setError('Not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await userApi.getProfile();
      setProfile(data);
      
      // Sync with Redux store
      dispatch(setUser({
        _id: data._id,
        email: data.email,
        user_fullName: data.user_fullName,
        user_avatar: data.user_avatar,
        user_role: data.user_role,
        user_gender: data.user_gender,
        user_status: data.user_status,
        user_dayOfBirth: data.user_dayOfBirth,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError(errorMessage);
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (autoFetch && isAuthenticated) {
      fetchProfile();
    }
  }, [autoFetch, isAuthenticated, fetchProfile]);

  // Update local state when Redux user changes
  useEffect(() => {
    if (reduxUser) {
      setProfile(reduxUser as UserProfile);
    }
  }, [reduxUser]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}

