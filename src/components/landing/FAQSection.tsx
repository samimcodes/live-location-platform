'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { soundFx } from '@/lib/soundFx';
import Link from 'next/link';

const faqs = [
  {
    category: 'Privacy & Security',
    question: 'Is my family’s location data secure and private?',
    answer:
      'Yes, 100%. LocaLink uses end-to-end encrypted WebSocket connections. Your location coordinates are transmitted exclusively to members of your explicitly authorized private circles. We never sell, track, or share your data with advertisers or third parties.',
  },
  {
    category: 'Tracking & Accuracy',
    question: 'How often does LocaLink update my location on the live map?',
    answer:
      'When active in transit, LocaLink updates GPS coordinates every 15 seconds with sub-20ms WebSocket latency. When stationary or connected to home Wi-Fi, it automatically throttles polling to preserve device battery while keeping your marker pin-sharp.',
  },
  {
    category: 'Battery & Device',
    question: 'Will using LocaLink drain my phone battery during the day?',
    answer:
      'No. LocaLink utilizes intelligent motion-aware background geolocation algorithms. By dynamically adjusting GPS refresh frequencies based on accelerometer and network states, battery usage remains under 3% per full day during typical usage.',
  },
  {
    category: 'Privacy & Security',
    question: 'How does Ghost Mode work?',
    answer:
      'Ghost Mode gives you total instant privacy. With one toggle, you can freeze your marker at your last known location, shift to approximate city-level radius, or completely hide your live status from specific circles whenever you desire privacy.',
  },
  {
    category: 'Features & Pricing',
    question: 'Is LocaLink free to use?',
    answer:
      'Yes! LocaLink is free forever for personal and family use with up to 5 circle members, real-time live map tracking, geofence safe zones, and 7-day location history playback. No credit card is required to start.',
  },
  {
    category: 'Setup & Circles',
    question: 'How do I invite family members or friends?',
    answer:
      'Creating and sharing a circle takes under 30 seconds. Simply click "Create Circle", generate a unique 6-character invite code, or share a direct invite link via SMS, WhatsApp, or email.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    soundFx.playPop();
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      id="faq"
      className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-[#F6F8FD] dark:bg-background scroll-mt-20 border-t border-slate-200/80 dark:border-slate-800/80"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 text-xs font-bold shadow-2xs mb-5">
            <HelpCircle size={14} />
            <span>Frequently Asked Questions</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.12] mb-4">
            Everything you need to know
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-xl mx-auto font-normal leading-relaxed">
            Have questions about LocaLink real-time GPS tracking, safe zones, or privacy? We have clear answers.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={cn(
                  'rounded-2xl bg-white dark:bg-[#0E1528] border transition-all duration-200 shadow-2xs overflow-hidden',
                  isOpen
                    ? 'border-violet-500/50 dark:border-violet-700 shadow-md'
                    : 'border-slate-200/90 dark:border-slate-800/80 hover:border-violet-300 dark:hover:border-violet-800'
                )}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-black text-slate-900 dark:text-white text-base sm:text-lg hover:text-violet-600 transition-colors cursor-pointer"
                >
                  <span className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300 w-fit">
                      {faq.category}
                    </span>
                    <span>{faq.question}</span>
                  </span>
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300',
                      isOpen
                        ? 'rotate-180 bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    )}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal border-t border-slate-100 dark:border-slate-800/60">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Still have questions banner */}
        <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-[#0E1528] border border-slate-200/90 dark:border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="font-black text-slate-900 dark:text-white text-sm">
              Still have questions about security or deployment?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Our support team is online 24/7 to assist your family or team.
            </p>
          </div>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors shrink-0 cursor-pointer"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </section>
  );
}
