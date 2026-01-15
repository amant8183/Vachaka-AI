'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { tokens } from '@/lib/design-tokens';

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: tokens.colors.background }}
    >
      <motion.div
        className="text-center space-y-8 px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1
          className="text-6xl font-bold tracking-tight"
          style={{ color: tokens.colors.textPrimary }}
        >
          Voice AI
        </h1>
        <p
          className="text-xl max-w-md mx-auto leading-relaxed"
          style={{ color: tokens.colors.textSecondary }}
        >
          Talk with your AI assistant — record, transcribe, and view all your interactions.
        </p>

        <Link
          href="/dashboard"
          className="inline-block px-10 py-4 rounded-full text-lg font-medium transition-all hover:scale-105 mt-8"
          style={{
            backgroundColor: tokens.colors.userPrimary,
            color: '#ffffff',
          }}
        >
          Get Started
        </Link>
      </motion.div>
    </main>
  );
}
