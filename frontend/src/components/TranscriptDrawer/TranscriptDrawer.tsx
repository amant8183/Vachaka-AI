'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Mic as MicIcon } from 'lucide-react';
import { tokens } from '@/lib/design-tokens';
import { Message } from '@/types';

interface TranscriptDrawerProps {
    messages: Message[];
    streamingMessage?: string;
    isOpen: boolean;
    onToggle: () => void;
}

export function TranscriptDrawer({
    messages,
    streamingMessage,
    isOpen,
    onToggle,
}: TranscriptDrawerProps) {
    return (
        <motion.div
            className="fixed bottom-0 left-0 right-0 z-30"
            initial={false}
            style={{
                backgroundColor: tokens.colors.surfaceSubtle,
                borderTop: `1px solid ${tokens.colors.border}`,
            }}
        >
            {/* Minimal toggle handle */}
            <button
                onClick={onToggle}
                className="w-full py-2.5 flex items-center justify-center gap-2 hover:bg-white/[0.02] transition-colors"
                style={{
                    color: tokens.colors.textTertiary,
                }}
            >
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{
                        duration: tokens.animation.duration.normal / 1000,
                        ease: tokens.animation.easing.standard,
                    }}
                >
                    <ChevronUp className="w-4 h-4" />
                </motion.div>
                <span
                    className="text-xs font-medium tracking-wider uppercase"
                    style={{ fontWeight: tokens.typography.fontWeight.medium }}
                >
                    Transcript
                </span>
                {messages.length > 0 && (
                    <span
                        className="text-xs px-1.5 py-0.5 rounded-full tabular-nums"
                        style={{
                            backgroundColor: tokens.colors.surface,
                            color: tokens.colors.textTertiary,
                        }}
                    >
                        {messages.length}
                    </span>
                )}
            </button>

            {/* Collapsed transcript content */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: '360px', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                            duration: tokens.animation.duration.slow / 1000,
                            ease: tokens.animation.easing.standard,
                        }}
                        className="overflow-hidden"
                    >
                        <div
                            className="h-full overflow-y-auto px-6 py-4 space-y-4"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: `${tokens.colors.border} transparent`,
                            }}
                        >
                            {messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <div
                                        className="text-xs tracking-wide"
                                        style={{
                                            color: tokens.colors.textTertiary,
                                            fontWeight: tokens.typography.fontWeight.normal,
                                        }}
                                    >
                                        No conversation yet
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg, idx) => (
                                        <TranscriptMessage key={idx} message={msg} />
                                    ))}

                                    {/* Streaming message */}
                                    {streamingMessage && (
                                        <TranscriptMessage
                                            message={{
                                                role: 'assistant',
                                                content: streamingMessage,
                                                timestamp: new Date(),
                                            }}
                                            isStreaming
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

interface TranscriptMessageProps {
    message: Message;
    isStreaming?: boolean;
}

function TranscriptMessage({ message, isStreaming }: TranscriptMessageProps) {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: tokens.animation.duration.fast / 1000,
                ease: tokens.animation.easing.standard,
            }}
            className="flex gap-3"
        >
            {/* Minimal indicator - no avatars */}
            <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{
                    backgroundColor: isUser ? tokens.colors.userPrimary : tokens.colors.aiPrimary,
                    opacity: 0.2,
                }}
            >
                {isUser && <MicIcon className="w-2.5 h-2.5" style={{ color: tokens.colors.textPrimary, opacity: 0.6 }} />}
                {!isUser && (
                    <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: tokens.colors.textPrimary, opacity: 0.6 }}
                    />
                )}
            </div>

            {/* Content - low contrast, supporting */}
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                    <span
                        className="text-xs font-medium tracking-wide"
                        style={{
                            color: tokens.colors.textTertiary,
                            fontWeight: tokens.typography.fontWeight.medium,
                        }}
                    >
                        {isUser ? 'You' : 'AI'}
                    </span>
                </div>
                <p
                    className="text-sm leading-relaxed"
                    style={{
                        color: tokens.colors.textSecondary,
                        opacity: isStreaming ? 0.6 : 0.85,
                        fontWeight: tokens.typography.fontWeight.normal,
                    }}
                >
                    {message.content}
                    {isStreaming && (
                        <motion.span
                            animate={{ opacity: [0.3, 0.8, 0.3] }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                ease: tokens.animation.easing.standard,
                            }}
                        >
                            _
                        </motion.span>
                    )}
                </p>
            </div>
        </motion.div>
    );
}
