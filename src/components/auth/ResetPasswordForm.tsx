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
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!token) { toast.error('Invalid reset link'); return; }
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: data.newPassword });
      toast.success('Password reset successfully!');
      router.push('/login');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to reset password';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="space-y-1.5">
        <Label>New Password</Label>
        <div className="relative">
          <Input
            type={showPass ? 'text' : 'password'}
            placeholder="Min 8 characters"
            {...register('newPassword')}
            aria-invalid={!!errors.newPassword}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Confirm Password</Label>
        <Input
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          aria-invalid={!!errors.confirmPassword}
        />
        {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" className="w-full h-10" disabled={isLoading || !token}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Resetting…
          </span>
        ) : 'Reset Password'}
      </Button>
    </motion.form>
  );
}
