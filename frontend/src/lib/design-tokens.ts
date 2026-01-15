// Design tokens for voice-first interface
// Premium, production-ready token system

export const tokens = {
    // Colors - Dark theme only, no bright whites
    colors: {
        // Base
        background: '#0a0a0a',  // Near black
        surface: '#111111',     // Slightly lighter
        surfaceHover: '#1a1a1a',
        surfaceSubtle: '#0d0d0d',

        // Accent - User (Red)
        userPrimary: '#dc2626',      // Red-600
        userSecondary: '#991b1b',    // Red-800
        userGlow: 'rgba(220, 38, 38, 0.2)', // Reduced for premium feel

        // Accent - AI (Blue)
        aiPrimary: '#1e40af',        // Blue-800
        aiSecondary: '#1e3a8a',      // Blue-900
        aiGlow: 'rgba(30, 64, 175, 0.2)', // Reduced for premium feel

        // Accent - Processing (Subtle Green)
        processingPrimary: '#15803d',    // Green-700
        processingSecondary: '#166534',  // Green-800
        processingGlow: 'rgba(21, 128, 61, 0.15)', // Very subtle

        // Neutral (No bright whites - max #e5e5e5)
        textPrimary: '#e5e5e5',      // Gray-200 - brightest allowed
        textSecondary: '#737373',    // Gray-500
        textTertiary: '#404040',     // Gray-700
        border: '#262626',           // Gray-800
        borderHover: '#404040',      // Gray-700
    },

    // Spacing - Intentional, no magic numbers
    spacing: {
        xs: '0.25rem',   // 4px
        sm: '0.5rem',    // 8px
        md: '1rem',      // 16px
        lg: '1.5rem',    // 24px
        xl: '2rem',      // 32px
        '2xl': '3rem',   // 48px
        '3xl': '4rem',   // 64px
        '4xl': '6rem',   // 96px
        '5xl': '8rem',   // 128px
    },

    // Typography
    typography: {
        fontFamily: {
            sans: 'var(--font-geist-sans)',
            mono: 'var(--font-geist-mono)',
        },
        fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
        },
        lineHeight: {
            tight: '1.25',
            normal: '1.5',
            relaxed: '1.75',
        },
        fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
        },
    },

    // Animation - 60fps, ease-in-out only
    animation: {
        duration: {
            instant: 0,
            fast: 150,
            normal: 250,
            slow: 400,
            slower: 600,
        },
        // Cubic bezier curves - ease-in-out only, no bounce
        easing: {
            standard: [0.4, 0, 0.2, 1],  // Primary easing
            emphasized: [0.4, 0, 0.1, 1], // Slightly more dramatic
            decelerate: [0, 0, 0.2, 1],   // Ease out
        },
    },

    // Voice Orb specific
    orb: {
        size: {
            mobile: '200px',
            desktop: '280px',
        },
        glow: {
            blur: '60px',   // Reduced from 80px for subtlety
            spread: '30px', // Reduced from 40px
        },
        borderWidth: '1.5px', // Intentional, not 2px
    },
} as const;

// Voice states with premium visual properties
export type VoiceState = 'idle' | 'listening' | 'speaking' | 'processing' | 'responding';

export const voiceStates = {
    idle: {
        color: tokens.colors.surface,
        glowColor: 'transparent',
        ringOpacity: 0,
        pulseSpeed: 3, // Breathing animation duration (seconds)
        label: 'Ready',
    },
    listening: {
        color: tokens.colors.userPrimary,
        glowColor: tokens.colors.userGlow,
        ringOpacity: 0.3,
        pulseSpeed: 1.5,
        label: 'Listening',
    },
    processing: {
        color: tokens.colors.processingPrimary,
        glowColor: tokens.colors.processingGlow,
        ringOpacity: 0.25,
        pulseSpeed: 2,
        label: 'Thinking',
    },
    responding: {
        color: tokens.colors.aiPrimary,
        glowColor: tokens.colors.aiGlow,
        ringOpacity: 0.3,
        pulseSpeed: 1.8,
        label: 'Speaking',
    },
    // Legacy alias for 'responding'
    speaking: {
        color: tokens.colors.aiPrimary,
        glowColor: tokens.colors.aiGlow,
        ringOpacity: 0.3,
        pulseSpeed: 1.8,
        label: 'Speaking',
    },
} as const;
