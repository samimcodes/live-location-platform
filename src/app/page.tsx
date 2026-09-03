import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { LocationMapSection } from '@/components/landing/LocationMapSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { EmergencySOSSection } from '@/components/landing/EmergencySOSSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FriendsRealtimeSection } from '@/components/landing/FriendsRealtimeSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { AppDownloadSection } from '@/components/landing/AppDownloadSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const metadata = {
  title: 'LocaLink — Real-Time Family & Friends GPS Location Platform',
  description: 'Ultra-low latency live GPS tracking, smart geofence safe zones, 30-day trip route replay, and 1-click emergency SOS dispatch for modern families.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F6F8FD] dark:bg-background text-slate-900 dark:text-foreground overflow-x-hidden relative selection:bg-purple-500 selection:text-white">
      <LandingNavbar />
      <HeroSection />
      <LocationMapSection />
      <FeaturesSection />
      <EmergencySOSSection />
      <HowItWorksSection />
      <FriendsRealtimeSection />
      <PricingSection />
      <TestimonialsSection />
      <AppDownloadSection />
      <FAQSection />
      <CTASection />
      <LandingFooter />
    </main>
  );
}
