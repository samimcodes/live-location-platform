import React from 'react';
import Link from 'next/link';
import { Globe, Shield } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-100 dark:border-border/60 bg-white dark:bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <Link href="/" className="flex items-center gap-2.5 group inline-flex">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M12 11.5C13.3807 11.5 14.5 10.3807 14.5 9C14.5 7.61929 13.3807 6.5 12 6.5C10.6193 6.5 9.5 7.61929 9.5 9C9.5 10.3807 10.6193 11.5 12 11.5Z" fill="white"/>
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-foreground leading-none">
                  LocaLink
                </span>
                <span className="text-[9px] font-black tracking-widest text-[#7C3AED] uppercase mt-0.5">
                  LIVE LOCATION
                </span>
              </div>
            </Link>
            
            <p className="text-sm text-[#64748B] dark:text-muted-foreground max-w-sm leading-relaxed font-normal">
              Real-time family location sharing platform. Simple, private, secure, and available everywhere you go.
            </p>
            
            <div className="flex items-center gap-4 text-xs text-[#64748B] dark:text-muted-foreground pt-2 font-medium">
              <span className="flex items-center gap-1.5">
                <Shield size={14} className="text-[#10B981]" /> SOC2 Compliant
              </span>
              <span className="flex items-center gap-1.5">
                <Globe size={14} className="text-[#7C3AED]" /> 99.9% Uptime
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div className="text-left">
            <h4 className="text-xs font-bold text-[#0F172A] dark:text-foreground mb-4 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2.5 text-sm text-[#64748B] dark:text-muted-foreground font-medium">
              {[
                { label: 'Live Map', href: '#map-preview' },
                { label: 'Features', href: '#features' },
                { label: 'How it works', href: '#how-it-works' },
                { label: 'Pricing', href: '#cta' },
                { label: 'Dashboard', href: '/dashboard' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-[#7C3AED] transition-colors inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="text-left">
            <h4 className="text-xs font-bold text-[#0F172A] dark:text-foreground mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5 text-sm text-[#64748B] dark:text-muted-foreground font-medium">
              {[
                { label: 'About Us', href: '#' },
                { label: 'Blog', href: '#' },
                { label: 'Careers', href: '#' },
                { label: 'Contact', href: '#' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-[#7C3AED] transition-colors inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="text-left">
            <h4 className="text-xs font-bold text-[#0F172A] dark:text-foreground mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5 text-sm text-[#64748B] dark:text-muted-foreground font-medium">
              {[
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Cookie Policy', href: '#' },
                { label: 'Security', href: '#' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-[#7C3AED] transition-colors inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 dark:border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#64748B] dark:text-muted-foreground font-medium">
            © {new Date().getFullYear()} LocaLink Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-[#64748B] dark:text-muted-foreground font-medium">
            <span>Built with precision for family safety</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
