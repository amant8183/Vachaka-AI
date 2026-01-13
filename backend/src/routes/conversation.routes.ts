import { Router } from "express";
import {
    createConversation,
    getUserConversations,
    getConversationById,
    deleteConversation,
    updateConversation,
} from "../controllers/conversation.controller";

const router = Router();

// Create new conversation
router.post("/", createConversation);

// Get all conversations for a user
router.get("/user/:userId", getUserConversations);

// Get specific conversation
router.get("/:id", getConversationById);

// Update conversation
router.patch("/:id", updateConversation);

// Delete conversation
router.delete("/:id", deleteConversation);

export default router;
