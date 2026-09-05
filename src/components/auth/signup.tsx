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
import { Eye, EyeOff, Mail, Lock, User, Navigation, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { soundFx } from '@/lib/soundFx';

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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const passwordValue = watch('password') || '';

  // Password strength computation
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...payload } = formData;
      const { data } = await api.post('/auth/register', payload);
      if (data.success) {
        soundFx?.playChime?.();
        toast.success('Account created successfully!', { description: 'Please sign in to access your dashboard.' });
        router.push('/login');
      } else {
        throw new Error(data.message);
      }
    } catch (err: unknown) {
      soundFx?.playAlert?.();
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message
            ?? 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-2.5 w-full text-left"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Full Name */}
      <div className="space-y-1">
        <Label htmlFor="name" className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Full Name
        </Label>
        <div className="relative">
          <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <Input
            id="name"
            placeholder="John Doe"
            {...register('name')}
            aria-invalid={!!errors.name}
            className="h-10 pl-10 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/90 dark:bg-[#121B33] focus-visible:ring-2 focus-visible:ring-violet-500 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-2xs"
          />
        </div>
        {errors.name && <p className="text-xs text-rose-500 font-medium mt-0.5">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div className="space-y-1">
        <Label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Email address
        </Label>
        <div className="relative">
          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            {...register('email')}
            aria-invalid={!!errors.email}
            className="h-10 pl-10 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/90 dark:bg-[#121B33] focus-visible:ring-2 focus-visible:ring-violet-500 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-2xs"
          />
        </div>
        {errors.email && <p className="text-xs text-rose-500 font-medium mt-0.5">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="space-y-1">
        <Label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Password
        </Label>
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 8 characters"
            {...register('password')}
            aria-invalid={!!errors.password}
            className="h-10 pl-10 pr-11 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/90 dark:bg-[#121B33] focus-visible:ring-2 focus-visible:ring-violet-500 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-2xs"
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

        {/* Password Strength Indicator */}
        {passwordValue.length > 0 && (
          <div className="pt-0.5">
            <div className="flex gap-1 h-1 w-full">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex-1 rounded-full transition-all duration-300 ${
                    strengthScore >= step
                      ? strengthScore <= 2
                        ? 'bg-amber-500'
                        : strengthScore === 3
                        ? 'bg-blue-500'
                        : 'bg-emerald-500'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-[9px] font-mono text-slate-400 mt-0.5 block">
              {strengthScore <= 2 ? 'Weak' : strengthScore === 3 ? 'Good' : 'Strong & Secure'}
            </span>
          </div>
        )}

        {errors.password && <p className="text-xs text-rose-500 font-medium mt-0.5">{errors.password.message}</p>}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1">
        <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Confirm Password
        </Label>
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <Input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Re-enter password"
            {...register('confirmPassword')}
            aria-invalid={!!errors.confirmPassword}
            className="h-10 pl-10 pr-11 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/90 dark:bg-[#121B33] focus-visible:ring-2 focus-visible:ring-violet-500 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-2xs"
          />
          <button
            type="button"
            onClick={() => {
              soundFx?.playPop?.();
              setShowConfirm(!showConfirm);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
          >
            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-xs text-rose-500 font-medium mt-0.5">{errors.confirmPassword.message}</p>}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-10.5 rounded-xl text-white text-sm font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/25 hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 border border-white/20"
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <span>Creating account…</span>
          </>
        ) : (
          <>
            <Navigation size={14} className="text-white" style={{ transform: 'rotate(-30deg)' }} />
            <span>Create Free Account</span>
            <ArrowRight size={14} />
          </>
        )}
      </Button>

      {/* Terms note */}
      <p className="text-center text-[10.5px] text-slate-400 dark:text-slate-500 leading-tight font-medium">
        By creating an account, you agree to our{' '}
        <span className="text-violet-600 dark:text-violet-400 font-bold cursor-pointer hover:underline">Terms</span>
        {' & '}
        <span className="text-violet-600 dark:text-violet-400 font-bold cursor-pointer hover:underline">Privacy Policy</span>.
      </p>

      {/* Sign in link */}
      <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium pt-0.5">
        Already have an account?{' '}
        <Link href="/login" className="text-violet-600 dark:text-violet-400 hover:underline font-bold inline-flex items-center gap-0.5">
          <span>Sign in</span>
          <ArrowRight size={12} />
        </Link>
      </p>
    </motion.form>
  );
}
