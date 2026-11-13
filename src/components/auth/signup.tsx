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
import api from '@/lib/axios';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ShieldAlert, CheckCircle2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { soundFx } from '@/lib/soundFx';
import { useAppDispatch } from '@/store/store';
import { setCredentials } from '@/store/slices/authSlice';
import { useLocationStore } from '@/store/useLocationStore';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const passwordValue = watch('password') || '';
  const confirmPasswordValue = watch('confirmPassword') || '';
  const emailValue = watch('email') || '';
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(passwordValue);

  const onSubmit = async (formData: FormData) => {
    setIsLoading(true);
    soundFx?.playPop?.();
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };
      const { data } = await api.post('/auth/register', payload);
      if (data.success) {
        soundFx?.playChime?.();
        if (data.data?.token) {
          localStorage.setItem('token', data.data.token);
          dispatch(setCredentials({ user: data.data.user, token: data.data.token }));
          useLocationStore.getState().setSharing(Boolean(data.data.user?.sharingLocation));
          toast.success('Account created successfully!', {
            description: 'Welcome to LocaLink! Opening your dashboard…',
          });
          router.refresh();
          router.push('/dashboard');
        } else {
          toast.success('Account created successfully!', {
            description: 'Please sign in to access your dashboard.',
          });
          router.push('/login');
        }
      } else {
        throw new Error(data.message);
      }
    } catch (err: unknown) {
      soundFx?.playAlert?.();
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? (err instanceof Error ? err.message : 'Registration failed. Please try again.');
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-2.5 text-left">
      {/* ── Full Name ── */}
      <div className="space-y-0.5">
        <Label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          Full Name
        </Label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            id="name"
            placeholder="Sarah Jenkins"
            autoComplete="name"
            {...register('name')}
            aria-invalid={!!errors.name}
            className="h-9.5 rounded-xl border border-slate-200/80 bg-white/75 pl-9 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs backdrop-blur-md transition-all focus-visible:bg-white focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600/15 dark:border-white/10 dark:bg-slate-900/50 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:bg-slate-900/80 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/20"
          />
        </div>
        {errors.name && (
          <p className="flex items-center gap-1 text-[11px] font-medium text-rose-500 dark:text-rose-400">
            <ShieldAlert className="h-3 w-3" />
            <span>{errors.name.message}</span>
          </p>
        )}
      </div>

      {/* ── Email address ── */}
      <div className="space-y-0.5">
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
            className="h-9.5 rounded-xl border border-slate-200/80 bg-white/75 pl-9 pr-9 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs backdrop-blur-md transition-all focus-visible:bg-white focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600/15 dark:border-white/10 dark:bg-slate-900/50 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:bg-slate-900/80 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/20"
          />
          {isEmailValid && (
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500">
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

      {/* ── Password & Strength Meter ── */}
      <div className="space-y-0.5">
        <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          Password
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 8 chars, 1 uppercase, 1 symbol"
            autoComplete="new-password"
            {...register('password')}
            aria-invalid={!!errors.password}
            className="h-9.5 rounded-xl border border-slate-200/80 bg-white/75 pl-9 pr-9 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs backdrop-blur-md transition-all focus-visible:bg-white focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600/15 dark:border-white/10 dark:bg-slate-900/50 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:bg-slate-900/80 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/20"
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

        {/* ── Clean 4-Bar Strength Meter ── */}
        {passwordValue.length > 0 && (
          <div className="pt-0.5">
            <div className="flex h-1 w-full gap-1">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-full flex-1 rounded-full transition-all duration-300 ${
                    strengthScore >= step
                      ? strengthScore <= 1
                        ? 'bg-rose-500'
                        : strengthScore === 2
                          ? 'bg-amber-500'
                          : strengthScore === 3
                            ? 'bg-indigo-500'
                            : 'bg-emerald-500'
                      : 'bg-slate-200/60 dark:bg-white/10'
                  }`}
                />
              ))}
            </div>
            <div className="mt-0.5 flex items-center justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400">
              <span>
                {strengthScore <= 1
                  ? 'Weak password'
                  : strengthScore === 2
                    ? 'Medium password'
                    : strengthScore === 3
                      ? 'Strong password'
                      : 'Very secure'}
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {strengthScore * 25}%
              </span>
            </div>
          </div>
        )}

        {errors.password && (
          <p className="flex items-center gap-1 text-[11px] font-medium text-rose-500 dark:text-rose-400">
            <ShieldAlert className="h-3 w-3" />
            <span>{errors.password.message}</span>
          </p>
        )}
      </div>

      {/* ── Confirm Password ── */}
      <div className="space-y-0.5">
        <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          Confirm Password
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            aria-invalid={!!errors.confirmPassword}
            className="h-9.5 rounded-xl border border-slate-200/80 bg-white/75 pl-9 pr-9 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs backdrop-blur-md transition-all focus-visible:bg-white focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600/15 dark:border-white/10 dark:bg-slate-900/50 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:bg-slate-900/80 dark:focus-visible:border-indigo-400 dark:focus-visible:ring-indigo-400/20"
          />
          <button
            type="button"
            onClick={() => {
              soundFx?.playPop?.();
              setShowConfirm(!showConfirm);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-white"
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          {confirmPasswordValue && confirmPasswordValue === passwordValue && (
            <div className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-emerald-500">
              <ShieldCheck className="h-4 w-4" />
            </div>
          )}
        </div>
        {errors.confirmPassword && (
          <p className="flex items-center gap-1 text-[11px] font-medium text-rose-500 dark:text-rose-400">
            <ShieldAlert className="h-3 w-3" />
            <span>{errors.confirmPassword.message}</span>
          </p>
        )}
      </div>

      {/* ── Professional Primary Button ── */}
      <Button
        type="submit"
        disabled={isLoading}
        className="group relative flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:opacity-75"
      >
        {isLoading ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span>Creating account…</span>
          </>
        ) : (
          <>
            <span>Create Free Account</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </Button>

      {/* ── Terms & Privacy Note ── */}
      <p className="text-center text-[10.5px] leading-tight text-slate-500 dark:text-slate-400">
        By registering, you agree to our{' '}
        <span className="cursor-pointer font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Terms
        </span>{' '}
        and{' '}
        <span className="cursor-pointer font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Privacy Policy
        </span>
        .
      </p>

      {/* ── Direct Link to Login ── */}
      <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link
          href="/login"
          onClick={() => soundFx?.playPop?.()}
          className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Sign in ↗
        </Link>
      </p>
    </form>
  );
}
