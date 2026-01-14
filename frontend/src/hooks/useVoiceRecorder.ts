import { useState, useCallback, useRef, useEffect } from "react";
import { VoiceState } from "@/types";

export const useVoiceRecorder = (externalStream?: MediaStream | null) => {
    const [voiceState, setVoiceState] = useState<VoiceState>("idle");
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const externalStreamRef = useRef<MediaStream | null>(externalStream || null);

    // Update external stream ref when it changes
    useEffect(() => {
        externalStreamRef.current = externalStream || null;
    }, [externalStream]);

    const startRecording = useCallback(async () => {
        try {
            let stream: MediaStream;

            // Use external stream if provided, otherwise create own
            if (externalStreamRef.current) {
                console.log("✅ Recorder: Using external shared stream");
                stream = externalStreamRef.current;
                streamRef.current = null; // Don't own this stream
            } else {
                console.log("🎤 Recorder: Requesting own microphone access...");
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream; // We own this stream
            }

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm",
            });

            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                console.log("📼 MediaRecorder data available:", event.data.size, "bytes");
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                console.log("⏹️ MediaRecorder stopped, creating blob from", audioChunksRef.current.length, "chunks");
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                console.log("✅ Audio blob created:", audioBlob.size, "bytes");
                setAudioBlob(audioBlob);
                setVoiceState("processing");
                console.log("📦 Voice state set to 'processing'");

                // Only stop stream if we own it (not external)
                if (streamRef.current) {
                    console.log("🛑 Recorder: Stopping own stream");
                    streamRef.current.getTracks().forEach((track) => track.stop());
                    streamRef.current = null;
                } else {
                    console.log("📌 Recorder: Using external stream (not stopping it)");
                }
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setVoiceState("recording");
            console.log("🎙️ Recording started, state set to 'recording'");
        } catch (error) {
            console.error("❌ Error starting recording:", error);
            setVoiceState("idle");
            alert("Failed to access microphone. Please grant permission.");
        }
    }, []);

    const stopRecording = useCallback(() => {
        console.log("🛑 stopRecording called - voiceState:", voiceState, "mediaRecorder:", mediaRecorderRef.current ? "exists" : "null");
        console.trace("📍 stopRecording called from:");
        if (mediaRecorderRef.current && voiceState === "recording") {
            console.log("⏹️ Stopping MediaRecorder...");
            mediaRecorderRef.current.stop();
        } else {
            console.warn("⚠️ Cannot stop recording - mediaRecorder:", mediaRecorderRef.current ? "exists" : "null", "voiceState:", voiceState);
        }
    }, [voiceState]);

    const resetRecording = useCallback(() => {
        setVoiceState("idle");
        setAudioBlob(null);
        audioChunksRef.current = [];
    }, []);

    return {
        voiceState,
        setVoiceState,
        audioBlob,
        startRecording,
        stopRecording,
        resetRecording,
    };
};
