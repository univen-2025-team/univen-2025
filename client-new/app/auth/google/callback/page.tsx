'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/lib/store/hooks';
import { setUser, setTokens } from '@/lib/store/authSlice';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Get token and user objects from query params
        const tokenStr = searchParams.get('token');
        const userStr = searchParams.get('user');

        console.log('Raw params:', { tokenStr, userStr });

        if (!tokenStr || !userStr) {
          throw new Error('Missing authentication data from server');
        }

        // Parse the JSON objects (they are URL encoded by the backend)
        const token = JSON.parse(decodeURIComponent(tokenStr));
        const user = JSON.parse(decodeURIComponent(userStr));

        console.log('Parsed data:', { token, user });

        if (!token.accessToken || !token.refreshToken) {
          throw new Error('Invalid token data');
        }

        // Save to Redux store (Redux Persist will save to localStorage)
        dispatch(setTokens({ 
          accessToken: token.accessToken, 
          refreshToken: token.refreshToken 
        }));
        dispatch(setUser(user));

        console.log('Auth data saved to Redux store');

        // Redirect to dashboard
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } catch (err) {
        console.error('Google OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setIsProcessing(false);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    };

    processAuth();
  }, [searchParams, dispatch, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg
                className="h-10 w-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            {/* Error Message */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>

            {/* Debug Info (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-100 rounded-lg p-3 mb-4 text-left">
                <p className="text-xs text-gray-700 font-mono break-all">
                  <strong>Debug Info:</strong><br />
                  token: {searchParams.get('token') ? 'Present' : 'Missing'}<br />
                  user: {searchParams.get('user') ? 'Present' : 'Missing'}
                </p>
              </div>
            )}

            {/* Redirect Message */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                Redirecting to login page in 3 seconds...
              </p>
            </div>

            {/* Manual Redirect Button */}
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            {/* Google Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 animate-pulse">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </div>

            {/* Loading Message */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Completing Sign In
            </h2>
            <p className="text-gray-600 mb-6">
              Please wait while we authenticate with Google...
            </p>

            {/* Loading Spinner */}
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>

            {/* Success Check Animation */}
            <div className="mt-6">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Verifying credentials</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
