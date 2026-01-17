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
  const isCallActiveRef = useRef(false);

  const {
    isConnected,
    messages,
    streamingMessage,
    isStreaming,
    mode,
    sendMessage,
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

  const { isPlaying, isSpeaking, playAudio, stop: stopAudio } = useAudioPlayer();

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

  vadRef.current = vad;

  const [newMessage, setNewMessage] = useState("");
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

  const handleSend = () => {
    if (!newMessage.trim() || !conversationId) return;
    sendMessage(newMessage);
    setNewMessage("");
  };

  const handleMicClick = () => {
    if (voiceState === "recording") {
      stopRecording();
    } else if (voiceState === "idle") {
      startRecording();
    }
  };

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

  const handleDisconnect = useCallback(() => {
    setConversationId(null);
    setMessages([]);
  }, [setMessages]);

  useEffect(() => {
    if (!isConnected) {
      handleDisconnect();
    }
  }, [isConnected, handleDisconnect]);

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
    if (voiceState === "processing" || voiceState === "responding") return "processing";
    if (isSpeaking) return "speaking";
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
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Main content */}
      <div className="pt-20 pb-24 min-h-screen flex items-center justify-center">
        {!isCallActive ? (
          /* Start screen */
          <div className="text-center space-y-8">
            <h2
              className="text-3xl font-semibold"
              style={{ color: '#e5e5e5' }}
            >
              {mode === "interview" ? "Ready for Interview?" : "Start Conversation"}
            </h2>
            <button
              onClick={startCall}
              className="px-10 py-4 rounded-full text-lg font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
              }}
            >
              Start
            </button>
          </div>
        ) : (
          /* Voice orb with controls */
          <div className="flex flex-col items-center gap-12">
            <VoiceOrb
              state={getOrbState()}
              volume={vad.volume}
            />

            {/* Control buttons below orb */}
            <div className="flex items-center gap-4">
              {/* Pause call button */}
              <button
                onClick={stopCall}
                className="px-6 py-3 rounded-full text-sm font-medium transition-all hover:opacity-80"
                style={{
                  backgroundColor: '#404040',
                  color: '#e5e5e5',
                }}
              >
                ⏸ Pause Call
              </button>

              {/* End call button */}
              <button
                onClick={endConversation}
                className="px-6 py-3 rounded-full text-sm font-medium transition-all hover:opacity-80"
                style={{
                  backgroundColor: '#991b1b',
                  color: '#ffffff',
                }}
              >
                ✖ End Call
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
