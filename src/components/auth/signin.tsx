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
import { Eye, EyeOff, Mail, Lock, Navigation, ArrowRight, Check, CheckCircle2, Zap, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { soundFx } from '@/lib/soundFx';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
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
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const emailValue = watch('email') || '';
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

  const fillDemo = (email: string, pass: string) => {
    soundFx?.playChime?.();
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    toast.success('Demo credentials loaded!', { description: `Filled ${email}` });
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    soundFx?.playPop?.();
    try {
      await login(data.email, data.password);
      soundFx?.playChime?.();
      toast.success('Welcome back!', { description: 'Redirecting to your live dashboard…' });
      router.push('/dashboard');
    } catch (err: unknown) {
      soundFx?.playAlert?.();
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? (err instanceof Error ? err.message : 'Sign in failed. Please verify credentials.');
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 w-full text-left"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── 1-Click Quick Demo Login Pills ── */}
      <div className="flex items-center justify-between gap-1.5 p-1.5 rounded-xl bg-violet-50/80 dark:bg-violet-950/30 border border-violet-200/80 dark:border-violet-500/30">
        <span className="text-[10px] font-mono font-bold text-violet-700 dark:text-violet-300 uppercase pl-1 shrink-0 flex items-center gap-1">
          <Zap size={10} className="text-amber-500" />
          <span>Quick:</span>
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => fillDemo('admin@localink.com', 'admin123')}
            className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white dark:bg-[#121B33] text-violet-700 dark:text-violet-300 border border-violet-300/80 dark:border-violet-500/40 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
          >
            ⚡ Demo Admin
          </button>
          <button
            type="button"
            onClick={() => fillDemo('family@localink.com', 'user123')}
            className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white dark:bg-[#121B33] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
          >
            👤 Demo Member
          </button>
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-1">
        <Label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Email address
        </Label>
        <div className="relative">
          <Mail
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
          />
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            {...register('email')}
            aria-invalid={!!errors.email}
            className="h-10.5 pl-10 pr-9 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/90 dark:bg-[#121B33] focus-visible:ring-2 focus-visible:ring-violet-500 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-2xs"
          />
          {isEmailValid && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none animate-in fade-in zoom-in-75 duration-200">
              <CheckCircle2 size={15} />
            </div>
          )}
        </div>
        {errors.email && (
          <p className="text-xs text-rose-500 font-medium mt-0.5">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Password
          </Label>
          <Link
            href="/forgot-password"
            className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
          />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            {...register('password')}
            aria-invalid={!!errors.password}
            className="h-10.5 pl-10 pr-11 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/90 dark:bg-[#121B33] focus-visible:ring-2 focus-visible:ring-violet-500 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-2xs"
          />
          <button
            type="button"
            onClick={() => {
              soundFx?.playPop?.();
              setShowPassword(!showPassword);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-rose-500 font-medium mt-0.5">{errors.password.message}</p>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center gap-2 py-0.5">
        <div
          onClick={() => {
            soundFx?.playPop?.();
            setRememberMe(!rememberMe);
          }}
          className={`h-4 w-4 rounded-md border flex items-center justify-center cursor-pointer transition-all shrink-0 ${
            rememberMe
              ? 'bg-violet-600 border-violet-600 text-white'
              : 'bg-white dark:bg-[#121B33] border-slate-300 dark:border-slate-700'
          }`}
        >
          {rememberMe && <Check size={11} strokeWidth={3} />}
        </div>
        <Label
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none"
          onClick={() => {
            soundFx?.playPop?.();
            setRememberMe(!rememberMe);
          }}
        >
          Remember my session
        </Label>
      </div>

      {/* Sign In Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 rounded-xl text-white text-sm font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/25 hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 border border-white/20"
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <span>Signing in…</span>
          </>
        ) : (
          <>
            <Navigation size={14} className="text-white" style={{ transform: 'rotate(-30deg)' }} />
            <span>Sign In to LocaLink</span>
            <ArrowRight size={14} />
          </>
        )}
      </Button>

      {/* Divider */}
      <div className="relative flex items-center py-1">
        <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
        <span className="mx-3 text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 uppercase">
          or continue with
        </span>
        <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => toast.info('Google sign-in available on production domain.')}
          className="flex items-center justify-center gap-2 h-10 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#121B33] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Google</span>
        </button>

        <button
          type="button"
          onClick={() => toast.info('Facebook sign-in available on production domain.')}
          className="flex items-center justify-center gap-2 h-10 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#121B33] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
        >
          <svg className="h-4 w-4 shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span>Facebook</span>
        </button>
      </div>

      {/* Register Link */}
      <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1 font-medium">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-violet-600 dark:text-violet-400 hover:underline font-bold inline-flex items-center gap-0.5">
          <span>Create one free</span>
          <ArrowRight size={12} />
        </Link>
      </p>
    </motion.form>
  );
}
