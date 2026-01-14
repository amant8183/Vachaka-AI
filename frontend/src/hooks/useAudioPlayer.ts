import { useState, useEffect, useRef, useCallback } from "react";

interface AudioPlayerState {
    isPlaying: boolean;
    isSpeaking: boolean;
    currentAudio: string | null;
}

export const useAudioPlayer = () => {
    const [state, setState] = useState<AudioPlayerState>({
        isPlaying: false,
        isSpeaking: false,
        currentAudio: null,
    });

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioQueueRef = useRef<string[]>([]);

    // Initialize audio element
    useEffect(() => {
        audioRef.current = new Audio();

        audioRef.current.addEventListener("play", () => {
            setState(prev => ({ ...prev, isPlaying: true, isSpeaking: true }));
        });

        audioRef.current.addEventListener("ended", () => {
            setState(prev => ({ ...prev, isPlaying: false, isSpeaking: false }));
            playNext();
        });

        audioRef.current.addEventListener("error", (e) => {
            console.error("Audio playback error:", e);
            setState(prev => ({ ...prev, isPlaying: false, isSpeaking: false }));
            playNext();
        });

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const playNext = useCallback(() => {
        if (audioQueueRef.current.length > 0) {
            const nextAudio = audioQueueRef.current.shift();
            if (nextAudio && audioRef.current) {
                audioRef.current.src = nextAudio;
                audioRef.current.play().catch(err => {
                    console.error("Error playing audio:", err);
                    playNext();
                });
            }
        }
    }, []);

    const playAudio = useCallback((audioBase64: string, mimeType: string = "audio/mpeg") => {
        console.log("🔊 playAudio called with base64 length:", audioBase64.length, "mimeType:", mimeType);

        try {
            // Convert base64 to blob URL
            const byteCharacters = atob(audioBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });
            const audioUrl = URL.createObjectURL(blob);

            console.log("🎵 Audio blob created, size:", blob.size, "bytes, URL:", audioUrl);

            setState(prev => ({ ...prev, currentAudio: audioUrl }));

            // If currently playing, queue it
            if (state.isPlaying) {
                console.log("⏸️ Currently playing, queueing audio");
                audioQueueRef.current.push(audioUrl);
            } else {
                // Play immediately
                console.log("▶️ Playing audio immediately");
                if (audioRef.current) {
                    audioRef.current.src = audioUrl;
                    audioRef.current.play()
                        .then(() => console.log("✅ Audio playback started"))
                        .catch(err => {
                            console.error("❌ Error playing audio:", err);
                        });
                }
            }
        } catch (error) {
            console.error("❌ Error in playAudio:", error);
        }
    }, [state.isPlaying]);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        audioQueueRef.current = [];
        setState({
            isPlaying: false,
            isSpeaking: false,
            currentAudio: null,
        });
    }, []);

    return {
        isPlaying: state.isPlaying,
        isSpeaking: state.isSpeaking,
        playAudio,
        stop,
    };
};
