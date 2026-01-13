import { Request, Response } from "express";
import { sttService } from "../services/stt.service";
import { aiService } from "../services/ai.service";
import { memoryService } from "../services/memory.service";
import { Conversation } from "../models/Conversation";
import { AppError } from "../middlewares/error.middleware";
import { logger } from "../utils/logger";
import fs from "fs";

/**
 * Transcribe audio to text
 */
export const transcribeAudio = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            throw new AppError("No audio file provided", 400);
        }

        const audioPath = req.file.path;
        const transcript = await sttService.transcribeAudio(audioPath);

        // Clean up uploaded file
        fs.unlinkSync(audioPath);

        logger.info("Audio transcribed successfully");

        res.status(200).json({
            success: true,
            data: {
                transcript,
            },
        });
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        logger.error("Error transcribing audio", error);
        throw new AppError("Failed to transcribe audio", 500);
    }
};

/**
 * Send text message and get AI response (REST fallback)
 */
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { conversationId, message } = req.body;

        if (!conversationId || !message) {
            throw new AppError("conversationId and message are required", 400);
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            throw new AppError("Conversation not found", 404);
        }

        // Add user message
        await memoryService.addMessage(conversationId, "user", message);

        // Get recent messages for context
        const recentMessages = await memoryService.getRecentMessages(conversationId, 20);

        // Generate AI response
        const aiResponse = await aiService.generateResponse(recentMessages, conversation.mode);

        // Add AI response
        await memoryService.addMessage(conversationId, "assistant", aiResponse);

        logger.info(`Message processed for conversation ${conversationId}`);

        res.status(200).json({
            success: true,
            data: {
                userMessage: message,
                aiResponse,
            },
        });
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        logger.error("Error processing message", error);
        throw new AppError("Failed to process message", 500);
    }
};
