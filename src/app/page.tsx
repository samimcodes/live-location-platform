import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { LocationMapSection } from '@/components/landing/LocationMapSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FriendsRealtimeSection } from '@/components/landing/FriendsRealtimeSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <LandingNavbar />
      <HeroSection />
      <LocationMapSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FriendsRealtimeSection />
      <FAQSection />
      <CTASection />
      <LandingFooter />
    </main>
  );
}
