import { Router } from "express";
import multer from "multer";
import { transcribeAudio, sendMessage } from "../controllers/agent.controller";

const router = Router();

// Configure multer for audio uploads
const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ["audio/webm", "audio/wav", "audio/mp3", "audio/mpeg", "audio/ogg"];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only audio files are allowed."));
        }
    },
});

// Transcribe audio
router.post("/transcribe", upload.single("audio"), transcribeAudio);

// Send text message (REST fallback)
router.post("/message", sendMessage);

export default router;
