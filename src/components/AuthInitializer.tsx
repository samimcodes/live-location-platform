'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/store';
import { setCredentials, clearAuth, setLoading } from '@/store/slices/authSlice';
import api from '@/lib/axios';

/**
 * AuthInitializer
 * ---------------
 * Runs once on app mount — calls GET /auth/me to hydrate Redux auth state.
 *
 * Token strategy (dual storage):
 *  - Server sets an httpOnly `accessToken` cookie on login (used by the
 *    Next.js proxy middleware for route protection).
 *  - Client also writes the token to `localStorage` (used by Axios
 *    interceptor and Socket.IO auth header).
 *
 * On page refresh:
 *  1. Try localStorage token first (fastest, avoids an extra round-trip).
 *  2. If absent, still call /auth/me — the httpOnly cookie is sent
 *     automatically by the browser via `withCredentials: true` on the
 *     Axios instance, so the request will succeed if the cookie is valid.
 */
export function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const init = async () => {
      dispatch(setLoading(true));
      try {
        // /auth/me succeeds if either:
        //   a) Authorization header (from localStorage via Axios interceptor), OR
        //   b) accessToken cookie (sent automatically with withCredentials:true)
        const { data } = await api.get('/auth/me');

        if (data.success && data.data) {
          // Sync localStorage with whatever token Axios used
          const token = localStorage.getItem('token') ?? '';
          dispatch(setCredentials({ user: data.data, token }));
        } else {
          dispatch(clearAuth());
        }
      } catch {
        // 401 means no valid session — clear auth cleanly
        dispatch(clearAuth());
      }
    };

    init();
  }, [dispatch]);

  return null;
}
