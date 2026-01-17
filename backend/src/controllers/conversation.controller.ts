import { Request, Response } from "express";
import { Conversation } from "../models/Conversation";
import { User } from "../models/User";
import { AppError } from "../middlewares/error.middleware";
import { logger } from "../utils/logger";

/**
 * Create a new conversation
 */
export const createConversation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, mode, ttsProvider } = req.body;

        logger.info(`Received conversation creation request - userId: ${userId}, mode: ${mode}, body:`, req.body);

        if (!userId || !mode) {
            throw new AppError("userId and mode are required", 400);
        }

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError("User not found", 404);
        }

        const conversation = await Conversation.create({
            userId,
            mode,
            ttsProvider,  // Include TTS provider preference
            messages: [],
            isActive: true,
        });

        logger.info(`Conversation created: ${conversation._id}`);

        res.status(201).json({
            success: true,
            data: conversation,
        });
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        logger.error("Error creating conversation", error);
        throw new AppError("Failed to create conversation", 500);
    }
};

/**
 * Get all conversations for a user
 */
export const getUserConversations = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        const conversations = await Conversation.find({ userId })
            .sort({ updatedAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            data: conversations,
        });
    } catch (error) {
        logger.error("Error fetching conversations", error);
        throw new AppError("Failed to fetch conversations", 500);
    }
};

/**
 * Get a specific conversation by ID
 */
export const getConversationById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            throw new AppError("Conversation not found", 404);
        }

        res.status(200).json({
            success: true,
            data: conversation,
        });
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        logger.error("Error fetching conversation", error);
        throw new AppError("Failed to fetch conversation", 500);
    }
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const conversation = await Conversation.findByIdAndDelete(id);
        if (!conversation) {
            throw new AppError("Conversation not found", 404);
        }

        logger.info(`Conversation deleted: ${id}`);

        res.status(200).json({
            success: true,
            message: "Conversation deleted successfully",
        });
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        logger.error("Error deleting conversation", error);
        throw new AppError("Failed to delete conversation", 500);
    }
};

/**
 * Update conversation (e.g., mark as inactive)
 */
export const updateConversation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const conversation = await Conversation.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!conversation) {
            throw new AppError("Conversation not found", 404);
        }

        res.status(200).json({
            success: true,
            data: conversation,
        });
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        logger.error("Error updating conversation", error);
        throw new AppError("Failed to update conversation", 500);
    }
};
