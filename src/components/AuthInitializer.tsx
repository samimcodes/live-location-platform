'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/store';
import { setCredentials, clearAuth, setLoading } from '@/store/slices/authSlice';
import api from '@/lib/axios';

/**
 * Runs once on app mount — fetches /auth/me and hydrates Redux auth state.
 * Placed inside RootLayout so it runs on every page.
 */
export function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch(clearAuth());
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        if (data.success && data.data) {
          dispatch(setCredentials({ user: data.data, token }));
        } else {
          dispatch(clearAuth());
        }
      } catch {
        dispatch(clearAuth());
      }
    };
    init();
  }, [dispatch]);

  return null;
}
