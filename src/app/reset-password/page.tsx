import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { MapPin } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-8 text-primary justify-center">
          <MapPin size={24} />
          <span className="text-xl font-bold">LocaLink</span>
        </Link>
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Reset password</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter your new password below.</p>
        </div>
        <Suspense fallback={<div className="h-10 bg-muted rounded animate-pulse" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
