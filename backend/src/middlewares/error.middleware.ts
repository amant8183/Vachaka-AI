import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (err instanceof AppError) {
        logger.error(`AppError: ${err.message}`, {
            statusCode: err.statusCode,
            path: req.path,
        });

        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }

    // Unexpected errors
    logger.error(`Unexpected Error: ${err.message}`, {
        stack: err.stack,
        path: req.path,
    });

    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};
