'use client';

import React from 'react';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAppDispatch } from '@/store/store';
import { setCredentials } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import api from '@/lib/axios';
import { useLocationStore } from '@/store/useLocationStore';

interface SocialAuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
    bio?: string | null;
    role: string;
    isOnline: boolean;
    sharingLocation: boolean;
  };
  token: string;
}

export default function SocialLogin() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('Google login failed', { description: 'No credential returned.' });
      return;
    }
    try {
      const { data } = await api.post<{ success: boolean; data: SocialAuthResponse }>(
        '/auth/social-login/google',
        { credential: credentialResponse.credential }
      );
      if (data.success && data.data) {
        localStorage.setItem('token', data.data.token);
        dispatch(setCredentials({ user: data.data.user, token: data.data.token }));
        useLocationStore.getState().setSharing(Boolean(data.data.user.sharingLocation));
        toast.success('Signed in with Google!');
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Google sign-in failed';
      toast.error(msg);
    }
  };

  if (!googleClientId) {
    return (
      <p className="text-xs text-muted-foreground text-center">
        Set <code className="bg-muted px-1 rounded">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to enable social login.
      </p>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="w-full flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error('Google login failed')}
          useOneTap={false}
          width="100%"
        />
      </div>
    </GoogleOAuthProvider>
  );
}
