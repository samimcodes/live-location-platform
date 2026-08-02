import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { MapPin } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-8 text-primary justify-center">
          <MapPin size={24} />
          <span className="text-xl font-bold">LocaLink</span>
        </Link>
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Forgot password?</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enter your email and we&apos;ll send a reset link.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
