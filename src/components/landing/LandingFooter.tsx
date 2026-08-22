import React from 'react';
import Link from 'next/link';
import { MapPin, Globe, Shield } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group inline-flex">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <MapPin size={16} className="text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-foreground">LocaLink</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Real-time family location sharing platform. Simple, private, secure, and available everywhere you go.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
              <span className="flex items-center gap-1">
                <Shield size={13} className="text-emerald-500" /> SOC2 Compliant
              </span>
              <span className="flex items-center gap-1">
                <Globe size={13} className="text-primary" /> 99.9% Uptime
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold text-foreground mb-4 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground font-medium">
              {[
                { label: 'Live Map', href: '#map-preview' },
                { label: 'Features', href: '#features' },
                { label: 'How it works', href: '#how-it-works' },
                { label: 'Dashboard', href: '/dashboard' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-primary transition-colors inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-xs font-bold text-foreground mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground font-medium">
              {[
                { label: 'About Us', href: '#' },
                { label: 'Blog', href: '#' },
                { label: 'Careers', href: '#' },
                { label: 'Contact', href: '#' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-primary transition-colors inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-xs font-bold text-foreground mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground font-medium">
              {[
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Cookie Policy', href: '#' },
                { label: 'Security', href: '#' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-primary transition-colors inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-medium">
            © {new Date().getFullYear()} LocaLink Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span>Built with precision for safety</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
