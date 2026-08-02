import React from 'react';
import Link from 'next/link';
import { MapPin, ExternalLink } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <MapPin size={14} className="text-white" />
              </div>
              <span className="font-bold text-foreground">LocaLink</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Real-time family location sharing — simple, private, and always available.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                { label: 'Features', href: '#features' },
                { label: 'How it works', href: '#how-it-works' },
                { label: 'Sign Up', href: '/register' },
                { label: 'Sign In', href: '/login' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Cookie Policy', href: '#' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} LocaLink. All rights reserved.
          </p>
        <div className="flex items-center gap-3">
          <a href="https://github.com" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors">
            <ExternalLink size={18} />
          </a>
          <a href="https://x.com" aria-label="X / Twitter" className="text-muted-foreground hover:text-foreground transition-colors">
            <ExternalLink size={18} />
          </a>
        </div>
        </div>
      </div>
    </footer>
  );
}
