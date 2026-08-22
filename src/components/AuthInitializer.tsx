'use client';

import { useEffect, useRef } from 'react';
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
 *
 * React 18 StrictMode guard:
 *  In development, React intentionally mounts → unmounts → remounts every
 *  component to surface side-effect bugs. Without a guard this would fire
 *  two concurrent GET /auth/me requests, burning 2 slots from the
 *  authReadLimiter bucket on every dev-mode page load.
 *  The `inflightRef` ensures only one request runs at a time; the cleanup
 *  function cancels the in-flight call if the component unmounts before it
 *  resolves (the second StrictMode mount then starts a fresh request).
 */
export function AuthInitializer() {
  const dispatch    = useAppDispatch();
  const inflightRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate concurrent calls (React 18 StrictMode double-invoke)
    if (inflightRef.current) return;
    inflightRef.current = true;

    let cancelled = false;

    const init = async () => {
      dispatch(setLoading(true));
      try {
        const { data } = await api.get('/auth/me');

        if (cancelled) return;

        if (data.success && data.data) {
          const token = localStorage.getItem('token') ?? '';
          dispatch(setCredentials({ user: data.data, token }));
        } else {
          dispatch(clearAuth());
        }
      } catch {
        if (!cancelled) dispatch(clearAuth());
      } finally {
        inflightRef.current = false;
      }
    };

    init();

    return () => {
      // Signal the async callback to discard its result if the component
      // unmounts mid-flight (StrictMode cleanup between mount cycles).
      cancelled = true;
      inflightRef.current = false;
    };
  }, [dispatch]);

  return null;
}
