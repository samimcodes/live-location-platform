'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/lib/toast';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import { Eye, EyeOff, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { soundFx } from '@/lib/soundFx';

const schema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const newPassValue = watch('newPassword') || '';

  const getStrengthScore = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrengthScore(newPassValue);

  const onSubmit = async (data: FormData) => {
    if (!token) {
      soundFx?.playAlert?.();
      toast.error('Invalid or expired password reset link');
      return;
    }
    setIsLoading(true);
    soundFx?.playPop?.();
    try {
      await api.post('/auth/reset-password', { token, newPassword: data.newPassword });
      soundFx?.playChime?.();
      toast.success('Password updated successfully!', { description: 'Please sign in with your new password.' });
      router.push('/login');
    } catch (err: unknown) {
      soundFx?.playAlert?.();
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to reset password. Link may be expired.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 text-left"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="newPassword" className="text-xs font-bold text-slate-700 dark:text-slate-300">
          New Password
        </Label>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <Input
            id="newPassword"
            type={showPass ? 'text' : 'password'}
            placeholder="Min 8 characters"
            {...register('newPassword')}
            aria-invalid={!!errors.newPassword}
            className="h-12 pl-10 pr-11 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/90 dark:bg-[#121B33] focus-visible:ring-2 focus-visible:ring-violet-500 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-2xs"
          />
          <button
            type="button"
            onClick={() => {
              soundFx?.playPop?.();
              setShowPass(!showPass);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {newPassValue.length > 0 && (
          <div className="pt-1">
            <div className="flex gap-1 h-1.5 w-full">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex-1 rounded-full transition-all duration-300 ${
                    strength >= step
                      ? strength <= 2
                        ? 'bg-amber-500'
                        : strength === 3
                        ? 'bg-blue-500'
                        : 'bg-emerald-500'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {errors.newPassword && (
          <p className="text-xs text-rose-500 font-medium mt-1">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Confirm New Password
        </Label>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <Input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Re-enter new password"
            {...register('confirmPassword')}
            aria-invalid={!!errors.confirmPassword}
            className="h-12 pl-10 pr-11 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/90 dark:bg-[#121B33] focus-visible:ring-2 focus-visible:ring-violet-500 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-2xs"
          />
          <button
            type="button"
            onClick={() => {
              soundFx?.playPop?.();
              setShowConfirm(!showConfirm);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-rose-500 font-medium mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading || !token}
        className="w-full h-12 rounded-xl text-white text-sm font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 border border-white/20"
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <span>Updating password…</span>
          </>
        ) : (
          <>
            <CheckCircle2 size={16} />
            <span>Save New Password</span>
            <ArrowRight size={15} />
          </>
        )}
      </Button>
    </motion.form>
  );
}
