import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

interface EnvConfig {
    PORT: number;
    MONGO_URI: string;
    NODE_ENV: string;
    
    // AI Provider (Groq or OpenAI)
    AI_PROVIDER: "groq" | "openai";
    GROQ_API_KEY?: string;
    OPENAI_API_KEY?: string;
    
    // STT Provider
    STT_PROVIDER: "whisper" | "deepgram" | "assemblyai";
    DEEPGRAM_API_KEY?: string;
    ASSEMBLYAI_API_KEY?: string;
    
    // Frontend
    FRONTEND_URL: string;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
    const value = process.env[key] || defaultValue;
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};

const getOptionalEnvVar = (key: string, defaultValue?: string): string | undefined => {
    return process.env[key] || defaultValue;
};

export const env: EnvConfig = {
    PORT: parseInt(getEnvVar("PORT", "5000"), 10),
    MONGO_URI: getEnvVar("MONGO_URI"),
    NODE_ENV: getEnvVar("NODE_ENV", "development"),
    
    AI_PROVIDER: (getEnvVar("AI_PROVIDER", "groq") as "groq" | "openai"),
    GROQ_API_KEY: getOptionalEnvVar("GROQ_API_KEY"),
    OPENAI_API_KEY: getOptionalEnvVar("OPENAI_API_KEY"),
    
    STT_PROVIDER: (getEnvVar("STT_PROVIDER", "whisper") as "whisper" | "deepgram" | "assemblyai"),
    DEEPGRAM_API_KEY: getOptionalEnvVar("DEEPGRAM_API_KEY"),
    ASSEMBLYAI_API_KEY: getOptionalEnvVar("ASSEMBLYAI_API_KEY"),
    
    FRONTEND_URL: getEnvVar("FRONTEND_URL", "http://localhost:3000"),
};

export default env;
