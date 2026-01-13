import { Conversation } from "../models/Conversation";
import { IMessage } from "../models/Message";
import { logger } from "../utils/logger";

class MemoryService {
    /**
     * Get recent messages from a conversation for AI context
     * @param conversationId - The conversation ID
     * @param limit - Maximum number of messages to retrieve (default: 20)
     */
    async getRecentMessages(conversationId: string, limit: number = 20): Promise<IMessage[]> {
        try {
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                throw new Error("Conversation not found");
            }

            // Get the last N messages
            const messages = conversation.messages.slice(-limit);
            return messages;
        } catch (error) {
            logger.error("Error fetching recent messages", error);
            throw error;
        }
    }

    /**
     * Format messages for AI API consumption
     * Filters out system messages and formats properly
     */
    formatMessagesForAI(messages: IMessage[]): Array<{ role: string; content: string }> {
        return messages
            .filter((msg) => msg.role !== "system") // Exclude system messages from context
            .map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));
    }

    /**
     * Add a message to conversation
     */
    async addMessage(
        conversationId: string,
        role: "user" | "assistant",
        content: string,
        metadata?: {
            isVoice?: boolean;
            audioUrl?: string;
            duration?: number;
        }
    ): Promise<IMessage> {
        try {
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                throw new Error("Conversation not found");
            }

            const newMessage: IMessage = {
                role,
                content,
                timestamp: new Date(),
                metadata,
            };

            conversation.messages.push(newMessage);
            conversation.updatedAt = new Date();
            await conversation.save();

            logger.debug(`Message added to conversation ${conversationId}`);
            return newMessage;
        } catch (error) {
            logger.error("Error adding message to conversation", error);
            throw error;
        }
    }

    /**
     * Get conversation context window
     * Returns a sliding window of recent messages for better AI context
     */
    async getContextWindow(conversationId: string, windowSize: number = 10): Promise<IMessage[]> {
        const messages = await this.getRecentMessages(conversationId, windowSize);
        return messages;
    }

    /**
     * Clear old messages to manage memory (optional utility)
     */
    async pruneOldMessages(conversationId: string, keepLast: number = 50): Promise<void> {
        try {
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                throw new Error("Conversation not found");
            }

            if (conversation.messages.length > keepLast) {
                conversation.messages = conversation.messages.slice(-keepLast);
                await conversation.save();
                logger.info(`Pruned old messages from conversation ${conversationId}`);
            }
        } catch (error) {
            logger.error("Error pruning messages", error);
            throw error;
        }
    }
}

export const memoryService = new MemoryService();
