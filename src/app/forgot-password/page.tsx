'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, CheckCircle2, Navigation, Send, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import { toast } from '@/lib/toast';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to send reset email. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden p-4"
      style={{
        background: 'linear-gradient(145deg, #0f1033 0%, #1a1060 50%, #0d1535 100%)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Ambient glow blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />

      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      {/* Sparkle decoration */}
      <div className="absolute top-20 right-[25%] text-indigo-200 opacity-60 animate-pulse pointer-events-none">
        <Sparkles size={18} />
      </div>
      <div className="absolute bottom-24 left-[22%] text-purple-200 opacity-50 animate-pulse pointer-events-none">
        <Sparkles size={12} />
      </div>

      {/* Back to sign in — top left */}
      <Link
        href="/login"
        className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 text-xs font-semibold text-white/70 hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md px-4 py-2 rounded-full transition-all"
      >
        <ArrowLeft size={13} />
        Back to Sign In
      </Link>

      {/* Central Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="bg-white rounded-3xl shadow-2xl border border-white/20 px-8 py-10"
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 8px 32px rgba(99,102,241,0.15)' }}
        >
          {/* Logo & Heading */}
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg mb-4"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,0.35)' }}
            >
              <Send size={22} className="text-white" style={{ transform: 'rotate(-15deg)' }} />
            </div>
            <p className="text-xs font-bold text-indigo-600 tracking-wider uppercase mb-1">LocaLink</p>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success-header"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex flex-col items-center"
                >
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Email Sent!</h1>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
                    Check your inbox for the reset link
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="form-header"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex flex-col items-center"
                >
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Forgot Password?</h1>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
                    Enter your email and we&apos;ll send you a reset link
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {submitted ? (
              /* ── Success State ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {/* Success card */}
                <div
                  className="flex flex-col items-center gap-3 py-7 px-4 rounded-2xl text-center"
                  style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: '1px solid #bbf7d0' }}
                >
                  <div className="h-14 w-14 rounded-full flex items-center justify-center"
                    style={{ background: '#dcfce7' }}>
                    <CheckCircle2 size={28} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Reset link sent!</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      We sent a password reset link to<br />
                      <span className="font-bold text-slate-700">{getValues('email')}</span>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-center text-slate-500">
                  Didn&apos;t receive it?{' '}
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-indigo-600 hover:underline font-bold cursor-pointer"
                  >
                    Try again
                  </button>
                </p>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full h-12 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(90deg, #5b5fc7 0%, #7c3aed 100%)', boxShadow: '0 6px 20px rgba(99,102,241,0.3)' }}
                >
                  <Navigation size={15} style={{ transform: 'rotate(-30deg)' }} />
                  Back to Sign In
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
            ) : (
              /* ── Form State ── */
              <motion.form
                key="form"
                onSubmit={handleSubmit(onSubmit)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      autoFocus
                      {...register('email')}
                      aria-invalid={!!errors.email}
                      className="h-12 pl-10 rounded-xl border-slate-200 bg-[#f0f4fd] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all shadow-none"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                  )}
                </div>

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
                      Sending reset link…
                    </>
                  ) : (
                    <>
                      <Mail size={15} />
                      Send Reset Link
                      <ArrowRight size={15} />
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-slate-500 font-medium pt-1">
                  Remember your password?{' '}
                  <Link href="/login" className="text-indigo-600 hover:underline font-bold">
                    Sign in
                  </Link>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Card bottom brand link */}
        <div className="flex justify-center mt-5">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 text-xs font-medium transition-colors">
            <Navigation size={12} style={{ transform: 'rotate(-30deg)' }} />
            LocaLink Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
