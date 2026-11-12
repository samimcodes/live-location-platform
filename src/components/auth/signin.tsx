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
      await login(data.email.trim().toLowerCase(), data.password);
      soundFx?.playChime?.();
      toast.success('Welcome back!', { description: 'Redirecting to your live dashboard…' });
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
        className="relative w-full h-11 rounded-2xl text-white text-sm font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/25 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 border border-white/20 overflow-hidden group/sub"
      >
        <span className="absolute inset-0 -translate-x-full group-hover/sub:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
        {isLoading ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <span>Signing in…</span>
          </>
        ) : (
          <>
            <Navigation size={14} className="text-white" style={{ transform: 'rotate(-30deg)' }} />
            <span>Sign In to LocaLink</span>
            <ArrowRight size={14} className="group-hover/sub:translate-x-0.5 transition-transform" />
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
      <div className="flex flex-col items-center gap-2">
        <SocialLogin />
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
