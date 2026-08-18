import React from 'react';
import Link from 'next/link';
import { MapPin, ExternalLink } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="border-t border-border/50 bg-background relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group inline-flex">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <MapPin size={16} className="text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-foreground">LocaLink</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed pr-4">
              Real-time family location sharing designed for peace of mind. Simple, private, secure, and always available when you need it most.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-5 uppercase tracking-wider">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground font-medium">
              {[
                { label: 'Features', href: '#features' },
                { label: 'How it works', href: '#how-it-works' },
                { label: 'Pricing', href: '#cta' },
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
            <h4 className="text-sm font-bold text-foreground mb-5 uppercase tracking-wider">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground font-medium">
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
            <h4 className="text-sm font-bold text-foreground mb-5 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground font-medium">
              {[
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Cookie Policy', href: '#' },
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
          <div className="flex items-center gap-4">
            <a href="https://github.com" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted/50">
              <ExternalLink size={18} />
            </a>
            <a href="https://twitter.com" aria-label="Twitter" className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted/50">
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
