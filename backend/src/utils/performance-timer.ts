// Performance timing script for voice pipeline
// Add this at the start of voice_input handler in socket.ts

const performanceTimer = {
    start: 0,
    sttStart: 0,
    sttEnd: 0,
    aiStart: 0,
    aiEnd: 0,
    ttsStart: 0,
    ttsEnd: 0,

    reset() {
        this.start = Date.now();
    },

    logSTT() {
        this.sttEnd = Date.now();
        const duration = this.sttEnd - this.sttStart;
        console.log(`⏱️ [PERF] STT: ${duration}ms`);
        return duration;
    },

    logAI() {
        this.aiEnd = Date.now();
        const duration = this.aiEnd - this.aiStart;
        console.log(`⏱️ [PERF] AI: ${duration}ms`);
        return duration;
    },

    logTTS() {
        this.ttsEnd = Date.now();
        const duration = this.ttsEnd - this.ttsStart;
        console.log(`⏱️ [PERF] TTS: ${duration}ms`);
        return duration;
    },

    logTotal() {
        const total = Date.now() - this.start;
        const stt = this.sttEnd - this.sttStart;
        const ai = this.aiEnd - this.aiStart;
        const tts = this.ttsEnd - this.ttsStart;
        console.log(`⏱️ [PERF] TOTAL: ${total}ms | STT: ${stt}ms | AI: ${ai}ms | TTS: ${tts}ms`);
    }
};
