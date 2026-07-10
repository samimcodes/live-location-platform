"use client";

import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

export default function SocialLogin() {
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch('/api/auth/social-login/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (data.success) {
        console.log('Google login success:', data);
        // Handle successful login (e.g., store token, redirect)
        // localStorage.setItem('token', data.data.token);
      } else {
        console.error('Google login failed:', data.error);
      }
    } catch (err) {
      console.error('Error during Google login', err);
    }
  };

  const handleFacebookResponse = async (response: any) => {
    if (response.accessToken) {
      try {
        const res = await fetch('/api/auth/social-login/facebook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: response.accessToken }),
        });
        const data = await res.json();
        if (data.success) {
          console.log('Facebook login success:', data);
          // Handle successful login (e.g., store token, redirect)
          // localStorage.setItem('token', data.data.token);
        } else {
          console.error('Facebook login failed:', data.error);
        }
      } catch (err) {
        console.error('Error during Facebook login', err);
      }
    } else {
      console.error('Facebook login failed: No access token');
    }
  };

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '';

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.error('Google Login Failed');
              }}
              useOneTap
            />
          </div>
        </GoogleOAuthProvider>
      ) : (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md text-center">
          Configure NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google Login
        </div>
      )}

      {facebookAppId ? (
        <FacebookLogin
          appId={facebookAppId}
          autoLoad={false}
          fields="name,email,picture"
          callback={handleFacebookResponse}
          render={(renderProps: any) => (
            <button
              onClick={renderProps.onClick}
              className="w-full flex items-center justify-center gap-2 bg-[#1877F2] text-white p-2 rounded-md hover:bg-[#166FE5] transition-colors shadow-sm font-medium h-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
              Log in with Facebook
            </button>
          )}
        />
      ) : (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md text-center">
          Configure NEXT_PUBLIC_FACEBOOK_APP_ID to enable Facebook Login
        </div>
      )}
    </div>
  );
}
