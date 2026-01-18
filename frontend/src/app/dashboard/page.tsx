"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useConversation } from "@/hooks/useConversation";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useVoiceActivityDetection } from "@/hooks/useVoiceActivityDetection";
import { useSharedMicrophoneStream } from "@/hooks/useSharedMicrophoneStream";
import { ConversationMode } from "@/types";
import { API_CONFIG } from "@/lib/config";
import { VoiceOrb } from "@/components/VoiceOrb";
import { TranscriptDrawer } from "@/components/TranscriptDrawer";
import { ModeSelector } from "@/components/ModeSelector";
import type { VoiceState } from "@/lib/design-tokens";

export default function Dashboard() {
  // ==================== STATE (UNCHANGED) ====================
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<ConversationMode>("casual");
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [autoMode] = useState(true); // Always auto mode
  const [isCallActive, setIsCallActive] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const isCallActiveRef = useRef(false);
  const prevSpeakingRef = useRef(false);

  const {
    isConnected,
    messages,
    streamingMessage,
    isStreaming,
    mode,
    sendVoiceInput,
    setMessages,
  } = useConversation(conversationId);

  const micStream = useSharedMicrophoneStream();

  const {
    voiceState,
    setVoiceState,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecorder(micStream.stream);

  const { isSpeaking, playAudio } = useAudioPlayer();

  const vadRef = useRef<ReturnType<typeof useVoiceActivityDetection> | null>(null);

  // ==================== CALLBACKS (UNCHANGED) ====================
  const handleSpeechStart = useCallback(() => {
    console.log("🎙️ Speech detected - starting recording");
    const callActive = isCallActiveRef.current;
    console.log("🔍 Checking conditions - autoMode:", autoMode, "voiceState:", voiceState, "isSpeaking:", isSpeaking, "isCallActive:", callActive);
    if (autoMode && voiceState === "idle" && !isSpeaking && callActive) {
      console.log("▶️ Starting recording (VAD continues monitoring)...");
      startRecording();
    } else {
      console.log("⚠️ Cannot start recording - conditions not met");
    }
  }, [autoMode, voiceState, isSpeaking, startRecording]);

  const handleSpeechEnd = useCallback(() => {
    console.log("🔇 Silence detected - stopping recording");
    if (autoMode && voiceState === "recording") {
      console.log("⏹️ Stopping recording due to silence");
      stopRecording();
    }
  }, [autoMode, voiceState, stopRecording]);

  const vadConfig = {
    enabled: autoMode,
    threshold: 15, // Lower threshold for faster pickup (from 20)
    minSpeechDuration: 250, // Faster detection (from 300ms)
    silenceDuration: 800, // Reduced from 1500ms for faster response
  };

  const vad = useVoiceActivityDetection(
    vadConfig,
    handleSpeechStart,
    handleSpeechEnd,
    micStream.stream
  );

  // Update ref in useEffect to avoid updating during render
  useEffect(() => {
    vadRef.current = vad;
  }, [vad]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ==================== EFFECTS (UNCHANGED) ====================
  useEffect(() => {
    const handleVoiceResponse = (event: Event) => {
      const customEvent = event as CustomEvent<{ audio: string; mimeType: string }>;
      playAudio(customEvent.detail.audio, customEvent.detail.mimeType);
    };

    window.addEventListener("ai_voice_response", handleVoiceResponse);
    return () => window.removeEventListener("ai_voice_response", handleVoiceResponse);
  }, [playAudio]);

  // Set processing state when voice recording ends
  useEffect(() => {
    if (voiceState === "processing" || voiceState === "responding") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsProcessingAudio(true);
    }
  }, [voiceState]);

  // Clear processing state when AI starts speaking
  useEffect(() => {
    if (isSpeaking && !prevSpeakingRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsProcessingAudio(false);
    }

    prevSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingMessage]);

  const handleVoiceSubmit = useCallback(async (blob: Blob) => {
    try {
      console.log("🎤 handleVoiceSubmit called with blob:", blob.size, "bytes");
      setVoiceState("responding");
      const arrayBuffer = await blob.arrayBuffer();
      console.log("📤 Sending voice input via WebSocket, size:", arrayBuffer.byteLength);
      sendVoiceInput(arrayBuffer);
      resetRecording();
      console.log("✅ Voice input sent successfully");
    } catch (error) {
      console.error("❌ Error sending voice:", error);
      resetRecording();
    }
  }, [sendVoiceInput, resetRecording, setVoiceState]);

  useEffect(() => {
    console.log("📦 Audio blob effect triggered - voiceState:", voiceState, "audioBlob:", audioBlob ? `${audioBlob.size} bytes` : "null");
    if (audioBlob && voiceState === "processing") {
      handleVoiceSubmit(audioBlob);
    }
  }, [audioBlob, voiceState, handleVoiceSubmit]);



  const startCall = async () => {
    console.log("📞 startCall() called - setting isCallActive to true");

    try {
      console.log("🎤 Requesting microphone access...");
      await micStream.start();
      console.log("✅ Shared mic stream started");
    } catch (error) {
      console.error("❌ Failed to start microphone:", error);
      alert("Failed to access microphone. Please check permissions.");
      return;
    }

    setIsCallActive(true);
    isCallActiveRef.current = true;

    if (autoMode) {
      console.log("🎙️ Auto mode is ON, starting VAD listening...");
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log("🔍 About to start VAD, micStream.stream:", micStream.stream ? "exists" : "null");
      await vad.startListening();
    }

    console.log("✅ Call started, isCallActive:", true);
  };

  const stopCall = () => {
    console.log("⏸️ Stopping call...");
    vad.stopListening();
    if (voiceState === "recording") {
      stopRecording();
    }
    micStream.stop();
    setIsCallActive(false);
    isCallActiveRef.current = false;
    console.log("✅ Call stopped");
  };

  const endConversation = () => {
    if (confirm("End this conversation and start a new one?")) {
      stopCall();
      setShowModeSelector(true);
      setConversationId(null);
    }
  };

  // Handle disconnection - intentional cleanup when connection is lost
  useEffect(() => {
    if (!isConnected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConversationId(null);
      setMessages([]);
    }
  }, [isConnected, setMessages]);

  // ==================== CONVERSATION CREATION (UNCHANGED) ====================
  const createNewConversation = async (ttsProvider: "groq" | "deepgram") => {
    try {
      const userResponse = await fetch(`${API_CONFIG.BACKEND_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Demo User" }),
      });

      let userId;
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log("User created:", userData);
        userId = userData.data?._id || userData._id;
      } else {
        console.error("User creation failed");
        alert("Failed to create user");
        return;
      }

      console.log("Creating conversation with:", { userId, mode: selectedMode, ttsProvider });
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          mode: selectedMode,
          ttsProvider: ttsProvider,
        }),
      });

      if (response.ok) {
        const responseJson = await response.json();
        console.log("✅ Conversation created response:", responseJson);
        const conversationId = responseJson.data?._id || responseJson._id;
        console.log("✅ Setting conversation ID:", conversationId);
        setConversationId(conversationId);
        setShowModeSelector(false);
      } else {
        const error = await response.json();
        console.error("Failed to create conversation:", error);
        alert("Failed to create conversation");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Failed to create conversation");
    }
  };

  // ==================== RENDER ====================
  // Map voice states to orb states
  const getOrbState = (): VoiceState => {
    if (voiceState === "recording") return "listening";
    if (isSpeaking) return "speaking";
    if (isProcessingAudio) return "processing";
    return "idle";
  };

  if (showModeSelector) {
    return (
      <ModeSelector
        onSelectMode={(mode, ttsProvider) => {
          setSelectedMode(mode);
          createNewConversation(ttsProvider);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen overflow-hidden relative" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Diagonal grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 50px, #e5e5e5 50px, #e5e5e5 51px), repeating-linear-gradient(-45deg, transparent, transparent 50px, #e5e5e5 50px, #e5e5e5 51px)`,
        }}
      />

      {/* Main content */}
      <div className="relative z-10 pt-20 pb-24 min-h-screen flex items-center justify-center">
        {!isCallActive ? (
          /* Start screen */
          <div className="text-center space-y-8 sm:space-y-10 px-4 max-w-3xl mx-auto">
            <div className="space-y-3 sm:space-y-4">
              <h2
                className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight"
                style={{
                  color: '#e5e5e5',
                  letterSpacing: '-0.02em',
                }}
              >
                {mode === "interview" ? "Ready for Interview?" : "Start Conversation"}
              </h2>
              <p
                className="text-lg sm:text-xl md:text-2xl"
                style={{ color: '#737373' }}
              >
                {mode === "interview"
                  ? "Practice your interview skills with AI feedback"
                  : "Have a natural voice conversation with AI"}
              </p>
            </div>

            <div className="pt-2 sm:pt-4">
              <button
                onClick={startCall}
                className="group relative px-10 py-3.5 sm:px-12 sm:py-4 rounded-xl text-base sm:text-lg font-medium transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                style={{
                  border: '1.5px solid rgba(220, 38, 38, 0.5)',
                  color: '#e5e5e5',
                  boxShadow: '0 8px 32px -8px rgba(220, 38, 38, 0.4)',
                }}
              >
                {/* Hover gradient overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.3) 0%, rgba(185, 28, 28, 0.3) 100%)',
                  }}
                />
                {/* Shine effect on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 group-hover:animate-[shimmer_1s_ease-in-out]"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                    transform: 'translateX(-100%)',
                  }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2.5">
                  Start
                  <svg
                    className="w-5 h-5 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* Voice orb with controls */
          <div className="flex flex-col items-center gap-12 sm:gap-16 md:gap-20 px-4">
            <VoiceOrb
              state={getOrbState()}
              volume={vad.volume}
            />

            {/* Control buttons below orb */}
            <div className="pt-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 w-full sm:w-auto max-w-md sm:max-w-none">
              {/* Pause call button */}
              <button
                onClick={stopCall}
                className="group relative px-8 py-4 sm:px-9 sm:py-4 rounded-xl text-sm sm:text-base font-medium transition-all duration-300 hover:scale-[1.02] overflow-hidden w-full sm:w-auto backdrop-blur-sm"
                style={{
                  backgroundColor: 'rgba(17, 17, 17, 0.6)',
                  border: '1.5px solid rgba(229, 229, 229, 0.15)',
                  color: '#e5e5e5',
                  boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.4)',
                }}
              >
                {/* Subtle background glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'radial-gradient(circle at 50% 0%, rgba(229, 229, 229, 0.08), transparent 70%)',
                  }}
                />
                {/* Hover border enhancement */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    border: '1.5px solid rgba(229, 229, 229, 0.25)',
                  }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2.5">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 9v6m4-6v6"
                    />
                  </svg>
                  Pause Call
                </span>
              </button>

              {/* End call button */}
              <button
                onClick={endConversation}
                className="group relative px-8 py-4 sm:px-9 sm:py-4 rounded-xl text-sm sm:text-base font-medium transition-all duration-300 hover:scale-[1.02] overflow-hidden w-full sm:w-auto"
                style={{
                  border: '1.5px solid rgba(220, 38, 38, 0.5)',
                  color: '#e5e5e5',
                  boxShadow: '0 8px 32px -8px rgba(220, 38, 38, 0.4)',
                }}
              >
                {/* Premium hover gradient */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'rgba(153, 27, 27, 0.3)',
                  }}
                />
                {/* Subtle glow effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-300"
                  style={{
                    background: 'radial-gradient(circle at 50% 0%, rgba(220, 38, 38, 0.2), transparent 70%)',
                  }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2.5">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  End Call
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transcript drawer */}
      {isCallActive && (
        <TranscriptDrawer
          messages={messages}
          streamingMessage={isStreaming ? streamingMessage : undefined}
          isOpen={drawerOpen}
          onToggle={() => setDrawerOpen(!drawerOpen)}
        />
      )}
    </div>
  );
}
