import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Shared Microphone Stream Hook
 * 
 * Manages a single microphone stream that can be shared between
 * multiple consumers (VAD, voice recorder, etc.)
 * 
 * This eliminates the need for multiple getUserMedia() calls and
 * prevents race conditions between VAD and recording.
 */
export const useSharedMicrophoneStream = () => {
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const start = useCallback(async () => {
        if (streamRef.current) {
            console.log("📡 Microphone stream already active");
            return streamRef.current;
        }

        try {
            console.log("🎤 Requesting microphone access...");
            const newStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                }
            });

            streamRef.current = newStream;
            setStream(newStream);
            setIsActive(true);
            setError(null);
            console.log("✅ Shared microphone stream started");

            return newStream;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to access microphone";
            console.error("❌ Microphone access error:", errorMessage);
            setError(errorMessage);
            setIsActive(false);
            throw err;
        }
    }, []);

    const stop = useCallback(() => {
        if (streamRef.current) {
            console.log("🛑 Stopping shared microphone stream");
            streamRef.current.getTracks().forEach(track => {
                track.stop();
                console.log("  ⏹️ Stopped track:", track.label);
            });
            streamRef.current = null;
            setStream(null);
            setIsActive(false);
            console.log("✅ Shared microphone stream stopped");
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stop();
        };
    }, [stop]);

    return {
        stream,
        isActive,
        error,
        start,
        stop,
    };
};
