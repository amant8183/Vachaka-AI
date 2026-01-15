import env from "../config/env";
import { logger } from "../utils/logger";
import OpenAI from "openai";
import { createClient } from "@deepgram/sdk";

class TTSService {
    private openaiClient?: OpenAI;
    private deepgramClient?: ReturnType<typeof createClient>;
    private provider: "openai" | "deepgram" | "none";

    constructor() {
        // Determine which TTS provider to use
        if (env.OPENAI_API_KEY) {
            this.openaiClient = new OpenAI({
                apiKey: env.OPENAI_API_KEY,
            });
            this.provider = "openai";
            logger.info("OpenAI TTS initialized");
        } else if (env.DEEPGRAM_API_KEY) {
            this.deepgramClient = createClient(env.DEEPGRAM_API_KEY);
            this.provider = "deepgram";
            logger.info("Deepgram TTS initialized");
        } else {
            this.provider = "none";
            logger.warn("No TTS provider configured - missing API keys");
        }
    }

    /**
     * Convert text to speech
     * Returns audio buffer
     */
    async textToSpeech(text: string): Promise<Buffer> {
        try {
            if (this.provider === "openai") {
                return await this.textToSpeechOpenAI(text);
            } else if (this.provider === "deepgram") {
                return await this.textToSpeechDeepgram(text);
            } else {
                throw new Error("No TTS provider available");
            }
        } catch (error) {
            logger.error("Error converting text to speech:", error);
            throw error;
        }
    }

    /**
     * Convert text to speech using OpenAI TTS
     */
    private async textToSpeechOpenAI(text: string): Promise<Buffer> {
        if (!this.openaiClient) {
            throw new Error("OpenAI client not initialized");
        }

        logger.info(`Converting text to speech with OpenAI: "${text.substring(0, 50)}..."`);

        const mp3 = await this.openaiClient.audio.speech.create({
            model: "tts-1",
            voice: "nova", // Professional, clear voice
            input: text,
            speed: 1.0,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        logger.info(`OpenAI TTS conversion complete, buffer size: ${buffer.length} bytes`);

        return buffer;
    }

    /**
     * Convert text to speech using Deepgram TTS
     */
    private async textToSpeechDeepgram(text: string): Promise<Buffer> {
        if (!this.deepgramClient) {
            throw new Error("Deepgram client not initialized");
        }

        logger.info(`Converting text to speech with Deepgram: "${text.substring(0, 50)}..."`);

        const response = await this.deepgramClient.speak.request(
            { text },
            {
                model: "aura-asteria-en", // Natural, professional voice
                encoding: "linear16", // WAV format for universal browser support
                sample_rate: 16000, // Lower for faster processing (good quality for speech)
            }
        );

        // Get the audio stream
        const stream = await response.getStream();
        if (!stream) {
            throw new Error("No audio stream returned from Deepgram");
        }

        // Convert stream to buffer
        const chunks: Uint8Array[] = [];
        const reader = stream.getReader();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) chunks.push(value);
        }

        const buffer = Buffer.concat(chunks);
        logger.info(`Deepgram TTS conversion complete, buffer size: ${buffer.length} bytes`);

        return buffer;
    }

    /**
     * Check if TTS is available
     */
    isAvailable(): boolean {
        return this.provider !== "none";
    }

    /**
     * Get current TTS provider
     */
    getProvider(): string {
        return this.provider;
    }
}

export const ttsService = new TTSService();
