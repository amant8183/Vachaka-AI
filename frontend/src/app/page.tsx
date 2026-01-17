'use client';

import Link from 'next/link';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';
import { useEffect } from 'react';

export default function Home() {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, 100, { duration: 2, delay: 0.5 });
    return animation.stop;
  }, []);

  return (
    <main
      className="min-h-screen relative flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-0"
      style={{ backgroundColor: tokens.colors.background }}
    >
      {/* Subtle diagonal grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 50px, ${tokens.colors.textPrimary} 50px, ${tokens.colors.textPrimary} 51px), repeating-linear-gradient(-45deg, transparent, transparent 50px, ${tokens.colors.textPrimary} 50px, ${tokens.colors.textPrimary} 51px)`,
        }}
      />

      <div className="relative z-10 max-w-5xl w-full">
        {/* Main content container */}
        <div className="flex flex-col items-center text-center space-y-8 sm:space-y-10 md:space-y-12">

          {/* Category label */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: tokens.colors.textTertiary }}
            >
              Production-Ready Voice AI
            </span>
          </motion.div>

          {/* Hero text */}
          <motion.div
            className="space-y-4 sm:space-y-6 max-w-3xl px-4 sm:px-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
              style={{
                color: tokens.colors.textPrimary,
                letterSpacing: '-0.02em',
              }}
            >
              Voice conversations
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              that feel{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                natural
              </span>
            </h1>

            <p
              className="text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto px-2 sm:px-0"
              style={{
                color: tokens.colors.textSecondary,
                fontWeight: 400,
              }}
            >
              Real-time speech recognition and synthesis powered by Groq and Deepgram.
              Start talking instantly—no setup required.
            </p>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {[
              { value: '<1s', label: 'Response time' },
              { value: '99.9%', label: 'Uptime' },
              { value: '24/7', label: 'Available' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div
                  className="text-xl sm:text-2xl font-bold tabular-nums"
                  style={{ color: tokens.colors.textPrimary }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-xs uppercase tracking-wider mt-1"
                  style={{ color: tokens.colors.textTertiary }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="pt-2 sm:pt-4"
          >
            <Link href="/dashboard">
              <motion.button
                className="group relative px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-medium text-sm sm:text-base overflow-hidden"
                style={{
                  backgroundColor: tokens.colors.userPrimary,
                  color: '#ffffff',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                {/* Hover gradient */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  }}
                />

                <span className="relative flex items-center gap-2">
                  Try it now
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust line */}
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-3 pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
                  style={{
                    backgroundColor: tokens.colors.surface,
                    borderColor: tokens.colors.background,
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      style={{ stroke: tokens.colors.textTertiary }}
                    />
                  </svg>
                </div>
              ))}
            </div>
            <p
              className="text-sm text-center sm:text-left"
              style={{ color: tokens.colors.textTertiary }}
            >
              Join others having natural voice conversations
            </p>
          </motion.div>
        </div>

        {/* Bottom feature highlights */}
        <motion.div
          className="hidden md:flex absolute bottom-12 left-0 right-0 justify-center gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          {[
            'Low latency',
            'High accuracy',
            'Natural voices',
          ].map((feature, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-sm"
              style={{ color: tokens.colors.textTertiary }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                  style={{ stroke: tokens.colors.userPrimary }}
                />
              </svg>
              {feature}
            </div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
