import { useState, useCallback, useRef } from "react";
import { VoiceState } from "@/types";

export const useVoiceRecorder = () => {
    const [voiceState, setVoiceState] = useState<VoiceState>("idle");
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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

                // Stop all tracks
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setVoiceState("recording");
        } catch (error) {
            console.error("Error starting recording:", error);
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
