'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Brain, } from 'lucide-react';
import { tokens } from '@/lib/design-tokens';
import { ConversationMode } from '@/types';

interface ModeSelectorProps {
    onSelectMode: (mode: ConversationMode, ttsProvider: "groq" | "deepgram") => void;
}

export function ModeSelector({ onSelectMode }: ModeSelectorProps) {
    const [selectedTtsProvider, setSelectedTtsProvider] = useState<"groq" | "deepgram">("deepgram");

    const modes = [
        {
            id: 'casual' as ConversationMode,
            icon: MessageSquare,
            title: 'Casual',
            description: 'Relaxed conversation for general topics',
            accent: tokens.colors.userPrimary,
        },
        {
            id: 'interview' as ConversationMode,
            icon: Brain,
            title: 'Interview',
            description: 'Professional interview practice with feedback',
            accent: tokens.colors.aiPrimary,
        },
    ];

    const ttsProviders = [
        { id: 'groq' as const, name: 'Groq (Orpheus)', description: 'Natural, expressive' },
        { id: 'deepgram' as const, name: 'Deepgram (Aura)', description: 'Professional, clear' },
    ];

    return (
        <div
            className="min-h-screen flex items-center justify-center pt-15 sm:pt-20 md:pt-10 pb-4 sm:pb-6 md:pb-8 px-6 sm:px-16 md:px-8 relative"
            style={{ backgroundColor: tokens.colors.background }}
        >
            {/* Diagonal grid overlay */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 50px, ${tokens.colors.textPrimary} 50px, ${tokens.colors.textPrimary} 51px), repeating-linear-gradient(-45deg, transparent, transparent 50px, ${tokens.colors.textPrimary} 50px, ${tokens.colors.textPrimary} 51px)`,
                }}
            />

            <div className="max-w-4xl w-full space-y-8 sm:space-y-10 md:space-y-12 relative z-10">
                {/* Header */}
                <motion.div
                    className="text-center space-y-2 sm:space-y-3 md:space-y-4 px-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1
                        className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
                        style={{
                            color: tokens.colors.textPrimary,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Vachaka AI
                    </h1>
                    <p
                        className="text-base sm:text-lg"
                        style={{ color: tokens.colors.textSecondary }}
                    >
                        Choose your conversation mode
                    </p>
                </motion.div>

                {/* Mode cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                    {modes.map((mode, index) => (
                        <ModeCard
                            key={mode.id}
                            mode={mode}
                            onSelect={() => onSelectMode(mode.id, selectedTtsProvider)}
                            delay={index * 0.1}
                        />
                    ))}
                </div>

                {/* TTS Provider selector */}
                <motion.div
                    className="space-y-3 sm:space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <p
                        className="text-center text-xs sm:text-sm font-medium uppercase tracking-wider"
                        style={{ color: tokens.colors.textTertiary }}
                    >
                        AI Voice Provider
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 px-2">
                        {ttsProviders.map((provider) => (
                            <button
                                key={provider.id}
                                onClick={() => setSelectedTtsProvider(provider.id)}
                                className="group relative px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 text-sm font-medium overflow-hidden w-full sm:w-auto"
                                style={{
                                    backgroundColor: '#0a0a0b',
                                    border: `1.5px solid ${selectedTtsProvider === provider.id
                                        ? 'rgba(220, 38, 38, 0.5)'
                                        : tokens.colors.border}`,
                                    color: selectedTtsProvider === provider.id
                                        ? tokens.colors.textPrimary
                                        : tokens.colors.textSecondary,
                                }}
                            >
                                {/* Hover effect */}
                                {selectedTtsProvider !== provider.id && (
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        style={{
                                            backgroundColor: 'rgba(220, 38, 38, 0.05)',
                                        }}
                                    />
                                )}
                                <div className="text-center relative z-10">
                                    <div className="font-semibold">{provider.name}</div>
                                    <div
                                        className="text-xs mt-1"
                                        style={{
                                            color: selectedTtsProvider === provider.id
                                                ? tokens.colors.textSecondary
                                                : tokens.colors.textTertiary
                                        }}
                                    >
                                        {provider.description}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

interface ModeCardProps {
    mode: {
        id: ConversationMode;
        icon: typeof MessageSquare;
        title: string;
        description: string;
        accent: string;
    };
    onSelect: () => void;
    delay: number;
}

function ModeCard({ mode, onSelect, delay }: ModeCardProps) {
    const Icon = mode.icon;

    return (
        <motion.button
            onClick={onSelect}
            className="group relative p-6 sm:p-7 md:p-8 rounded-xl text-left overflow-hidden transition-all duration-300"
            style={{
                backgroundColor: '#0a0a0b',
                border: `1px solid ${tokens.colors.border}`,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1, delay }}
            whileHover={{
                scale: 1.02,
                borderColor: mode.accent,
            }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Hover glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(circle at 50% 0%, ${mode.accent}10, transparent 70%)`,
                }}
            />

            {/* Content */}
            <div className="relative space-y-4 sm:space-y-5 md:space-y-6">
                {/* Icon */}
                <div
                    className="w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                        backgroundColor: `${mode.accent}15`,
                        border: `1px solid ${mode.accent}30`,
                    }}
                >
                    <Icon className="w-6 h-6 sm:w-6.5 sm:h-6.5 md:w-7 md:h-7" style={{ color: mode.accent }} />
                </div>

                {/* Text */}
                <div className="space-y-2">
                    <h3
                        className="text-xl sm:text-2xl font-bold"
                        style={{ color: tokens.colors.textPrimary }}
                    >
                        {mode.title}
                    </h3>
                    <p
                        className="text-sm leading-relaxed"
                        style={{ color: tokens.colors.textSecondary }}
                    >
                        {mode.description}
                    </p>
                </div>

                {/* Arrow indicator */}
                <div className="pt-1 sm:pt-2">
                    <div
                        className="inline-flex items-center gap-2 text-sm font-medium group-hover:translate-x-1 transition-transform duration-300"
                        style={{ color: mode.accent }}
                    >
                        Start
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </motion.button>
    );
}
