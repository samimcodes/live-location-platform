import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { MouseSpotlight } from '@/components/landing/MouseSpotlight';
import { LocationMapSection } from '@/components/landing/LocationMapSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { FriendsRealtimeSection } from '@/components/landing/FriendsRealtimeSection';
import { EmergencySOSSection } from '@/components/landing/EmergencySOSSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const metadata = {
  title: 'LocaLink — AI-Powered Real-Time Family & Friends GPS Location Platform',
  description: 'Ultra-low latency live GPS tracking, predictive spatial AI, smart geofence safe zones, and 1-click emergency SOS dispatch for modern families.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F6F8FD] dark:bg-[#070B16] text-slate-900 dark:text-foreground overflow-x-clip relative selection:bg-indigo-600 selection:text-white">
      <MouseSpotlight />
      <LandingNavbar />
      <HeroSection />
      <LocationMapSection />
      <FeaturesSection />
      <FriendsRealtimeSection />
      <EmergencySOSSection />
      <HowItWorksSection />
      <PricingSection />
      <FAQSection />
      <LandingFooter />
    </main>
  );
}
