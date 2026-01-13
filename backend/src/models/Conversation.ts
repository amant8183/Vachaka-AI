import mongoose, { Schema, Document, Types } from "mongoose";
import { IMessage, MessageSchema } from "./Message";

export type ConversationMode = "casual" | "interview";

export interface IConversation extends Document {
    userId: Types.ObjectId;
    mode: ConversationMode;
    messages: IMessage[];
    startedAt: Date;
    updatedAt: Date;
    isActive: boolean;
}

const ConversationSchema = new Schema<IConversation>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        mode: {
            type: String,
            enum: ["casual", "interview"],
            required: true,
            default: "casual",
        },
        messages: {
            type: [MessageSchema],
            default: [],
        },
        startedAt: {
            type: Date,
            default: Date.now,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
ConversationSchema.index({ userId: 1, updatedAt: -1 });
ConversationSchema.index({ isActive: 1 });

export const Conversation = mongoose.model<IConversation>("Conversation", ConversationSchema);
