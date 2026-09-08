'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  HelpCircle,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Lock,
  MapPin,
  Battery,
  Eye,
  CreditCard,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { soundFx } from '@/lib/soundFx';
import Link from 'next/link';

const categoryIcons: Record<string, React.ReactNode> = {
  'Privacy & Security': <Lock size={14} />,
  'Tracking & Accuracy': <MapPin size={14} />,
  'Battery & Device': <Battery size={14} />,
  'Features & Pricing': <CreditCard size={14} />,
  'Setup & Circles': <Users size={14} />,
};

const faqs = [
  {
    category: 'Privacy & Security',
    question: "Is my family's location data secure and private?",
    answer:
      'Yes, 100%. LocaLink uses end-to-end encrypted WebSocket connections. Your location coordinates are transmitted exclusively to members of your explicitly authorized private circles. We never sell, track, or share your data with advertisers or third parties.',
    highlights: ['end-to-end encrypted', 'explicitly authorized', 'never sell'],
  },
  {
    category: 'Tracking & Accuracy',
    question: 'How often does LocaLink update my location on the live map?',
    answer:
      'When active in transit, LocaLink updates GPS coordinates every 15 seconds with sub-20ms WebSocket latency. When stationary or connected to home Wi-Fi, it automatically throttles polling to preserve device battery while keeping your marker pin-sharp.',
    highlights: ['every 15 seconds', 'sub-20ms', 'automatically throttles'],
  },
  {
    category: 'Battery & Device',
    question: 'Will using LocaLink drain my phone battery during the day?',
    answer:
      'No. LocaLink utilizes intelligent motion-aware background geolocation algorithms. By dynamically adjusting GPS refresh frequencies based on accelerometer and network states, battery usage remains under 3% per full day during typical usage.',
    highlights: ['under 3%', 'motion-aware', 'dynamically adjusting'],
  },
  {
    category: 'Privacy & Security',
    question: 'How does Ghost Mode work?',
    answer:
      'Ghost Mode gives you total instant privacy. With one toggle, you can freeze your marker at your last known location, shift to approximate city-level radius, or completely hide your live status from specific circles whenever you desire privacy.',
    highlights: ['total instant privacy', 'one toggle', 'completely hide'],
  },
  {
    category: 'Features & Pricing',
    question: 'Is LocaLink free to use?',
    answer:
      'Yes! LocaLink is free forever for personal and family use with up to 5 circle members, real-time live map tracking, geofence safe zones, and 7-day location history playback. No credit card is required to start.',
    highlights: ['free forever', '5 circle members', 'No credit card'],
  },
  {
    category: 'Setup & Circles',
    question: 'How do I invite family members or friends?',
    answer:
      'Creating and sharing a circle takes under 30 seconds. Simply click "Create Circle", generate a unique 6-character invite code, or share a direct invite link via SMS, WhatsApp, or email.',
    highlights: ['under 30 seconds', '6-character invite code', 'direct invite link'],
  },
];

function highlightAnswer(answer: string, highlights: string[]) {
  if (!highlights?.length) return answer;

  const parts: (string | React.ReactNode)[] = [];
  let remaining = answer;
  let keyIdx = 0;

  for (const hl of highlights) {
    const idx = remaining.indexOf(hl);
    if (idx === -1) continue;
    if (idx > 0) parts.push(remaining.slice(0, idx));
    parts.push(
      <span
        key={keyIdx++}
        className="font-semibold text-violet-600 dark:text-violet-400"
      >
        {hl}
      </span>
    );
    remaining = remaining.slice(idx + hl.length);
  }
  if (remaining) parts.push(remaining);
  return parts;
}

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
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-violet-400/[0.06] dark:bg-violet-600/[0.08] blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-400/[0.04] dark:bg-indigo-500/[0.06] blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 text-xs font-bold shadow-2xs mb-5 backdrop-blur-sm">
            <HelpCircle size={14} />
            <span>Frequently Asked Questions</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.12] mb-4">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              know
            </span>
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-xl mx-auto font-normal leading-relaxed">
            Have questions about LocaLink real-time GPS tracking, safe zones, or privacy? We have clear answers.
          </p>
        </motion.div>

        {/* FAQ accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            const icon = categoryIcons[faq.category];
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group relative"
              >
                {/* Active glow ring */}
                {isOpen && (
                  <motion.div
                    layoutId="faq-glow"
                    className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-violet-500/40 via-purple-500/30 to-indigo-500/40 dark:from-violet-500/30 dark:via-purple-500/20 dark:to-indigo-500/30 blur-[2px]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <div
                  className={cn(
                    'relative rounded-2xl bg-white dark:bg-[#0E1528] border transition-all duration-300 overflow-hidden',
                    isOpen
                      ? 'border-violet-400/60 dark:border-violet-600/50 shadow-lg shadow-violet-500/[0.06] dark:shadow-violet-500/[0.08]'
                      : 'border-slate-200/90 dark:border-slate-800/80 hover:border-violet-300/70 dark:hover:border-violet-800/60 shadow-sm hover:shadow-md'
                  )}
                >
                  <button
                    onClick={() => toggle(i)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer group/btn"
                  >
                    <span className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                      {/* Number indicator */}
                      <span
                        className={cn(
                          'hidden sm:flex items-center justify-center h-8 w-8 rounded-xl text-xs font-black shrink-0 transition-all duration-300',
                          isOpen
                            ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/30'
                            : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 group-hover/btn:bg-violet-50 dark:group-hover/btn:bg-violet-950/40 group-hover/btn:text-violet-500'
                        )}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      <span className="flex flex-col gap-1.5 min-w-0">
                        {/* Category badge */}
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md w-fit transition-colors duration-300',
                            isOpen
                              ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300'
                              : 'bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400'
                          )}
                        >
                          {icon}
                          {faq.category}
                        </span>
                        {/* Question text */}
                        <span
                          className={cn(
                            'font-bold text-[15px] sm:text-base leading-snug transition-colors duration-200',
                            isOpen
                              ? 'text-violet-700 dark:text-violet-300'
                              : 'text-slate-800 dark:text-slate-200 group-hover/btn:text-violet-600 dark:group-hover/btn:text-violet-400'
                          )}
                        >
                          {faq.question}
                        </span>
                      </span>
                    </span>

                    {/* Chevron */}
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className={cn(
                        'h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300',
                        isOpen
                          ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/25'
                          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 group-hover/btn:bg-violet-50 dark:group-hover/btn:bg-violet-950/40 group-hover/btn:text-violet-500'
                      )}
                    >
                      <ChevronDown size={16} strokeWidth={2.5} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <div className="px-5 sm:px-6 pb-6 pt-0">
                          {/* Gradient separator */}
                          <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-300/50 dark:via-violet-700/40 to-transparent mb-4" />

                          <div className="flex gap-3">
                            {/* Accent bar */}
                            <div className="hidden sm:block w-0.5 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500 shrink-0 self-stretch opacity-60" />

                            <p className="text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                              {highlightAnswer(faq.answer, faq.highlights)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Still have questions banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-14 relative group"
        >
          {/* Subtle glow behind banner */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 dark:from-violet-500/[0.07] dark:via-purple-500/[0.05] dark:to-indigo-500/[0.07] blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0E1528] border border-slate-200/90 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-5 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }} />
            </div>

            <div className="relative flex items-center gap-4 text-left">
              <div className="hidden sm:flex h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 items-center justify-center shrink-0 shadow-lg shadow-violet-500/25">
                <MessageCircle size={22} className="text-white" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                  Still have questions?
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Our support team is online 24/7 to assist your family or team.
                </p>
              </div>
            </div>

            <Link
              href="/contact"
              className="relative px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold transition-all duration-300 shrink-0 cursor-pointer shadow-lg shadow-violet-600/25 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group/btn"
            >
              {/* Shimmer */}
              <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              <span className="relative flex items-center gap-2">
                <MessageCircle size={14} />
                Get in Touch
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
