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
                stream = externalStreamRef.current;
                streamRef.current = null; // Don't own this stream
            } else {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream; // We own this stream
            }

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm",
            });

            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                setAudioBlob(audioBlob);
                setVoiceState("processing");

                // Only stop stream if we own it (not external)
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach((track) => track.stop());
                    streamRef.current = null;
                }
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setVoiceState("recording");
        } catch (error) {
            console.error("❌ Error starting recording:", error);
            setVoiceState("idle");
            alert("Failed to access microphone. Please grant permission.");
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && voiceState === "recording") {
            mediaRecorderRef.current.stop();
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
