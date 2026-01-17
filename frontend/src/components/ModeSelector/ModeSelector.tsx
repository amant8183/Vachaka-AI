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
            className="min-h-screen flex items-center justify-center p-8"
            style={{ backgroundColor: tokens.colors.background }}
        >
            <div className="max-w-4xl w-full space-y-12">
                {/* Header */}
                <motion.div
                    className="text-center space-y-3"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1
                        className="text-5xl font-bold tracking-tight"
                        style={{ color: tokens.colors.textPrimary }}
                    >
                        Voice AI
                    </h1>
                    <p
                        className="text-base"
                        style={{ color: tokens.colors.textSecondary }}
                    >
                        Choose your conversation mode
                    </p>
                </motion.div>

                {/* Mode cards */}
                <div className="grid md:grid-cols-2 gap-6">
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
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <p
                        className="text-center text-sm font-medium"
                        style={{ color: tokens.colors.textSecondary }}
                    >
                        AI Voice Provider
                    </p>
                    <div className="flex justify-center gap-3">
                        {ttsProviders.map((provider) => (
                            <button
                                key={provider.id}
                                onClick={() => setSelectedTtsProvider(provider.id)}
                                className="px-6 py-3 rounded-lg transition-all text-sm font-medium"
                                style={{
                                    backgroundColor: selectedTtsProvider === provider.id
                                        ? tokens.colors.surface
                                        : 'transparent',
                                    border: `1px solid ${selectedTtsProvider === provider.id
                                        ? tokens.colors.userPrimary
                                        : tokens.colors.border}`,
                                    color: selectedTtsProvider === provider.id
                                        ? tokens.colors.textPrimary
                                        : tokens.colors.textSecondary,
                                }}
                            >
                                <div className="text-center">
                                    <div>{provider.name}</div>
                                    <div className="text-xs opacity-70 mt-1">{provider.description}</div>
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
            className="group relative p-8 rounded-xl text-left overflow-hidden"
            style={{
                backgroundColor: tokens.colors.surface,
                border: `1px solid ${tokens.colors.border}`,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Hover glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(circle at 50% 0%, ${mode.accent}15, transparent 70%)`,
                }}
            />

            {/* Content */}
            <div className="relative space-y-4">
                {/* Icon */}
                <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                        backgroundColor: `${mode.accent}20`,
                    }}
                >
                    <Icon className="w-6 h-6" style={{ color: mode.accent }} />
                </div>

                {/* Text */}
                <div className="space-y-2">
                    <h3
                        className="text-2xl font-semibold"
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
                <div className="pt-2">
                    <motion.div
                        className="inline-flex items-center gap-2 text-sm font-medium"
                        style={{ color: mode.accent }}
                        initial={{ x: 0 }}
                        whileHover={{ x: 4 }}
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
                    </motion.div>
                </div>
            </div>
        </motion.button>
    );
}
