'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, CheckCircle2, Navigation, Send, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import { toast } from '@/lib/toast';
import { soundFx } from '@/lib/soundFx';

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
    soundFx?.playPop?.();
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      soundFx?.playChime?.();
      setSubmitted(true);
    } catch (err: unknown) {
      soundFx?.playAlert?.();
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
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden p-4 bg-slate-950"
      style={{
        background: 'linear-gradient(145deg, #090E1F 0%, #151145 50%, #080D1D 100%)',
      }}
    >
      {/* Ambient glow blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] rounded-full opacity-35 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />
      <div className="absolute top-[35%] right-[10%] w-[40%] h-[40%] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }} />

      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      {/* Back to sign in — top left */}
      <Link
        href="/login"
        className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 text-xs font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md px-4 py-2 rounded-full transition-all shadow-md"
      >
        <ArrowLeft size={13} />
        <span>Back to Sign In</span>
      </Link>

      {/* Central Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-[430px] relative z-10"
      >
        <div className="bg-white dark:bg-[#0E1528] rounded-[32px] shadow-2xl border border-slate-200/90 dark:border-slate-800 px-7 sm:px-9 py-9 sm:py-10">
          {/* Logo & Heading */}
          <div className="flex flex-col items-center text-center mb-7">
            <div
              className="h-13 w-13 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/25 mb-4"
            >
              <Send size={22} className="text-white" style={{ transform: 'rotate(-15deg)' }} />
            </div>
            <p className="text-[10px] font-mono font-bold text-violet-600 dark:text-violet-400 tracking-widest uppercase mb-1">
              LocaLink Security
            </p>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success-header"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex flex-col items-center"
                >
                  <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                    Check Your Email
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">
                    We&apos;ve sent password recovery instructions
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
                  <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                    Forgot Password?
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">
                    Enter your email to receive a secure password reset link
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
                className="space-y-5 text-left"
              >
                {/* Success card */}
                <div className="flex flex-col items-center gap-3 py-6 px-4 rounded-2xl text-center bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/60">
                    <CheckCircle2 size={26} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">Reset link dispatched!</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      We sent an email to<br />
                      <strong className="text-violet-600 dark:text-violet-400 font-mono">{getValues('email')}</strong>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                  Didn&apos;t receive the email?{' '}
                  <button
                    onClick={() => {
                      soundFx?.playPop?.();
                      setSubmitted(false);
                    }}
                    className="text-violet-600 dark:text-violet-400 hover:underline font-bold cursor-pointer"
                  >
                    Try again
                  </button>
                </p>

                <Button
                  className="w-full h-12 rounded-xl text-white text-sm font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  asChild
                >
                  <Link href="/login">
                    <Navigation size={15} style={{ transform: 'rotate(-30deg)' }} />
                    <span>Back to Sign In</span>
                    <ArrowRight size={14} />
                  </Link>
                </Button>
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
                className="space-y-4 text-left"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      autoFocus
                      {...register('email')}
                      aria-invalid={!!errors.email}
                      className="h-12 pl-10 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/90 dark:bg-[#121B33] focus-visible:ring-2 focus-visible:ring-violet-500 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-2xs"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-rose-500 font-medium mt-1">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl text-white text-sm font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 border border-white/20"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Sending link…</span>
                    </>
                  ) : (
                    <>
                      <Mail size={15} />
                      <span>Send Recovery Link</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
                  Remember your password?{' '}
                  <Link href="/login" className="text-violet-600 dark:text-violet-400 hover:underline font-bold">
                    Sign in
                  </Link>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Card bottom brand link */}
        <div className="flex justify-center mt-5">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-xs font-semibold transition-colors">
            <Navigation size={12} style={{ transform: 'rotate(-30deg)' }} />
            <span>LocaLink Home</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
