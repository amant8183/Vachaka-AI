'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: tokens.colors.background }}
    >
      <motion.div
        className="text-center max-w-xl space-y-12"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: tokens.animation.duration.slower / 1000,
          ease: tokens.animation.easing.standard,
        }}
      >
        {/* Product name */}
        <div className="space-y-3">
          <h1
            className="text-5xl font-semibold tracking-tight"
            style={{
              color: tokens.colors.textPrimary,
              fontWeight: tokens.typography.fontWeight.semibold,
            }}
          >
            Voice AI
          </h1>
          <p
            className="text-base leading-relaxed"
            style={{
              color: tokens.colors.textTertiary,
              fontWeight: tokens.typography.fontWeight.normal,
            }}
          >
            Voice-first conversations with AI
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="inline-block"
        >
          <motion.div
            className="px-8 py-3 rounded-full text-sm font-medium tracking-wide"
            style={{
              backgroundColor: tokens.colors.userPrimary,
              color: tokens.colors.textPrimary,
              fontWeight: tokens.typography.fontWeight.medium,
            }}
            whileHover={{
              scale: 1.02,
              backgroundColor: tokens.colors.userSecondary,
            }}
            whileTap={{ scale: 0.98 }}
            transition={{
              duration: tokens.animation.duration.fast / 1000,
              ease: tokens.animation.easing.standard,
            }}
          >
            Enter
          </motion.div>
        </Link>
      </motion.div>
    </main>
  );
}
