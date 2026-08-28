'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Mail, Lock, Navigation, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const schema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!', { description: 'Redirecting to dashboard…' });
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? (err instanceof Error ? err.message : 'Sign in failed');
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Email Field */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-bold text-slate-700">
          Email address
        </Label>
        <div className="relative">
          <Mail
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <Input
            id="email"
            type="email"
            placeholder="samim@gmail.com"
            {...register('email')}
            aria-invalid={!!errors.email}
            className="h-12 pl-10 rounded-xl border-slate-200 bg-[#f0f4fd] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all shadow-none"
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-xs font-bold text-slate-700">
            Password
          </Label>
          <Link
            href="/forgot-password"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            {...register('password')}
            aria-invalid={!!errors.password}
            className="h-12 pl-10 pr-11 rounded-xl border-slate-200 bg-[#f0f4fd] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all shadow-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center gap-2.5 py-0.5">
        <div
          onClick={() => setRememberMe(!rememberMe)}
          className="h-4 w-4 rounded-[4px] border-2 flex items-center justify-center cursor-pointer transition-all shrink-0"
          style={{
            background: rememberMe ? '#6366f1' : 'white',
            borderColor: rememberMe ? '#6366f1' : '#d1d5db',
          }}
        >
          {rememberMe && (
            <svg viewBox="0 0 10 8" fill="none" className="w-2.5 h-2.5">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <Label
          className="text-xs font-semibold text-slate-600 cursor-pointer select-none"
          onClick={() => setRememberMe(!rememberMe)}
        >
          Remember me
        </Label>
      </div>

      {/* Sign In Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded-xl text-white text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer border-0"
        style={{
          background: 'linear-gradient(90deg, #5b5fc7 0%, #7c3aed 100%)',
          boxShadow: '0 6px 20px rgba(99,102,241,0.35)',
        }}
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            <Navigation size={15} className="text-white" style={{ transform: 'rotate(-30deg)' }} />
            Sign In to LocaLink
            <ArrowRight size={15} />
          </>
        )}
      </Button>

      {/* Divider */}
      <div className="relative flex items-center py-1">
        <div className="flex-1 border-t border-slate-200" />
        <span className="mx-4 text-[11px] font-medium text-slate-400">or continue with</span>
        <div className="flex-1 border-t border-slate-200" />
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => toast.info('Google sign-in coming soon!')}
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <button
          type="button"
          onClick={() => toast.info('Facebook sign-in coming soon!')}
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          <svg className="h-4 w-4 shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Continue with Facebook
        </button>
      </div>

      {/* Register Link */}
      <p className="text-center text-xs text-slate-500 pt-2 font-medium">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-indigo-600 hover:underline font-bold inline-flex items-center gap-0.5">
          Create one free <ArrowRight size={12} />
        </Link>
      </p>
    </motion.form>
  );
}
