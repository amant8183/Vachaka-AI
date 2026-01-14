import { useState, useEffect, useRef, useCallback } from "react";

interface VADConfig {
    threshold: number;           // Volume threshold (0-255)
    minSpeechDuration: number;   // Minimum ms of speech to trigger start
    silenceDuration: number;     // Ms of silence to trigger stop
    enabled: boolean;            // Enable/disable VAD
}

interface VADState {
    isSpeaking: boolean;
    isListening: boolean;
    volume: number;
}

const DEFAULT_CONFIG: VADConfig = {
    threshold: 30,              // Adjust based on testing
    minSpeechDuration: 300,     // 300ms of speech to start
    silenceDuration: 1500,      // 1.5s of silence to stop
    enabled: true,
};

export const useVoiceActivityDetection = (
    config: Partial<VADConfig> = {},
    onSpeechStart?: () => void,
    onSpeechEnd?: () => void,
    externalStream?: MediaStream | null  // NEW: Accept external stream
) => {
    const [state, setState] = useState<VADState>({
        isSpeaking: false,
        isListening: false,
        volume: 0,
    });

    const fullConfig = { ...DEFAULT_CONFIG, ...config };

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const externalStreamRef = useRef<MediaStream | null>(externalStream || null);

    const speechStartTimeRef = useRef<number | null>(null);
    const silenceStartTimeRef = useRef<number | null>(null);
    const isSpeakingRef = useRef(false);

    // Use refs for callbacks to avoid stale closures in animation frame loop
    const onSpeechStartRef = useRef(onSpeechStart);
    const onSpeechEndRef = useRef(onSpeechEnd);

    useEffect(() => {
        onSpeechStartRef.current = onSpeechStart;
        onSpeechEndRef.current = onSpeechEnd;
    }, [onSpeechStart, onSpeechEnd]);

    // Update external stream ref when it changes
    useEffect(() => {
        externalStreamRef.current = externalStream || null;
    }, [externalStream]);

    // Start listening to microphone
    const startListening = useCallback(async () => {
        if (!fullConfig.enabled) return;

        try {
            let stream: MediaStream;

            // Use external stream if provided, otherwise create own
            if (externalStreamRef.current) {
                console.log("✅ VAD: Using external shared stream");
                stream = externalStreamRef.current;
                streamRef.current = stream; // Store reference but don't own it
            } else {
                console.log("🎤 VAD: Requesting own microphone access...");
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;
            }

            // Create audio context and analyser
            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 512;
            analyserRef.current.smoothingTimeConstant = 0.8;

            // Connect microphone to analyser
            microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
            microphoneRef.current.connect(analyserRef.current);

            setState(prev => ({ ...prev, isListening: true }));

            console.log("✅ VAD: Microphone access granted, listening started");

            // Start monitoring audio levels
            monitorAudioLevel();
        } catch (error) {
            console.error("❌ VAD: Error accessing microphone:", error);
            alert("Failed to access microphone. Please grant microphone permissions and try again.");
            setState(prev => ({ ...prev, isListening: false }));
        }
    }, [fullConfig.enabled]);

    // Stop listening
    const stopListening = useCallback(() => {
        // Stop animation frame
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        // Disconnect audio nodes
        if (microphoneRef.current) {
            microphoneRef.current.disconnect();
            microphoneRef.current = null;
        }

        // Close audio context
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        // Only stop stream if we own it (not external)
        if (streamRef.current && !externalStreamRef.current) {
            console.log("🛑 VAD: Stopping own microphone stream");
            streamRef.current.getTracks().forEach(track => track.stop());
        } else if (externalStreamRef.current) {
            console.log("📌 VAD: Disconnected from external stream (not stopping it)");
        }

        streamRef.current = null;
        analyserRef.current = null;
        speechStartTimeRef.current = null;
        silenceStartTimeRef.current = null;
        isSpeakingRef.current = false;

        setState({
            isSpeaking: false,
            isListening: false,
            volume: 0,
        });
    }, []);

    // Monitor audio level and detect speech
    const monitorAudioLevel = useCallback(() => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

        setState(prev => ({ ...prev, volume: average }));

        // Log volume every 2 seconds for debugging
        if (Math.random() < 0.02) {
            console.log(`🎤 VAD Volume: ${average.toFixed(1)} (threshold: ${fullConfig.threshold})`);
        }

        const now = Date.now();
        const isSpeechDetected = average > fullConfig.threshold;

        if (isSpeechDetected) {
            // Speech detected
            silenceStartTimeRef.current = null;

            if (!isSpeakingRef.current) {
                // Not currently speaking, check if we should start
                if (speechStartTimeRef.current === null) {
                    speechStartTimeRef.current = now;
                } else if (now - speechStartTimeRef.current >= fullConfig.minSpeechDuration) {
                    // Speech duration threshold met
                    isSpeakingRef.current = true;
                    setState(prev => ({ ...prev, isSpeaking: true }));
                    console.log("🗣️ VAD: Speech started");
                    onSpeechStartRef.current?.();
                }
            }
        } else {
            // Silence detected
            speechStartTimeRef.current = null;

            if (isSpeakingRef.current) {
                // Currently speaking, check if we should stop
                if (silenceStartTimeRef.current === null) {
                    silenceStartTimeRef.current = now;
                } else if (now - silenceStartTimeRef.current >= fullConfig.silenceDuration) {
                    // Silence duration threshold met
                    isSpeakingRef.current = false;
                    setState(prev => ({ ...prev, isSpeaking: false }));
                    console.log("🔇 VAD: Speech ended");
                    onSpeechEndRef.current?.();
                }
            }
        }

        // Continue monitoring
        animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
    }, [fullConfig.threshold, fullConfig.minSpeechDuration, fullConfig.silenceDuration]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopListening();
        };
    }, [stopListening]);

    return {
        ...state,
        startListening,
        stopListening,
        config: fullConfig,
    };
};
