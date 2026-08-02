'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/lib/toast';
import Link from 'next/link';
import api from '@/lib/axios';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const schema = z.object({
  email: z.string().email('Invalid email format'),
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to send reset link';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <div className="h-14 w-14 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mx-auto">
          <CheckCircle2 size={28} className="text-emerald-500" />
        </div>
        <p className="font-semibold text-foreground">Check your inbox</p>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent a password reset link to your email address.
        </p>
        <Link href="/login" className="block text-sm text-primary hover:underline font-medium mt-4">
          Back to Sign In
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          aria-invalid={!!errors.email}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <Button type="submit" className="w-full h-10" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Sending…
          </span>
        ) : 'Send Reset Link'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
      </p>
    </motion.form>
  );
}
