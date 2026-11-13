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
import { Eye, EyeOff, Mail, Lock, ArrowRight, Check, CheckCircle2, Zap, ShieldAlert, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { soundFx } from '@/lib/soundFx';
import dynamic from 'next/dynamic';

const SocialLogin = dynamic(() => import('@/components/SocialLogin'), { ssr: false });

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

  const fillDemo = (email: string, pass: string, roleName: string) => {
    soundFx?.playChime?.();
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    toast.success(`${roleName} credentials loaded`, { description: email });
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    soundFx?.playPop?.();
    try {
      await login(data.email.trim().toLowerCase(), data.password);
      soundFx?.playChime?.();
      toast.success('Welcome back!', { description: 'Opening your dashboard…' });
      const params = new URLSearchParams(window.location.search);
      const from = params.get('from');
      const target = from && from.startsWith('/dashboard') ? from : '/dashboard';
      router.refresh();
      router.push(target);
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

  const hasGoogleAuth = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-3 text-left">
      {/* ── Frosted Glass Quick Demo Strip ── */}
      <div className="flex items-center justify-between rounded-xl border border-indigo-200/50 bg-indigo-50/50 px-2.5 py-1.5 backdrop-blur-xl dark:border-indigo-500/20 dark:bg-indigo-500/[0.08]">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-900 dark:text-indigo-200">
          <Zap className="h-3 w-3 text-amber-500 fill-amber-500/20" />
          <span>Quick Demo:</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => fillDemo('admin@localink.com', 'admin123', 'Demo Admin')}
            className="group flex cursor-pointer items-center gap-1 rounded-lg border border-white/70 bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-2xs backdrop-blur-md transition-all hover:bg-white hover:text-indigo-600 active:scale-95 dark:border-white/10 dark:bg-white/[0.08] dark:text-slate-200 dark:hover:bg-white/[0.15] dark:hover:text-white"
          >
            <Shield className="h-2.5 w-2.5 text-indigo-500 group-hover:scale-110 transition-transform" />
            <span>Admin</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemo('family@localink.com', 'user123', 'Demo Member')}
            className="group flex cursor-pointer items-center gap-1 rounded-lg border border-white/70 bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-2xs backdrop-blur-md transition-all hover:bg-white hover:text-indigo-600 active:scale-95 dark:border-white/10 dark:bg-white/[0.08] dark:text-slate-200 dark:hover:bg-white/[0.15] dark:hover:text-white"
          >
            <User className="h-2.5 w-2.5 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span>Member</span>
          </button>
        </div>
      </div>

      {/* ── Email Field ── */}
      <div className="space-y-1">
        <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          Email address
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
            {...register('email')}
            aria-invalid={!!errors.email}
            className="h-10 rounded-xl border border-slate-200/80 bg-white/75 pl-9 pr-9 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs backdrop-blur-md transition-all focus-visible:bg-white focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600/15 dark:border-white/10 dark:bg-slate-900/50 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:bg-slate-900/80 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/20"
          />
          {isEmailValid && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          )}
        </div>
        {errors.email && (
          <p className="flex items-center gap-1 text-[11px] font-medium text-rose-500 dark:text-rose-400">
            <ShieldAlert className="h-3 w-3" />
            <span>{errors.email.message}</span>
          </p>
        )}
      </div>

      {/* ── Password Field ── */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Password
          </Label>
          <Link
            href="/forgot-password"
            className="text-[11px] font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            autoComplete="current-password"
            {...register('password')}
            aria-invalid={!!errors.password}
            className="h-10 rounded-xl border border-slate-200/80 bg-white/75 pl-9 pr-9 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs backdrop-blur-md transition-all focus-visible:bg-white focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600/15 dark:border-white/10 dark:bg-slate-900/50 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:bg-slate-900/80 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/20"
          />
          <button
            type="button"
            onClick={() => {
              soundFx?.playPop?.();
              setShowPassword(!showPassword);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-white"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="flex items-center gap-1 text-[11px] font-medium text-rose-500 dark:text-rose-400">
            <ShieldAlert className="h-3 w-3" />
            <span>{errors.password.message}</span>
          </p>
        )}
      </div>

      {/* ── Remember Me Checkbox ── */}
      <div className="flex items-center gap-2 pt-0.5">
        <button
          type="button"
          role="checkbox"
          aria-checked={rememberMe}
          onClick={() => {
            soundFx?.playPop?.();
            setRememberMe(!rememberMe);
          }}
          className={`flex h-4 w-4 cursor-pointer items-center justify-center rounded-md border transition-all ${
            rememberMe
              ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xs dark:border-indigo-500 dark:bg-indigo-500'
              : 'border-slate-300 bg-white dark:border-white/20 dark:bg-white/[0.05]'
          }`}
        >
          {rememberMe && <Check className="h-2.5 w-2.5 stroke-[3]" />}
        </button>
        <span
          className="cursor-pointer select-none text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          onClick={() => {
            soundFx?.playPop?.();
            setRememberMe(!rememberMe);
          }}
        >
          Remember my session
        </span>
      </div>

      {/* ── Professional Primary Button ── */}
      <Button
        type="submit"
        disabled={isLoading}
        className="group relative flex h-10.5 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:opacity-75"
      >
        {isLoading ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span>Signing in…</span>
          </>
        ) : (
          <>
            <span>Sign In to LocaLink</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </Button>

      {/* ── Social Login Divider ── */}
      {hasGoogleAuth && (
        <>
          <div className="relative flex items-center py-0.5">
            <div className="flex-1 border-t border-slate-200/90 dark:border-white/10" />
            <span className="mx-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              or continue with
            </span>
            <div className="flex-1 border-t border-slate-200/90 dark:border-white/10" />
          </div>
          <div className="flex flex-col items-center justify-center">
            <SocialLogin />
          </div>
        </>
      )}

      {/* ── Direct Link to Register ── */}
      <p className="pt-0.5 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          onClick={() => soundFx?.playPop?.()}
          className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Sign up free ↗
        </Link>
      </p>
    </form>
  );
}
