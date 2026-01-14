"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, Brain, PlusCircle, Send, Mic, Loader2, MicOff, Volume2, Settings } from "lucide-react";
import { useConversation } from "@/hooks/useConversation";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useVoiceActivityDetection } from "@/hooks/useVoiceActivityDetection";
import { useSharedMicrophoneStream } from "@/hooks/useSharedMicrophoneStream";
import { ConversationMode, Message } from "@/types";
import { API_CONFIG } from "@/lib/config";

export default function Dashboard() {
  // Conversation state
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<ConversationMode>("casual");
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [autoMode, setAutoMode] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false); // Call session state
  const isCallActiveRef = useRef(false); // Ref to avoid closure issues

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

  // Shared microphone stream for both VAD and recording
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

  // Voice Activity Detection - declare early so callbacks can reference it
  const vadRef = useRef<ReturnType<typeof useVoiceActivityDetection> | null>(null);

  // VAD callbacks - simplified with shared stream
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

  // Voice Activity Detection - initialize without stream first
  // Stream will be passed when we call startListening() after mic access
  const vadConfig = {
    enabled: autoMode,
    threshold: 20,
    minSpeechDuration: 300,
    silenceDuration: 1500,
  };

  const vad = useVoiceActivityDetection(
    vadConfig,
    handleSpeechStart,
    handleSpeechEnd,
    micStream.stream  // Will be null initially, populated after start()
  );

  // Store VAD in ref so callbacks can access it
  vadRef.current = vad;

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Listen for AI voice responses
  useEffect(() => {
    const handleVoiceResponse = (event: Event) => {
      const customEvent = event as CustomEvent<{ audio: string; mimeType: string }>;
      playAudio(customEvent.detail.audio, customEvent.detail.mimeType);
    };

    window.addEventListener("ai_voice_response", handleVoiceResponse);
    return () => window.removeEventListener("ai_voice_response", handleVoiceResponse);
  }, [playAudio]);

  // Start/stop VAD when auto-mode or call state changes
  useEffect(() => {
    if (autoMode && conversationId && isCallActive) {
      vad.startListening();
    } else {
      vad.stopListening();
    }
  }, [autoMode, conversationId, isCallActive]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  // Handle audio blob when recording stops
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
  }, [sendVoiceInput, resetRecording]);

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
    if (voiceState === "idle") {
      startRecording();
    } else if (voiceState === "recording") {
      stopRecording();
    }
  };

  // Call control functions
  const startCall = async () => {
    console.log("📞 startCall() called - setting isCallActive to true");
    try {
      // Start shared microphone stream
      await micStream.start();
      console.log("✅ Shared mic stream started");

      setIsCallActive(true);
      isCallActiveRef.current = true;

      if (autoMode) {
        console.log("🎙️ Auto mode is ON, starting VAD listening...");
        // Small delay to ensure micStream.stream prop has propagated to VAD hook
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log("🔍 About to start VAD, micStream.stream:", micStream.stream ? "exists" : "null");
        await vad.startListening();
      }
      console.log("✅ Call started, isCallActive:", true);
    } catch (error) {
      console.error("❌ Failed to start call:", error);
      alert("Failed to access microphone. Please grant permission.");
    }
  };

  const stopCall = () => {
    console.log("⏸️ Stopping call...");
    setIsCallActive(false);
    isCallActiveRef.current = false;
    vad.stopListening();
    if (voiceState === "recording") {
      stopRecording();
    }
    stopAudio();
    // Stop shared mic stream
    micStream.stop();
    console.log("✅ Call stopped");
  };

  const endConversation = () => {
    stopCall();
    setMessages([]);
    setConversationId(null);
    setShowModeSelector(true);
  };

  const createNewConversation = async () => {
    try {
      // Create a demo user first (in production, this would come from auth)
      const userResponse = await fetch(`${API_CONFIG.BACKEND_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Demo User" }),
      });

      let userId;
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log("User created:", userData);
        // API returns { success: true, data: { _id: "..." } }
        userId = userData.data?._id || userData._id;
      } else {
        console.error("User creation failed");
        alert("Failed to create user");
        return;
      }

      // Create conversation with mode
      console.log("Creating conversation with:", { userId, mode: selectedMode });
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          mode: selectedMode,
        }),
      });

      if (response.ok) {
        const responseJson = await response.json();
        console.log("✅ Conversation created response:", responseJson);
        const conversationId = responseJson.data?._id || responseJson._id; // Handle both structures just in case
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

  // Mode selector screen
  if (showModeSelector) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Voice AI Agent
            </h1>
            <p className="text-gray-600 text-lg">
              Choose your conversation mode to begin
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Casual Mode */}
            <button
              onClick={() => {
                setSelectedMode("casual");
                createNewConversation();
              }}
              className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Casual Chat</h3>
                <p className="text-gray-600">
                  Friendly, relaxed conversation for general topics and casual discussions
                </p>
              </div>
            </button>

            {/* Interview Mode */}
            <button
              onClick={() => {
                setSelectedMode("interview");
                createNewConversation();
              }}
              className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-indigo-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Brain className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Interview Mode</h3>
                <p className="text-gray-600">
                  Professional interview practice with structured questions and feedback
                </p>
              </div>
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {mode === "casual" ? "💬 Casual" : "💼 Interview"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                title={isConnected ? "Connected" : "Disconnected"}
              />
              {vad.isListening && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>Listening...</span>
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span>AI Speaking...</span>
                </div>
              )}
              <button
                onClick={() => setAutoMode(!autoMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all shadow-sm ${autoMode
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                title={autoMode ? "Auto-mode ON - Hands-free" : "Auto-mode OFF - Manual"}
              >
                <Settings className="w-4 h-4" />
                {autoMode ? "Auto" : "Manual"}
              </button>
              <button
                onClick={() => {
                  setShowModeSelector(true);
                  setConversationId(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md font-medium hover:opacity-90 transition-all shadow-sm"
              >
                <PlusCircle className="w-5 h-5" />
                New Chat
              </button>
            </div>
          </div>

          {/* Chat Container with Call Controls */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-3">
              <Brain className="w-5 h-5 text-indigo-600" />
              Conversation
            </h2>

            {!isCallActive ? (
              /* Call Start Screen */
              <div className="flex flex-col items-center justify-center py-16 space-y-6">
                <div className="text-center space-y-3">
                  <h3 className="text-3xl font-bold text-gray-900">
                    {mode === "interview" ? "Ready for Interview?" : "Start Conversation"}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {autoMode
                      ? "Auto-mode enabled - Just speak naturally when the call starts"
                      : "Click the mic button to speak or type your messages"}
                  </p>
                </div>
                <button
                  onClick={startCall}
                  className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-xl font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-2xl transform hover:scale-105"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Start Conversation
                </button>
              </div>
            ) : (
              <>
                {/* Active Call Controls */}
                <div className="flex items-center justify-between py-4 border-b border-gray-200 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-semibold text-gray-700">Call Active</span>
                    </div>

                    {/* VAD Status Indicators */}
                    {autoMode && (
                      <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-300">
                        {/* Volume Meter */}
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-100"
                              style={{ width: `${Math.min((vad.volume / 255) * 100, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Speech Detection Status */}
                        {vad.isSpeaking ? (
                          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span>Speaking Detected</span>
                          </div>
                        ) : vad.isListening ? (
                          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span>Waiting for speech...</span>
                          </div>
                        ) : null}

                        {/* Recording/Processing Status */}
                        {voiceState === "recording" && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                            <span>Recording...</span>
                          </div>
                        )}
                        {voiceState === "processing" && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Processing...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={stopCall}
                      className="flex items-center gap-2 px-5 py-2.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-all font-semibold shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pause
                    </button>
                    <button
                      onClick={endConversation}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-semibold shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      End
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto py-2"
                  style={{ scrollbarWidth: "thin" }}>
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                          }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold opacity-70">
                            {msg.role === "user" ? "You" : "AI"}
                          </span>
                          {msg.metadata?.isVoice && (
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                              🎙️ Voice
                            </span>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Streaming message */}
                  {isStreaming && streamingMessage && (
                    <div className="flex justify-start">
                      <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-gray-100 text-gray-900">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold opacity-70">AI</span>
                          <Loader2 className="w-3 h-3 animate-spin" />
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {streamingMessage}
                        </p>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Input Bar - Only show when call is active */}
      {isCallActive && (
        <div className="w-full border-t border-gray-200 bg-white/70 backdrop-blur-lg sticky bottom-0 py-4 px-4">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                disabled={!isConnected || voiceState !== "idle"}
                className="w-full border border-gray-300 bg-white/90 rounded-full px-5 py-3 pr-14 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm disabled:opacity-50"
              />
              {!autoMode && (
                <button
                  onClick={handleMicClick}
                  disabled={!isConnected}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition ${voiceState === "recording"
                    ? "text-red-600 animate-pulse"
                    : voiceState === "idle"
                      ? "text-gray-600 hover:text-blue-600"
                      : "text-gray-400"
                    }`}
                >
                  {voiceState === "recording" ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>

            <button
              onClick={handleSend}
              disabled={!isConnected || isStreaming || !newMessage.trim()}
              className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium text-white shadow-sm transition-all ${!isConnected || isStreaming || !newMessage.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90"
                }`}
            >
              {isStreaming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
