'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';

export function CTASection() {
  return (
    <section id="cta" className="py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 text-center"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm items-center justify-center mb-6">
              <MapPin size={28} className="text-white" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Ready to stay connected?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Join over 10,000 families already using LocaLink. Free forever for up to 5 members.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="h-12 px-8 bg-white text-indigo-600 hover:bg-white/90 text-base font-semibold"
                asChild
              >
                <Link href="/register">
                  Start for free
                  <ArrowRight size={18} className="ml-2" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 border-white/40 text-white hover:bg-white/10 text-base"
                asChild
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
