// Design tokens for voice-first interface
export const tokens = {
    // Colors - Dark theme only
    colors: {
        // Base
        background: '#0a0a0a',  // Near black
        surface: '#111111',     // Slightly lighter black
        surfaceHover: '#1a1a1a',

        // Accent - User
        userPrimary: '#dc2626',      // Red-600
        userSecondary: '#991b1b',    // Red-800
        userGlow: 'rgba(220, 38, 38, 0.3)',

        // Accent - AI
        aiPrimary: '#1e40af',        // Blue-800
        aiSecondary: '#1e3a8a',      // Blue-900
        aiGlow: 'rgba(30, 64, 175, 0.3)',

        // Neutral
        textPrimary: '#e5e5e5',      // Gray-200
        textSecondary: '#737373',    // Gray-500
        textTertiary: '#404040',     // Gray-700
        border: '#262626',           // Gray-800
        borderHover: '#404040',      // Gray-700
    },

    // Spacing
    spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem',
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
    },

    // Animation
    animation: {
        duration: {
            fast: 150,
            normal: 250,
            slow: 400,
        },
        easing: {
            ease: [0.25, 0.1, 0.25, 1],
            easeIn: [0.4, 0, 1, 1],
            easeOut: [0, 0, 0.2, 1],
            easeInOut: [0.4, 0, 0.2, 1],
        },
    },

    // Voice Orb specific
    orb: {
        size: {
            mobile: '200px',
            desktop: '280px',
        },
        glow: {
            blur: '80px',
            spread: '40px',
        },
    },
} as const;

// Voice states with their visual properties
export type VoiceState = 'idle' | 'listening' | 'speaking' | 'processing';

export const voiceStates = {
    idle: {
        color: tokens.colors.surface,
        glowColor: 'transparent',
        ringOpacity: 0.1,
        label: 'Ready',
    },
    listening: {
        color: tokens.colors.userPrimary,
        glowColor: tokens.colors.userGlow,
        ringOpacity: 0.4,
        label: 'Listening',
    },
    speaking: {
        color: tokens.colors.aiPrimary,
        glowColor: tokens.colors.aiGlow,
        ringOpacity: 0.4,
        label: 'AI Speaking',
    },
    processing: {
        color: tokens.colors.textTertiary,
        glowColor: 'rgba(64, 64, 64, 0.2)',
        ringOpacity: 0.2,
        label: 'Processing',
    },
} as const;
