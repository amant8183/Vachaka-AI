import { Request, Response } from "express";
import { User } from "../models/User";
import { AppError } from "../middlewares/error.middleware";
import { logger } from "../utils/logger";

/**
 * Create a new user (for demo purposes)
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email } = req.body;

        if (!name) {
            throw new AppError("Name is required", 400);
        }

        const user = await User.create({
            name,
            email,
        });

        logger.info(`User created: ${user._id}`);

        res.status(201).json({
            success: true,
            data: user,
        });
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        logger.error("Error creating user", error);
        throw new AppError("Failed to create user", 500);
    }
};

/**
 * Get user by ID
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            throw new AppError("User not found", 404);
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        logger.error("Error fetching user", error);
        throw new AppError("Failed to fetch user", 500);
    }
};
