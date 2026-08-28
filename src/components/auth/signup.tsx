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
import { Eye, EyeOff, Mail, Lock, User, Navigation, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
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
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...payload } = formData;
      const { data } = await api.post('/auth/register', payload);
      if (data.success) {
        toast.success('Account created!', { description: 'Please sign in to continue.' });
        router.push('/login');
      } else {
        throw new Error(data.message);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message
            ?? 'Registration failed';
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
      {/* Full Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs font-bold text-slate-700">Full Name</Label>
        <div className="relative">
          <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            id="name"
            placeholder="John Doe"
            {...register('name')}
            aria-invalid={!!errors.name}
            className="h-12 pl-10 rounded-xl border-slate-200 bg-[#f0f4fd] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all shadow-none"
          />
        </div>
        {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email address</Label>
        <div className="relative">
          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            aria-invalid={!!errors.email}
            className="h-12 pl-10 rounded-xl border-slate-200 bg-[#f0f4fd] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all shadow-none"
          />
        </div>
        {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-bold text-slate-700">Password</Label>
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 8 characters"
            {...register('password')}
            aria-invalid={!!errors.password}
            className="h-12 pl-10 pr-11 rounded-xl border-slate-200 bg-[#f0f4fd] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all shadow-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700">Confirm Password</Label>
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('confirmPassword')}
            aria-invalid={!!errors.confirmPassword}
            className="h-12 pl-10 pr-11 rounded-xl border-slate-200 bg-[#f0f4fd] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all shadow-none"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>}
      </div>

      {/* Submit Button */}
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
            Creating account…
          </>
        ) : (
          <>
            <Navigation size={15} className="text-white" style={{ transform: 'rotate(-30deg)' }} />
            Create Free Account
            <ArrowRight size={15} />
          </>
        )}
      </Button>

      {/* Terms note */}
      <p className="text-center text-[11px] text-slate-400 leading-relaxed">
        By creating an account, you agree to our{' '}
        <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">Terms</span>
        {' & '}
        <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
      </p>

      {/* Sign in link */}
      <p className="text-center text-xs text-slate-500 font-medium">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-600 hover:underline font-bold inline-flex items-center gap-0.5">
          Sign in <ArrowRight size={12} />
        </Link>
      </p>
    </motion.form>
  );
}
