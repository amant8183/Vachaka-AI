import env from "../config/env";
import { logger } from "../utils/logger";
import OpenAI from "openai";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import fs from "fs";

class STTService {
    private openaiClient?: OpenAI;
    private deepgramClient?: ReturnType<typeof createClient>;

    constructor() {
        if (env.STT_PROVIDER === "whisper" && env.OPENAI_API_KEY) {
            this.openaiClient = new OpenAI({
                apiKey: env.OPENAI_API_KEY,
            });
            logger.info("Whisper STT initialized");
        } else if (env.STT_PROVIDER === "deepgram" && env.DEEPGRAM_API_KEY) {
            this.deepgramClient = createClient(env.DEEPGRAM_API_KEY);
            logger.info("Deepgram STT initialized");
        } else {
            logger.warn("No STT provider configured properly");
        }
    }

    /**
     * Transcribe audio file to text
     */
    async transcribeAudio(audioPath: string): Promise<string> {
        try {
            if (env.STT_PROVIDER === "whisper" && this.openaiClient) {
                return await this.transcribeWithWhisper(audioPath);
            } else if (env.STT_PROVIDER === "deepgram" && this.deepgramClient) {
                return await this.transcribeWithDeepgram(audioPath);
            } else {
                throw new Error("No STT provider available");
            }
        } catch (error) {
            logger.error("Error transcribing audio", error);
            throw error;
        }
    }

    /**
     * Transcribe with OpenAI Whisper
     */
    private async transcribeWithWhisper(audioPath: string): Promise<string> {
        if (!this.openaiClient) {
            throw new Error("OpenAI client not initialized");
        }

        const audioFile = fs.createReadStream(audioPath);
        const response = await this.openaiClient.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-1",
            language: "en",
        });

        return response.text;
    }

    /**
     * Transcribe with Deepgram
     */
    private async transcribeWithDeepgram(audioPath: string): Promise<string> {
        if (!this.deepgramClient) {
            throw new Error("Deepgram client not initialized");
        }

        const audioBuffer = fs.readFileSync(audioPath);
        const { result, error } = await this.deepgramClient.listen.prerecorded.transcribeFile(
            audioBuffer,
            {
                model: "nova-2",
                smart_format: true,
                language: "en",
            }
        );

        if (error) {
            throw error;
        }

        const transcript = result?.results?.channels[0]?.alternatives[0]?.transcript;
        if (!transcript) {
            throw new Error("No transcript returned from Deepgram");
        }

        return transcript;
    }

    /**
     * Transcribe audio buffer directly
     */
    async transcribeBuffer(buffer: Buffer, mimeType: string): Promise<string> {
        try {
            if (env.STT_PROVIDER === "whisper" && this.openaiClient) {
                // Whisper requires a file, so we'll need to save temporarily
                const tempPath = `/tmp/audio-${Date.now()}.webm`;
                fs.writeFileSync(tempPath, buffer);
                const result = await this.transcribeWithWhisper(tempPath);
                fs.unlinkSync(tempPath); // Clean up
                return result;
            } else if (env.STT_PROVIDER === "deepgram" && this.deepgramClient) {
                const { result, error } = await this.deepgramClient.listen.prerecorded.transcribeFile(
                    buffer,
                    {
                        model: "nova-2",
                        smart_format: true,
                        language: "en",
                    }
                );

                if (error) {
                    throw error;
                }

                const transcript = result?.results?.channels[0]?.alternatives[0]?.transcript;
                if (!transcript) {
                    throw new Error("No transcript returned from Deepgram");
                }

                return transcript;
            } else {
                throw new Error("No STT provider available");
            }
        } catch (error) {
            logger.error("Error transcribing audio buffer", error);
            throw error;
        }
    }
}

export const sttService = new STTService();
