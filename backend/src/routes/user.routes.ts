import { Router } from "express";
import { createUser, getUserById } from "../controllers/user.controller";

const router = Router();

// Create user
router.post("/", createUser);

// Get user by ID
router.get("/:id", getUserById);

export default router;
