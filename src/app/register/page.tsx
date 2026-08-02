import { SignUpForm } from '@/components/auth/signup';
import { MapPin, Shield, Zap, Users } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const perks = [
    { icon: Shield, text: 'End-to-end encrypted location data' },
    { icon: Zap, text: 'Real-time updates every 15 seconds' },
    { icon: Users, text: 'Create unlimited family groups' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-white">
            <MapPin size={28} />
            <span className="text-2xl font-bold">LocaLink</span>
          </Link>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white mb-4">
            Your family,<br />always nearby
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Join thousands of families staying safe and connected with LocaLink.
          </p>
          <div className="space-y-3">
            {perks.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/90">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Icon size={16} />
                </div>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/10" />
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex lg:hidden items-center gap-2 mb-8 text-primary">
            <MapPin size={24} />
            <span className="text-xl font-bold">LocaLink</span>
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Create account</h1>
            <p className="text-muted-foreground mt-1 text-sm">Free forever. No credit card needed.</p>
          </div>

          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
