import { createServer } from "http";
import connectDB from "./db";
import dotenv from "dotenv";
import app from "./app";
import { initializeWebSocket } from "./websocket/socket";
import { logger } from "./utils/logger";
import env from "./config/env";

dotenv.config({
    path: "./.env",
});

const PORT = env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize WebSocket
const io = initializeWebSocket(httpServer);

connectDB()
    .then(() => {
        httpServer.listen(PORT, () => {
            logger.info(`🚀 Server running on http://localhost:${PORT}`);
            logger.info(`🔌 WebSocket server ready`);
            logger.info(`🤖 AI Provider: ${env.AI_PROVIDER}`);
            logger.info(`🎙️ STT Provider: ${env.STT_PROVIDER}`);
        });
    })
    .catch((err) => {
        logger.error("MongoDB connection error", err);
        process.exit(1);
    });