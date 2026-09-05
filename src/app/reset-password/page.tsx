import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { Navigation, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
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
      <div className="w-full max-w-[430px] relative z-10">
        <div className="bg-white dark:bg-[#0E1528] rounded-[32px] shadow-2xl border border-slate-200/90 dark:border-slate-800 px-7 sm:px-9 py-9 sm:py-10">
          {/* Logo & Heading */}
          <div className="flex flex-col items-center text-center mb-7">
            <div
              className="h-13 w-13 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/25 mb-4"
            >
              <Lock size={22} className="text-white" />
            </div>
            <p className="text-[10px] font-mono font-bold text-violet-600 dark:text-violet-400 tracking-widest uppercase mb-1">
              LocaLink Security
            </p>
            <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
              Create New Password
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">
              Your new password must be at least 8 characters long
            </p>
          </div>

          <Suspense fallback={<div className="h-40 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />}>
            <ResetPasswordForm />
          </Suspense>
        </div>

        {/* Card bottom brand link */}
        <div className="flex justify-center mt-5">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-xs font-semibold transition-colors">
            <Navigation size={12} style={{ transform: 'rotate(-30deg)' }} />
            <span>LocaLink Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
