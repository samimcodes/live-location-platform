import { useAppSelector, useAppDispatch } from '@/store/store';
import { setCredentials, clearAuth } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { toast } from '@/lib/toast';
import { useLocationStore } from '@/store/useLocationStore';

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading } = useAppSelector((s) => s.auth);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) {
      const { user: u, token: t } = data.data as { user: typeof user; token: string };
      if (t) localStorage.setItem('token', t);
      dispatch(setCredentials({ user: u!, token: t }));
      useLocationStore.getState().setSharing(Boolean(u?.sharingLocation));
      return data.data;
    }
    throw new Error(data.message || 'Login failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // silently fail
    }
    localStorage.removeItem('token');
    dispatch(clearAuth());
    router.push('/login');
    toast.success('Logged out successfully');
  };

  return { user, token, isAuthenticated, isLoading, login, logout };
}
