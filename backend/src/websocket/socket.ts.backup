import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { aiService } from "../services/ai.service";
import { memoryService } from "../services/memory.service";
import { sttService } from "../services/stt.service";
import { ttsService } from "../services/tts.service";
import { Conversation } from "../models/Conversation";
import { logger } from "../utils/logger";
import env from "../config/env";

export const initializeWebSocket = (httpServer: HTTPServer): SocketIOServer => {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: env.FRONTEND_URL,
            methods: ["GET", "POST"],
            credentials: true,
        },
        maxHttpBufferSize: 10 * 1024 * 1024, // 10MB for audio
    });

    io.on("connection", (socket: Socket) => {
        logger.info(`Client connected: ${socket.id}`);

        // Join conversation room
        socket.on("join_conversation", async (data: { conversationId: string }) => {
            try {
                const { conversationId } = data;

                // Verify conversation exists
                const conversation = await Conversation.findById(conversationId);
                if (!conversation) {
                    socket.emit("error", { message: "Conversation not found" });
                    return;
                }

                socket.join(conversationId);
                logger.info(`Socket ${socket.id} joined conversation ${conversationId}`);

                socket.emit("joined_conversation", {
                    conversationId,
                    mode: conversation.mode,
                });
            } catch (error) {
                logger.error("Error joining conversation", error);
                socket.emit("error", { message: "Failed to join conversation" });
            }
        });

        // Handle text message
        socket.on("send_message", async (data: { conversationId: string; message: string }) => {
            try {
                const { conversationId, message } = data;

                if (!message || !conversationId) {
                    socket.emit("error", { message: "Invalid message data" });
                    return;
                }

                const conversation = await Conversation.findById(conversationId);
                if (!conversation) {
                    socket.emit("error", { message: "Conversation not found" });
                    return;
                }

                // Add user message
                const userMessage = await memoryService.addMessage(conversationId, "user", message);

                // Emit user message to room
                io.to(conversationId).emit("message_received", {
                    role: "user",
                    content: message,
                    timestamp: userMessage.timestamp,
                });

                // Get recent messages for context
                const recentMessages = await memoryService.getRecentMessages(conversationId, 20);

                // Stream AI response
                let fullResponse = "";
                const responseStream = aiService.generateStreamingResponse(
                    recentMessages,
                    conversation.mode
                );

                for await (const chunk of responseStream) {
                    fullResponse += chunk;
                    // Emit each chunk to the client
                    io.to(conversationId).emit("message_chunk", {
                        chunk,
                    });
                }

                // Save complete AI response
                const aiMessage = await memoryService.addMessage(
                    conversationId,
                    "assistant",
                    fullResponse
                );

                // Emit text completion
                io.to(conversationId).emit("message_complete", {
                    role: "assistant",
                    content: fullResponse,
                    timestamp: aiMessage.timestamp,
                });

                // Generate TTS audio if available
                if (ttsService.isAvailable()) {
                    try {
                        logger.info("Generating TTS audio for AI response");
                        const audioBuffer = await ttsService.textToSpeech(fullResponse);

                        // Convert buffer to base64 for transmission
                        const audioBase64 = audioBuffer.toString("base64");

                        // Emit audio response (WAV for Deepgram, MP3 for OpenAI)
                        const mimeType = ttsService.getProvider() === "deepgram" ? "audio/wav" : "audio/mpeg";
                        io.to(conversationId).emit("ai_voice_response", {
                            audio: audioBase64,
                            mimeType: mimeType,
                        });

                        logger.info("TTS audio sent to client");
                    } catch (ttsError) {
                        logger.error("Error generating TTS audio:", ttsError);
                        // Don't fail the whole request if TTS fails
                    }
                }

                logger.info(`Message processed for conversation ${conversationId}`);
            } catch (error) {
                logger.error("Error processing message", error);
                socket.emit("error", { message: "Failed to process message" });
            }
        });

        // Handle voice input
        socket.on("voice_input", async (data: { conversationId: string; audioBuffer: Buffer }) => {
            try {
                const { conversationId, audioBuffer } = data;

                console.log(`[🎤 SERVER] Received voice_input event for ${conversationId}`);
                console.log(`[🎤 SERVER] Audio buffer type: ${typeof audioBuffer}, length: ${audioBuffer?.length}`);

                logger.info(`Voice input received for conversation ${conversationId}`);
                logger.info(`Audio buffer type: ${typeof audioBuffer}, length: ${audioBuffer?.length || 'undefined'}`);


                if (!audioBuffer || !conversationId) {
                    console.error("[❌ SERVER] Invalid voice data: missing audioBuffer or conversationId");
                    logger.warn("Invalid voice data: missing audioBuffer or conversationId");
                    socket.emit("error", { message: "Invalid voice data" });
                    return;
                }

                const conversation = await Conversation.findById(conversationId);
                if (!conversation) {
                    logger.warn(`Conversation not found: ${conversationId}`);
                    socket.emit("error", { message: "Conversation not found" });
                    return;
                }

                // Emit processing status
                socket.emit("voice_processing", { status: "transcribing" });
                logger.info("Starting transcription...");

                // Transcribe audio
                const transcript = await sttService.transcribeBuffer(
                    Buffer.from(audioBuffer),
                    "audio/webm"
                );

                logger.info(`Transcription complete: ${transcript}`);

                // Emit transcription
                socket.emit("voice_transcribed", { transcript });

                // Add user message with voice metadata
                const userMessage = await memoryService.addMessage(
                    conversationId,
                    "user",
                    transcript,
                    { isVoice: true }
                );

                // Emit user message to room
                io.to(conversationId).emit("message_received", {
                    role: "user",
                    content: transcript,
                    timestamp: userMessage.timestamp,
                    metadata: { isVoice: true },
                });

                // Get recent messages for context
                const recentMessages = await memoryService.getRecentMessages(conversationId, 20);

                // Emit AI processing status
                socket.emit("voice_processing", { status: "generating_response" });

                // Stream AI response
                let fullResponse = "";
                const responseStream = aiService.generateStreamingResponse(
                    recentMessages,
                    conversation.mode
                );

                for await (const chunk of responseStream) {
                    fullResponse += chunk;
                    io.to(conversationId).emit("message_chunk", { chunk });
                }

                // Save complete AI response
                const aiMessage = await memoryService.addMessage(
                    conversationId,
                    "assistant",
                    fullResponse
                );

                // Emit text completion
                io.to(conversationId).emit("message_complete", {
                    role: "assistant",
                    content: fullResponse,
                    timestamp: aiMessage.timestamp,
                });

                // Generate TTS audio if available
                if (ttsService.isAvailable()) {
                    try {
                        logger.info("Generating TTS audio for voice response");
                        const audioBuffer = await ttsService.textToSpeech(fullResponse);

                        // Convert buffer to base64 for transmission
                        const audioBase64 = audioBuffer.toString("base64");

                        // Emit audio response (WAV for Deepgram, MP3 for OpenAI)
                        const mimeType = ttsService.getProvider() === "deepgram" ? "audio/wav" : "audio/mpeg";
                        io.to(conversationId).emit("ai_voice_response", {
                            audio: audioBase64,
                            mimeType: mimeType,
                        });

                        logger.info("TTS audio sent to client");
                    } catch (ttsError) {
                        logger.error("Error generating TTS audio:", ttsError);
                    }
                }

                logger.info(`Voice message processed for conversation ${conversationId}`);
            } catch (error) {
                logger.error("Error processing voice input:", error);
                logger.error("Error stack:", (error as Error).stack);
                socket.emit("error", { message: "Failed to process voice input" });
            }
        });

        // Handle disconnect
        socket.on("disconnect", () => {
            logger.info(`Client disconnected: ${socket.id}`);
        });
    });

    logger.info("WebSocket server initialized");
    return io;
};
