export type MessageRole = "user" | "assistant" | "system";

export type ConversationMode = "casual" | "interview";

export interface Message {
    role: MessageRole;
    content: string;
    timestamp: Date;
    metadata?: {
        isVoice?: boolean;
        audioUrl?: string;
        duration?: number;
    };
}

export interface Conversation {
    _id: string;
    userId: string;
    mode: ConversationMode;
    messages: Message[];
    startedAt: Date;
    updatedAt: Date;
    isActive: boolean;
}

export interface User {
    _id: string;
    name: string;
    email?: string;
    createdAt: Date;
}

export type VoiceState = "idle" | "recording" | "processing" | "responding";
