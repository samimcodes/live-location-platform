'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'Is my location data secure and private?',
    answer: 'Yes! LocaLink uses end-to-end encrypted WebSocket connections. Your location data is shared only with people in your explicitly approved private circles. We never sell or share your location data with third parties.',
  },
  {
    question: 'How often does LocaLink update my location on the map?',
    answer: 'When active, LocaLink updates your GPS coordinates approximately every 15 seconds with high accuracy. When you are stationary, it adjusts to conserve battery while keeping your marker updated.',
  },
  {
    question: 'Will using LocaLink drain my phone battery?',
    answer: 'LocaLink is built with intelligent battery optimization algorithms. By dynamically throttling GPS polling based on motion sensors and movement speed, battery consumption is kept minimal.',
  },
  {
    question: 'Can I stop sharing my location anytime?',
    answer: 'Absolutely. You can toggle Ghost Mode on or off at any moment, freeze your last known location, or customize location sharing preferences for specific friends and circles.',
  },
  {
    question: 'Is LocaLink free to use?',
    answer: 'Yes, LocaLink is free forever for personal use with up to 5 circle members, real-time map updates, and 7-day location history playback. Premium tiers will be available for larger teams and extended history.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-muted/20 border-t border-border/40 scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <HelpCircle size={14} />
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            Everything you need to know
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Got questions about LocaLink? We have answers. If you need more help, feel free to reach out.
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
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-foreground text-base sm:text-lg hover:text-primary transition-colors"
                >
                  <span>{faq.question}</span>
                  <div className={cn(
                    "h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center shrink-0 transition-transform duration-300",
                    isOpen && "rotate-180 bg-primary/10 text-primary"
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
                      <div className="px-6 pb-6 pt-0 text-muted-foreground text-sm leading-relaxed border-t border-border/30 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
