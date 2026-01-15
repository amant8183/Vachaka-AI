'use client';

import { motion } from 'framer-motion';
import { tokens, voiceStates, type VoiceState } from '@/lib/design-tokens';

interface VoiceOrbProps {
    state: VoiceState;
    volume?: number; // 0-255 for visual feedback
    onClick?: () => void;
}

export function VoiceOrb({ state, volume = 0, onClick }: VoiceOrbProps) {
    const stateConfig = voiceStates[state];

    // Normalize volume for visual scaling (0-1)
    const normalizedVolume = Math.min(volume / 255, 1);

    // Calculate dynamic scale based on state and volume
    const getScale = () => {
        if (state === 'listening') {
            return 1 + (normalizedVolume * 0.15); // Pulse outward with volume
        }
        if (state === 'speaking') {
            return 1 + (Math.sin(Date.now() / 400) * 0.08); // Smooth wave
        }
        return 1;
    };

    return (
        <div className="relative flex items-center justify-center">
            {/* Glow effect */}
            <motion.div
                className="absolute inset-0 rounded-full blur-[80px]"
                style={{
                    background: stateConfig.glowColor,
                }}
                animate={{
                    opacity: state === 'idle' ? 0 : [0.3, 0.6, 0.3],
                    scale: state === 'idle' ? 0.8 : [0.9, 1.1, 0.9],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Outer rings */}
            {state !== 'idle' && (
                <>
                    <motion.div
                        className="absolute rounded-full border"
                        style={{
                            width: '320px',
                            height: '320px',
                            borderColor: stateConfig.color,
                            borderWidth: '1px',
                        }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{
                            opacity: [0, stateConfig.ringOpacity, 0],
                            scale: [0.9, 1.15, 1.3],
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: 'easeOut',
                        }}
                    />
                    <motion.div
                        className="absolute rounded-full border"
                        style={{
                            width: '320px',
                            height: '320px',
                            borderColor: stateConfig.color,
                            borderWidth: '1px',
                        }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{
                            opacity: [0, stateConfig.ringOpacity, 0],
                            scale: [0.9, 1.15, 1.3],
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: 'easeOut',
                            delay: 0.8,
                        }}
                    />
                </>
            )}

            {/* Main orb */}
            <motion.button
                onClick={onClick}
                className="relative rounded-full"
                style={{
                    width: '280px',
                    height: '280px',
                    backgroundColor: tokens.colors.surface,
                    border: `2px solid ${stateConfig.color}`,
                }}
                animate={{
                    scale: getScale(),
                    borderColor: stateConfig.color,
                }}
                whileHover={{
                    scale: 1.05,
                }}
                whileTap={{
                    scale: 0.95,
                }}
                transition={{
                    duration: tokens.animation.duration.normal / 1000,
                    ease: tokens.animation.easing.easeInOut,
                }}
            >
                {/* Inner gradient */}
                <div
                    className="absolute inset-2 rounded-full"
                    style={{
                        background: `radial-gradient(circle at 30% 30%, ${stateConfig.color}15, transparent 70%)`,
                    }}
                />

                {/* Center indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        className="rounded-full"
                        style={{
                            width: '80px',
                            height: '80px',
                            backgroundColor: stateConfig.color,
                            opacity: state === 'idle' ? 0.2 : 0.6,
                        }}
                        animate={{
                            scale: state === 'processing' ? [1, 1.2, 1] : 1,
                            opacity: state === 'processing' ? [0.4, 0.7, 0.4] : state === 'idle' ? 0.2 : 0.6,
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: state === 'processing' ? Infinity : 0,
                            ease: 'easeInOut',
                        }}
                    />
                </div>

                {/* Volume bars for listening state */}
                {state === 'listening' && (
                    <div className="absolute inset-0 flex items-center justify-center gap-1.5">
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="rounded-full"
                                style={{
                                    width: '4px',
                                    backgroundColor: tokens.colors.userPrimary,
                                }}
                                animate={{
                                    height: `${10 + normalizedVolume * 40}px`,
                                }}
                                transition={{
                                    duration: 0.1,
                                    delay: i * 0.05,
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Wave pattern for speaking state */}
                {state === 'speaking' && (
                    <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 280 280"
                        fill="none"
                    >
                        {[...Array(3)].map((_, i) => (
                            <motion.circle
                                key={i}
                                cx="140"
                                cy="140"
                                r={40 + i * 25}
                                stroke={tokens.colors.aiPrimary}
                                strokeWidth="2"
                                fill="none"
                                initial={{ opacity: 0.6 }}
                                animate={{
                                    opacity: [0.6, 0.2, 0.6],
                                    r: [40 + i * 25, 50 + i * 25, 40 + i * 25],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: i * 0.3,
                                }}
                            />
                        ))}
                    </svg>
                )}
            </motion.button>

            {/* State label */}
            <motion.div
                className="absolute -bottom-16 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <span
                    className="text-sm font-medium tracking-wide"
                    style={{ color: tokens.colors.textSecondary }}
                >
                    {stateConfig.label}
                </span>
            </motion.div>
        </div>
    );
}
