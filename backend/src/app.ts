import express, { Application } from "express";
import cors from "cors";
import env from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import conversationRoutes from "./routes/conversation.routes";
import agentRoutes from "./routes/agent.routes";
import { logger } from "./utils/logger";

const app: Application = express();

// Middleware
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

import userRoutes from "./routes/user.routes";

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/agent", agentRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;