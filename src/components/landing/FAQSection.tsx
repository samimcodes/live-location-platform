'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { soundFx } from '@/lib/soundFx';

type FAQTopic = 'All' | 'Privacy' | 'Tracking' | 'Plans';

interface FAQItem {
  topic: Exclude<FAQTopic, 'All'>;
  question: string;
  answer: string;
}

const topics: FAQTopic[] = ['All', 'Privacy', 'Tracking', 'Plans'];

const faqs: FAQItem[] = [
  {
    topic: 'Privacy',
    question: "Is my family's location data private and encrypted?",
    answer:
      'Yes. LocaLink transmits live coordinates over encrypted WebSocket connections exclusively to members of your authorized private circles. We never sell, rent, or share telemetry with third parties.',
  },
  {
    topic: 'Tracking',
    question: 'How does Turn-by-Turn Friend Navigation work?',
    answer:
      'LocaLink integrates OSRM routing directly into the live map. Select any circle member to calculate driving or walking maneuvers, ETA, live distance, and an interactive route polyline.',
  },
  {
    topic: 'Privacy',
    question: 'How does Timed Ghost Mode work?',
    answer:
      'Timed Ghost Mode lets you pause live GPS sharing for 1 hour, 8 hours, or freeze your marker at your current location until you choose to resume. Live updates resume automatically when the timer ends.',
  },
  {
    topic: 'Tracking',
    question: 'Will LocaLink drain my phone battery during the day?',
    answer:
      'No. Motion-aware geolocation and adaptive battery throttling ease GPS polling automatically when your device is stationary or battery drops below 15%.',
  },
  {
    topic: 'Tracking',
    question: 'Can we send voice notes and audio pings in circles?',
    answer:
      'Yes. Circle members can send quick voice notes and audio pings directly inside the live map dashboard, syncing in real time across mobile and desktop browsers.',
  },
  {
    topic: 'Tracking',
    question: 'What are Stay Points and GPX route exports?',
    answer:
      'Stay Points group clustered GPS pings to highlight meaningful stops along your route. You can replay your timeline and export any recorded path as a standard .GPX file anytime.',
  },
  {
    topic: 'Plans',
    question: 'How do I invite family members via WhatsApp or QR Code?',
    answer:
      'Every circle generates an instant invite link and scannable QR code. Family members can scan the code or tap the WhatsApp link to join your private circle in seconds.',
  },
  {
    topic: 'Plans',
    question: 'Is LocaLink free to use?',
    answer:
      'Yes. Free Circle includes up to 5 circle members, real-time map updates, Ghost Mode, 1-tap SOS alerts, and a 24-hour route timeline with no credit card required.',
  },
];

export function FAQSection() {
  const [selectedTopic, setSelectedTopic] = useState<FAQTopic>('All');
  const [query, setQuery] = useState('');
  const [openQuestion, setOpenQuestion] = useState<string | null>(faqs[0].question);

  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((item) => {
      const matchesTopic = selectedTopic === 'All' || item.topic === selectedTopic;
      const matchesQuery =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q);
      return matchesTopic && matchesQuery;
    });
  }, [selectedTopic, query]);

  const leftColumn = filteredFaqs.filter((_, i) => i % 2 === 0);
  const rightColumn = filteredFaqs.filter((_, i) => i % 2 === 1);

  const handleTopicChange = (topic: FAQTopic) => {
    if (topic === selectedTopic) return;
    soundFx?.playPop?.();
    setSelectedTopic(topic);
  };

  const toggleQuestion = (question: string) => {
    soundFx?.playPop?.();
    setOpenQuestion((prev) => (prev === question ? null : question));
  };

  const renderCard = (faq: FAQItem, idx: number) => {
    const isOpen = openQuestion === faq.question;
    const panelId = `faq-panel-${faq.topic}-${idx}`;

    return (
      <div
        key={faq.question}
        className={cn(
          'relative overflow-hidden rounded-2xl border transition-all duration-200',
          isOpen
            ? 'border-indigo-500/50 bg-white shadow-[0_14px_34px_-18px_rgba(79,70,229,0.28)] dark:border-indigo-400/40 dark:bg-[#0D1426]'
            : 'border-slate-200/85 bg-slate-50/60 hover:border-slate-300 hover:bg-white dark:border-white/[0.08] dark:bg-[#0D1426]/60 dark:hover:border-white/[0.16] dark:hover:bg-[#0D1426]'
        )}
      >
        {isOpen && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-6 top-0 h-[2px] rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400"
          />
        )}

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => toggleQuestion(faq.question)}
          className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left"
        >
          <span
            className={cn(
              'text-[15px] font-semibold leading-snug transition-colors',
              isOpen
                ? 'text-slate-950 dark:text-white'
                : 'text-slate-800 dark:text-slate-200'
            )}
          >
            {faq.question}
          </span>

          <span
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors',
              isOpen
                ? 'border-indigo-500/30 bg-indigo-600 text-white dark:bg-indigo-500'
                : 'border-slate-200 bg-white text-slate-500 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-slate-400'
            )}
          >
            <Plus
              className={cn(
                'h-3.5 w-3.5 transition-transform duration-200',
                isOpen && 'rotate-45'
              )}
            />
          </span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id={panelId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <p className="border-t border-slate-200/70 px-5 pb-5 pt-3.5 text-sm leading-relaxed text-slate-600 dark:border-white/[0.06] dark:text-slate-400">
                {faq.answer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <section
      id="faq"
      className="relative overflow-hidden scroll-mt-16 border-t border-slate-200/80 bg-white px-4 py-16 dark:border-white/[0.06] dark:bg-[#080D1A] sm:px-6 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        {/* Modern Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-[42px] lg:leading-[1.15]">
            Questions, answered
          </h2>
          <p className="mt-3.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
            Quick answers on privacy, GPS accuracy, battery efficiency, and circle management.
          </p>
        </div>

        {/* Modern Unified Topic + Search Toolbar */}
        <div className="mx-auto mt-9 flex max-w-3xl flex-col items-stretch justify-between gap-3 rounded-2xl border border-slate-200/85 bg-slate-50/70 p-2 dark:border-white/[0.08] dark:bg-[#0D1426] sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-1">
            {topics.map((topic) => {
              const active = selectedTopic === topic;
              return (
                <button
                  key={topic}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleTopicChange(topic)}
                  className={cn(
                    'relative rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors',
                    active
                      ? 'text-white dark:text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="faq-topic-pill"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      className="absolute inset-0 rounded-xl bg-slate-900 dark:bg-white"
                    />
                  )}
                  <span className="relative z-10">{topic}</span>
                </button>
              );
            })}
          </div>

          <div className="relative flex-1 sm:max-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter questions..."
              aria-label="Filter frequently asked questions"
              className="h-9 w-full rounded-xl border border-slate-200/80 bg-white pl-8 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500/60 focus:outline-none dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Balanced 2-Column Modern Bento Accordion Grid */}
        {filteredFaqs.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-200/80 bg-slate-50/50 py-10 text-center dark:border-white/[0.08] dark:bg-[#0D1426]/60">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No questions matched &ldquo;{query}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedTopic('All');
              }}
              className="mt-2 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 items-start gap-3.5 md:grid-cols-2">
            <div className="space-y-3.5">
              {leftColumn.map((faq, idx) => renderCard(faq, idx * 2))}
            </div>
            <div className="space-y-3.5">
              {rightColumn.map((faq, idx) => renderCard(faq, idx * 2 + 1))}
            </div>
          </div>
        )}

        {/* Minimal Support Link */}
        <p className="mt-10 text-center text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
          Still have a question?{' '}
          <a
            href="mailto:support@localink.app?subject=LocaLink%20Support%20Inquiry"
            onClick={() => soundFx?.playPop?.()}
            className="inline-flex items-center gap-1 font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Contact support
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </p>
      </div>
    </section>
  );
}
