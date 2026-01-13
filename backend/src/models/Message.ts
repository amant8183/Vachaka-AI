import { Schema } from "mongoose";

export type MessageRole = "user" | "assistant" | "system";

export interface IMessage {
    role: MessageRole;
    content: string;
    timestamp: Date;
    metadata?: {
        isVoice?: boolean;
        audioUrl?: string;
        duration?: number;
    };
}

export const MessageSchema = new Schema<IMessage>({
    role: {
        type: String,
        enum: ["user", "assistant", "system"],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    metadata: {
        isVoice: { type: Boolean, default: false },
        audioUrl: { type: String },
        duration: { type: Number },
    },
});
