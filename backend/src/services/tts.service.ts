import env from "../config/env";
import { logger } from "../utils/logger";
import OpenAI from "openai";
import Groq from "groq-sdk";
import { createClient } from "@deepgram/sdk";

class TTSService {
    private openaiClient?: OpenAI;
    private groqClient?: Groq;
    private deepgramClient?: ReturnType<typeof createClient>;
    private provider: "groq" | "openai" | "deepgram" | "none";

    constructor() {
        // Initialize ALL available TTS providers (not just one)
        // This allows dynamic provider switching per conversation

        let initializedCount = 0;

        if (env.GROQ_API_KEY) {
            this.groqClient = new Groq({
                apiKey: env.GROQ_API_KEY,
            });
            initializedCount++;
            logger.info("Groq TTS (Orpheus) initialized");
        }

        if (env.OPENAI_API_KEY) {
            this.openaiClient = new OpenAI({
                apiKey: env.OPENAI_API_KEY,
            });
            initializedCount++;
            logger.info("OpenAI TTS initialized");
        }

        if (env.DEEPGRAM_API_KEY) {
            this.deepgramClient = createClient(env.DEEPGRAM_API_KEY);
            initializedCount++;
            logger.info("Deepgram TTS initialized");
        }

        // Set default provider based on TTS_PROVIDER config or first available
        if (env.TTS_PROVIDER === "groq" && this.groqClient) {
            this.provider = "groq";
        } else if (env.TTS_PROVIDER === "openai" && this.openaiClient) {
            this.provider = "openai";
        } else if (env.TTS_PROVIDER === "deepgram" && this.deepgramClient) {
            this.provider = "deepgram";
        } else if (this.groqClient) {
            this.provider = "groq";
        } else if (this.openaiClient) {
            this.provider = "openai";
        } else if (this.deepgramClient) {
            this.provider = "deepgram";
        } else {
            this.provider = "none";
        }

        if (initializedCount === 0) {
            logger.warn("No TTS providers initialized - check API keys");
        } else {
            logger.info(`Default TTS provider: ${this.provider} (${initializedCount} providers available)`);
        }
    }

    /**
     * Convert text to speech
     * Returns audio buffer
     * @param text - Text to convert to speech
     * @param providerOverride - Optional provider override for per-conversation selection
     */
    async textToSpeech(text: string, providerOverride?: "groq" | "deepgram"): Promise<Buffer> {
        try {
            const provider = providerOverride || this.provider;

            // Validate provider is initialized
            if (provider === "groq" && !this.groqClient) {
                throw new Error("Groq TTS not initialized - check GROQ_API_KEY");
            }
            if (provider === "deepgram" && !this.deepgramClient) {
                throw new Error("Deepgram TTS not initialized - check DEEPGRAM_API_KEY");
            }
            if (provider === "openai" && !this.openaiClient) {
                throw new Error("OpenAI TTS not initialized - check OPENAI_API_KEY");
            }

            if (provider === "groq") {
                return await this.textToSpeechGroq(text);
            } else if (provider === "openai") {
                return await this.textToSpeechOpenAI(text);
            } else if (provider === "deepgram") {
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
     * Convert text to speech using Groq TTS (Orpheus)
     */
    private async textToSpeechGroq(text: string): Promise<Buffer> {
        if (!this.groqClient) {
            throw new Error("Groq client not initialized");
        }

        logger.info(`Converting text to speech with Groq (Orpheus): "${text.substring(0, 50)}..."`);

        const response = await this.groqClient.audio.speech.create({
            model: "canopylabs/orpheus-v1-english",
            voice: "troy",
            input: text,
            response_format: "wav",
        });

        const buffer = Buffer.from(await response.arrayBuffer());
        logger.info(`Groq TTS conversion complete, buffer size: ${buffer.length} bytes`);

        return buffer;
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
