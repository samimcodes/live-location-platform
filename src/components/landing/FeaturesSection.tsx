'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Bell, Users, History, Shield, Smartphone, Navigation, Heart } from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'Live Location',
    description: 'See everyone on an interactive map updated every 15 seconds with GPS precision.',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Users,
    title: 'Family Groups',
    description: 'Organize friends and family into circles. Each circle has its own shared map view.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Get notified when loved ones arrive home, school, or any saved location.',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    icon: History,
    title: 'Location History',
    description: 'Review up to 30 days of location history with timeline playback.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Shield,
    title: 'Private & Secure',
    description: 'Your data is encrypted. You control who sees your location and when.',
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    icon: Navigation,
    title: 'Saved Places',
    description: 'Save frequently visited places like Home, Work, and School for quick alerts.',
    gradient: 'from-violet-500 to-purple-500',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Heart size={14} />
            Everything your family needs
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Features built for families
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            More than just a location app — LocaLink is your family&apos;s safety net.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group relative bg-card rounded-2xl border border-border/50 p-6 hover:shadow-lg hover:border-border transition-all duration-300"
            >
              <div className={`inline-flex h-12 w-12 rounded-xl bg-gradient-to-br ${f.gradient} items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <f.icon size={22} className="text-white" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
