import { SignInForm } from '@/components/auth/signin';
import { MapPin } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-white">
            <MapPin size={28} />
            <span className="text-2xl font-bold">LocaLink</span>
          </Link>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white mb-4">
            Stay connected<br />with your circle
          </h2>
          <p className="text-white/80 text-lg">
            Share your location in real-time with the people that matter most.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { label: 'Active Users', value: '10K+' },
              { label: 'Families Connected', value: '3K+' },
              { label: 'Locations Shared', value: '1M+' },
              { label: 'Uptime', value: '99.9%' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-white/70 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        {/* decorative circles */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2 mb-8 text-primary">
            <MapPin size={24} />
            <span className="text-xl font-bold">LocaLink</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to your LocaLink account</p>
          </div>

          <SignInForm />
        </div>
      </div>
    </div>
  );
}
