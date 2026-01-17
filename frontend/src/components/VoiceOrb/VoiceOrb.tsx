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

    // Premium motion - scale based on state
    const getScale = () => {
        if (state === 'listening') {
            // Outward pulse with volume (red state)
            return 1 + (normalizedVolume * 0.12); // Reduced from 0.15 for subtlety
        }
        return 1;
    };

    return (
        <div className="relative flex items-center justify-center">
            {/* Subtle glow effect - reduced opacity for premium feel */}
            <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                    background: stateConfig.glowColor,
                    filter: `blur(${tokens.orb.glow.blur})`,
                }}
                animate={{
                    opacity: state === 'idle' ? 0 : [0.2, 0.4, 0.2],
                    scale: state === 'idle' ? 0.8 : [0.95, 1.05, 0.95],
                }}
                transition={{
                    duration: stateConfig.pulseSpeed,
                    repeat: Infinity,
                    ease: tokens.animation.easing.standard,
                }}
            />

            {/* Outer concentric rings - only for active states */}
            {state !== 'idle' && (
                <>
                    <motion.div
                        className="absolute rounded-full border"
                        style={{
                            width: '320px',
                            height: '320px',
                            borderColor: stateConfig.color,
                            borderWidth: tokens.orb.borderWidth,
                        }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{
                            opacity: [0, stateConfig.ringOpacity, 0],
                            scale: [0.9, 1.12, 1.25],
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: tokens.animation.easing.decelerate,
                        }}
                    />
                    <motion.div
                        className="absolute rounded-full border"
                        style={{
                            width: '320px',
                            height: '320px',
                            borderColor: stateConfig.color,
                            borderWidth: tokens.orb.borderWidth,
                        }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{
                            opacity: [0, stateConfig.ringOpacity, 0],
                            scale: [0.9, 1.12, 1.25],
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: tokens.animation.easing.decelerate,
                            delay: 0.8,
                        }}
                    />
                </>
            )}

            {/* Main orb - perfect circular geometry */}
            <motion.button
                onClick={onClick}
                className="relative rounded-full"
                style={{
                    width: tokens.orb.size.desktop,
                    height: tokens.orb.size.desktop,
                    backgroundColor: tokens.colors.surface,
                    border: `${tokens.orb.borderWidth} solid ${stateConfig.color}`,
                }}
                animate={{
                    scale: getScale(),
                    borderColor: stateConfig.color,
                }}
                whileHover={{
                    scale: 1.03, // Reduced from 1.05 for subtlety
                }}
                whileTap={{
                    scale: 0.97, // Reduced from 0.95
                }}
                transition={{
                    duration: tokens.animation.duration.normal / 1000,
                    ease: tokens.animation.easing.standard,
                }}
            >
                {/* Subtle internal gradient */}
                <div
                    className="absolute inset-2 rounded-full pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at 35% 35%, ${stateConfig.color}12, transparent 65%)`,
                    }}
                />

                {/* Center core - state-specific behavior */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {/* Idle: Subtle breathing */}
                    {state === 'idle' && (
                        <motion.div
                            className="rounded-full"
                            style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: stateConfig.color,
                                opacity: 0.15,
                            }}
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.15, 0.25, 0.15],
                            }}
                            transition={{
                                duration: stateConfig.pulseSpeed,
                                repeat: Infinity,
                                ease: tokens.animation.easing.standard,
                            }}
                        />
                    )}

                    {/* Listening: Volume bars */}
                    {state === 'listening' && (
                        <div className="flex items-center justify-center gap-1.5">
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="rounded-full"
                                    style={{
                                        width: '3px',
                                        backgroundColor: tokens.colors.userPrimary,
                                    }}
                                    animate={{
                                        height: `${12 + normalizedVolume * 36}px`,
                                    }}
                                    transition={{
                                        duration: 0.08,
                                        delay: i * 0.04,
                                        ease: tokens.animation.easing.standard,
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Processing: VERY PROMINENT green pulsing animation */}
                    {state === 'processing' && (
                        <>
                            {/* Large outer glow */}
                            <motion.div
                                className="rounded-full absolute"
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    backgroundColor: '#10b981', // Emerald green
                                    opacity: 0.3,
                                    filter: 'blur(20px)',
                                }}
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.3, 0.5, 0.3],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: tokens.animation.easing.standard,
                                }}
                            />
                            {/* Outer rotating ring */}
                            <motion.div
                                className="rounded-full absolute"
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    backgroundColor: '#22c55e', // Bright green
                                    opacity: 0.6,
                                }}
                                animate={{
                                    scale: [1, 1.25, 1],
                                    opacity: [0.6, 0.8, 0.6],
                                    rotate: [0, 180, 360],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: tokens.animation.easing.standard,
                                }}
                            />
                            {/* Middle pulsing sphere */}
                            <motion.div
                                className="rounded-full absolute"
                                style={{
                                    width: '70px',
                                    height: '70px',
                                    backgroundColor: '#4ade80', // Very bright green
                                    opacity: 0.8,
                                }}
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.8, 1, 0.8],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: tokens.animation.easing.standard,
                                    delay: 0.3,
                                }}
                            />
                            {/* Inner bright core - NEON GREEN */}
                            <motion.div
                                className="rounded-full absolute"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: '#86efac', // Neon green
                                    opacity: 1,
                                    boxShadow: '0 0 30px rgba(34, 197, 94, 0.8)',
                                }}
                                animate={{
                                    scale: [1, 0.85, 1],
                                    opacity: [1, 0.9, 1],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: tokens.animation.easing.standard,
                                    delay: 0.6,
                                }}
                            />
                        </>
                    )}

                    {/* Responding/Speaking: Smooth concentric waves */}
                    {(state === 'responding' || state === 'speaking') && (
                        <svg
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            viewBox="0 0 280 280"
                            fill="none"
                        >
                            {[...Array(3)].map((_, i) => (
                                <motion.circle
                                    key={i}
                                    cx="140"
                                    cy="140"
                                    r={35 + i * 20}
                                    stroke={tokens.colors.aiPrimary}
                                    strokeWidth="1.5"
                                    fill="none"
                                    initial={{ opacity: 0.5 }}
                                    animate={{
                                        opacity: [0.5, 0.2, 0.5],
                                        r: [35 + i * 20, 42 + i * 20, 35 + i * 20],
                                    }}
                                    transition={{
                                        duration: stateConfig.pulseSpeed,
                                        repeat: Infinity,
                                        ease: tokens.animation.easing.standard,
                                        delay: i * 0.25,
                                    }}
                                />
                            ))}
                        </svg>
                    )}
                </div>
            </motion.button>

            {/* State label - low contrast, secondary */}
            <motion.div
                className="absolute -bottom-16 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: tokens.animation.duration.normal / 1000,
                    ease: tokens.animation.easing.standard,
                }}
            >
                <span
                    className="text-sm font-medium tracking-wide"
                    style={{
                        color: tokens.colors.textSecondary,
                        fontWeight: tokens.typography.fontWeight.medium,
                    }}
                >
                    {stateConfig.label}
                </span>
            </motion.div>
        </div>
    );
}
