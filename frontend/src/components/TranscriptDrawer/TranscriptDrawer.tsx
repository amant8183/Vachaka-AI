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
                backgroundColor: tokens.colors.surface,
                borderTop: `1px solid ${tokens.colors.border}`,
            }}
        >
            {/* Toggle handle */}
            <button
                onClick={onToggle}
                className="w-full py-3 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                style={{
                    color: tokens.colors.textSecondary,
                }}
            >
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                >
                    <ChevronUp className="w-5 h-5" />
                </motion.div>
                <span className="text-sm font-medium tracking-wide">
                    {isOpen ? 'Hide' : 'Show'} Transcript
                </span>
                <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                        backgroundColor: tokens.colors.surfaceHover,
                        color: tokens.colors.textTertiary,
                    }}
                >
                    {messages.length}
                </span>
            </button>

            {/* Drawer content */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: '400px', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: tokens.animation.easing.easeInOut }}
                        className="overflow-hidden"
                    >
                        <div
                            className="h-full overflow-y-auto px-6 py-4 space-y-3"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: `${tokens.colors.textTertiary} transparent`,
                            }}
                        >
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div
                                        className="text-sm"
                                        style={{ color: tokens.colors.textTertiary }}
                                    >
                                        No messages yet. Start speaking to begin.
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex gap-3"
        >
            {/* Avatar indicator */}
            <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                    backgroundColor: isUser ? tokens.colors.userPrimary : tokens.colors.aiPrimary,
                    opacity: 0.3,
                }}
            >
                {isUser && <MicIcon className="w-3 h-3" style={{ color: tokens.colors.textPrimary }} />}
                {!isUser && (
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: tokens.colors.textPrimary }}
                    />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                    <span
                        className="text-xs font-medium tracking-wide"
                        style={{ color: tokens.colors.textSecondary }}
                    >
                        {isUser ? 'You' : 'AI'}
                    </span>
                    {message.metadata?.isVoice && (
                        <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{
                                backgroundColor: tokens.colors.surfaceHover,
                                color: tokens.colors.textTertiary,
                            }}
                        >
                            Voice
                        </span>
                    )}
                </div>
                <p
                    className="text-sm leading-relaxed"
                    style={{
                        color: tokens.colors.textPrimary,
                        opacity: isStreaming ? 0.7 : 1,
                    }}
                >
                    {message.content}
                    {isStreaming && (
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            _
                        </motion.span>
                    )}
                </p>
            </div>
        </motion.div>
    );
}
