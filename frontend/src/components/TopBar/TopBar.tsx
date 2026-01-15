'use client';

import { motion } from 'framer-motion';
import { Circle, Settings, X } from 'lucide-react';
import { tokens } from '@/lib/design-tokens';
import { ConversationMode } from '@/types';

interface TopBarProps {
    mode: ConversationMode;
    isConnected: boolean;
    autoMode?: boolean; // Optional
    onToggleAutoMode?: () => void; // Optional
    onEndSession: () => void;
}

export function TopBar({
    mode,
    isConnected,
    autoMode,
    onToggleAutoMode,
    onEndSession,
}: TopBarProps) {
    return (
        <div
            className="fixed top-0 left-0 right-0 z-40 px-8 py-4 backdrop-blur-md"
            style={{
                backgroundColor: `${tokens.colors.background}dd`,
                borderBottom: `1px solid ${tokens.colors.border}`,
            }}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Left: App name */}
                <div className="flex items-center gap-4">
                    <h1
                        className="text-lg font-semibold tracking-tight"
                        style={{ color: tokens.colors.textPrimary }}
                    >
                        Voice AI
                    </h1>

                    {/* Mode indicator */}
                    <div
                        className="px-3 py-1 rounded-full text-xs font-medium tracking-wide"
                        style={{
                            backgroundColor: tokens.colors.surfaceHover,
                            color: tokens.colors.textSecondary,
                        }}
                    >
                        {mode === 'casual' ? 'Casual' : 'Interview'}
                    </div>
                </div>

                {/* Right: Status and controls */}
                <div className="flex items-center gap-6">
                    {/* Connection status */}
                    <div className="flex items-center gap-2">
                        <motion.div
                            className="w-2 h-2 rounded-full"
                            style={{
                                backgroundColor: isConnected
                                    ? tokens.colors.userPrimary
                                    : tokens.colors.textTertiary,
                            }}
                            animate={{
                                opacity: isConnected ? [0.5, 1, 0.5] : 1,
                            }}
                            transition={{
                                duration: 2,
                                repeat: isConnected ? Infinity : 0,
                            }}
                        />
                        <span
                            className="text-xs font-medium"
                            style={{ color: tokens.colors.textSecondary }}
                        >
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>

                    {/* Auto mode toggle - hidden when not provided */}
                    {autoMode !== undefined && onToggleAutoMode && (
                        <button
                            onClick={onToggleAutoMode}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors"
                            style={{
                                backgroundColor: autoMode
                                    ? tokens.colors.surfaceHover
                                    : 'transparent',
                                border: `1px solid ${tokens.colors.border}`,
                                color: autoMode ? tokens.colors.textPrimary : tokens.colors.textSecondary,
                            }}
                        >
                            <Settings className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{autoMode ? 'Auto' : 'Manual'}</span>
                        </button>
                    )}

                    {/* End session */}
                    <button
                        onClick={onEndSession}
                        className="p-2 rounded-md transition-colors hover:bg-white/5"
                        style={{ color: tokens.colors.textTertiary }}
                        title="End session"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
