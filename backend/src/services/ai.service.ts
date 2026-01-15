import { IMessage } from "../models/Message";
import { ConversationMode } from "../models/Conversation";
import { getSystemPrompt } from "../utils/prompts";
import env from "../config/env";
import { logger } from "../utils/logger";
import Groq from "groq-sdk";
import OpenAI from "openai";

interface AIMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

class AIService {
    private groqClient?: Groq;
    private openaiClient?: OpenAI;

    constructor() {
        if (env.AI_PROVIDER === "groq" && env.GROQ_API_KEY) {
            this.groqClient = new Groq({
                apiKey: env.GROQ_API_KEY,
            });
            logger.info("Groq AI client initialized");
        } else if (env.AI_PROVIDER === "openai" && env.OPENAI_API_KEY) {
            this.openaiClient = new OpenAI({
                apiKey: env.OPENAI_API_KEY,
            });
            logger.info("OpenAI client initialized");
        } else {
            logger.warn("No AI provider configured properly");
        }
    }

    /**
     * Generate streaming AI response
     */
    async *generateStreamingResponse(
        messages: IMessage[],
        mode: ConversationMode
    ): AsyncGenerator<string, void, unknown> {
        const systemPrompt = getSystemPrompt(mode);
        const formattedMessages = this.formatMessagesForAI(messages, systemPrompt);

        try {
            if (env.AI_PROVIDER === "groq" && this.groqClient) {
                yield* this.streamGroq(formattedMessages);
            } else if (env.AI_PROVIDER === "openai" && this.openaiClient) {
                yield* this.streamOpenAI(formattedMessages);
            } else {
                throw new Error("No AI provider available");
            }
        } catch (error) {
            logger.error("Error generating AI response", error);
            throw error;
        }
    }

    /**
     * Stream response from Groq
     */
    private async *streamGroq(messages: AIMessage[]): AsyncGenerator<string, void, unknown> {
        if (!this.groqClient) {
            throw new Error("Groq client not initialized");
        }

        const stream = await this.groqClient.chat.completions.create({
            model: "llama-3.1-8b-instant", // Fast model for low latency
            messages,
            stream: true,
            temperature: 0.5, // Lower for faster, more focused responses
            max_tokens: 256, // Shorter for faster voice responses and TTS
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                yield content;
            }
        }
    }

    /**
     * Stream response from OpenAI
     */
    private async *streamOpenAI(messages: AIMessage[]): AsyncGenerator<string, void, unknown> {
        if (!this.openaiClient) {
            throw new Error("OpenAI client not initialized");
        }

        const stream = await this.openaiClient.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            stream: true,
            temperature: 0.7,
            max_tokens: 1024,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                yield content;
            }
        }
    }

    /**
     * Format messages for AI API
     */
    private formatMessagesForAI(messages: IMessage[], systemPrompt: string): AIMessage[] {
        const aiMessages: AIMessage[] = [
            {
                role: "system",
                content: systemPrompt,
            },
        ];

        // Add conversation messages
        for (const msg of messages) {
            aiMessages.push({
                role: msg.role as "user" | "assistant",
                content: msg.content,
            });
        }

        return aiMessages;
    }

    /**
     * Generate non-streaming response (fallback)
     */
    async generateResponse(messages: IMessage[], mode: ConversationMode): Promise<string> {
        const systemPrompt = getSystemPrompt(mode);
        const formattedMessages = this.formatMessagesForAI(messages, systemPrompt);

        try {
            if (env.AI_PROVIDER === "groq" && this.groqClient) {
                const response = await this.groqClient.chat.completions.create({
                    model: "llama-3.1-8b-instant", // Fast model for low latency
                    messages: formattedMessages,
                    temperature: 0.5, // Lower for faster, more focused responses
                    max_tokens: 256, // Shorter for faster voice responses and TTS
                });
                return response.choices[0]?.message?.content || "";
            } else if (env.AI_PROVIDER === "openai" && this.openaiClient) {
                const response = await this.openaiClient.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: formattedMessages,
                    temperature: 0.7,
                    max_tokens: 1024,
                });
                return response.choices[0]?.message?.content || "";
            } else {
                throw new Error("No AI provider available");
            }
        } catch (error) {
            logger.error("Error generating AI response", error);
            throw error;
        }
    }
}

export const aiService = new AIService();
