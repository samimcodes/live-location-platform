'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageCircle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const faqs = [
  {
    category: 'Privacy & Security',
    question: 'Is my location data secure and private?',
    answer: 'Yes, 100%. LocaLink uses end-to-end encrypted WebSocket connections. Your location coordinates are transmitted exclusively to members of your explicitly authorized private circles. We never sell, track, or share your data with advertisers or third parties.',
  },
  {
    category: 'Tracking & Accuracy',
    question: 'How often does LocaLink update my location on the map?',
    answer: 'When active, LocaLink updates GPS coordinates every 15 seconds with sub-20ms latency. When stationary or connected to home Wi-Fi, it automatically throttles polling to preserve device battery while keeping your marker precise.',
  },
  {
    category: 'Battery & Device',
    question: 'Will using LocaLink drain my phone battery?',
    answer: 'No. LocaLink utilizes intelligent motion-aware background geolocation algorithms. By dynamically adjusting GPS refresh frequencies based on accelerometer and network states, battery usage remains under 1% per hour during typical usage.',
  },
  {
    category: 'Privacy & Security',
    question: 'How does Ghost Mode work?',
    answer: 'Ghost Mode gives you total instant privacy. With one toggle, you can freeze your marker at your last known location, shift to approximate city-level radius, or completely hide your live status from specific circles.',
  },
  {
    category: 'Features & Pricing',
    question: 'Is LocaLink free to use?',
    answer: 'Yes! LocaLink is free forever for personal and family use with up to 5 circle members, real-time live map tracking, geofence safe zones, and 7-day location history playback.',
  },
  {
    category: 'Setup & Circles',
    question: 'How do I invite family members or friends?',
    answer: 'Creating and sharing a circle takes under 30 seconds. Simply click "Create Circle", generate a unique 6-character invite code or share a direct link via SMS, WhatsApp, or email.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-[#F8F9FD] dark:bg-background scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDE9FE] border border-purple-200/60 text-[#7C3AED] dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60 text-xs font-bold shadow-2xs mb-6">
            <HelpCircle size={14} />
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-foreground tracking-tight mb-4">
            Everything you need to know
          </h2>
          <p className="text-slate-600 dark:text-muted-foreground text-base sm:text-lg max-w-xl mx-auto font-normal leading-relaxed">
            Have questions about LocaLink real-time GPS tracking, safe zones, or privacy? We have answers.
          </p>
        </motion.div>

        <div className="space-y-3.5">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className={cn(
                  "rounded-2xl bg-white dark:bg-card border transition-all duration-200 shadow-2xs overflow-hidden",
                  isOpen ? "border-[#7C3AED]/40 dark:border-purple-800 shadow-md" : "border-slate-200/80 dark:border-border/80 hover:border-purple-200 dark:hover:border-purple-900"
                )}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-foreground text-base sm:text-lg hover:text-[#7C3AED] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-purple-50 text-[#7C3AED] dark:bg-purple-950/60 dark:text-purple-300">
                      {faq.category}
                    </span>
                    <span>{faq.question}</span>
                  </span>
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300",
                    isOpen ? "rotate-180 bg-[#EDE9FE] text-[#7C3AED] dark:bg-purple-950 dark:text-purple-300" : "bg-slate-100 dark:bg-muted text-slate-500"
                  )}>
                    <ChevronDown size={18} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-0 text-slate-600 dark:text-muted-foreground text-sm sm:text-base leading-relaxed border-t border-slate-100 dark:border-border/60 pt-4 font-normal text-left">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Support Callout */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 p-4 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border text-sm text-slate-600 dark:text-muted-foreground shadow-2xs">
            <MessageCircle size={18} className="text-[#7C3AED]" />
            <span>Still have questions? Our support team is here 24/7.</span>
            <Link href="/register" className="font-bold text-[#7C3AED] hover:underline ml-1">
              Contact Support →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
