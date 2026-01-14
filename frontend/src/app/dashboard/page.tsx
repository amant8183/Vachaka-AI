"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Brain, PlusCircle, Send, Mic, Loader2, MicOff, Volume2 } from "lucide-react";
import { useConversation } from "@/hooks/useConversation";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { ConversationMode, Message } from "@/types";
import { API_CONFIG } from "@/lib/config";

export default function Dashboard() {
  // For demo purposes, using a hardcoded conversation ID
  // In production, this would come from user selection or creation
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<ConversationMode>("casual");
  const [showModeSelector, setShowModeSelector] = useState(true);

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

  const {
    voiceState,
    setVoiceState,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecorder();

  const { isPlaying, isSpeaking, playAudio, stop: stopAudio } = useAudioPlayer();

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

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  // Handle audio blob when recording stops
  useEffect(() => {
    if (audioBlob && voiceState === "processing") {
      handleVoiceSubmit(audioBlob);
    }
  }, [audioBlob, voiceState]);

  const handleVoiceSubmit = async (blob: Blob) => {
    try {
      setVoiceState("responding");
      const arrayBuffer = await blob.arrayBuffer();
      sendVoiceInput(arrayBuffer);
      resetRecording();
    } catch (error) {
      console.error("Error sending voice:", error);
      resetRecording();
    }
  };

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

  const createNewConversation = async () => {
    try {
      // Create a demo user first (in production, this would be from auth)
      const userResponse = await fetch(`${API_CONFIG.BACKEND_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Demo User" }),
      });

      let userId;
      if (userResponse.ok) {
        const userData = await userResponse.json();
        userId = userData.data._id;
      } else {
        // Use a default user ID for demo
        userId = "demo-user-id";
      }

      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          mode: selectedMode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setConversationId(data.data._id);
        setShowModeSelector(false);
        setMessages([]);
      } else {
        alert("Failed to create conversation");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Failed to connect to backend. Make sure the server is running.");
    }
  };

  if (showModeSelector) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <MessageSquare className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Start a New Conversation
            </h1>
            <p className="text-gray-600">
              Choose your conversation mode to begin
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setSelectedMode("casual")}
              className={`w-full p-6 rounded-lg border-2 transition-all text-left ${selectedMode === "casual"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
                }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">💬</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    Casual Mode
                  </h3>
                  <p className="text-gray-600">
                    Friendly, conversational AI that feels like chatting with a friend.
                    Perfect for brainstorming, casual discussions, and creative ideas.
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedMode("interview")}
              className={`w-full p-6 rounded-lg border-2 transition-all text-left ${selectedMode === "interview"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
                }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">💼</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    Interview Mode
                  </h3>
                  <p className="text-gray-600">
                    Professional, structured AI interviewer. Great for practice interviews,
                    formal discussions, and professional feedback.
                  </p>
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={createNewConversation}
            className="w-full mt-8 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:opacity-90 transition-all shadow-sm"
          >
            Start Conversation
          </button>
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

          {/* Chat Container */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-3">
              <Brain className="w-5 h-5 text-indigo-600" />
              Conversation
            </h2>

            <div className="mt-5 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-100 p-5 bg-gradient-to-br from-gray-50 to-white hover:shadow transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold ${message.role === "user"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-indigo-100 text-indigo-600"
                        }`}
                    >
                      {message.role === "user" ? "U" : "AI"}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 leading-relaxed">
                        <span className="font-semibold text-gray-900">
                          {message.role === "user" ? "You:" : "AI:"}
                        </span>{" "}
                        {message.content}
                      </p>
                      {message.metadata?.isVoice && (
                        <span className="text-xs text-gray-500 mt-1 inline-block">
                          🎙️ Voice message
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Streaming message */}
              {isStreaming && streamingMessage && (
                <div className="rounded-lg border border-gray-100 p-5 bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                      AI
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 leading-relaxed">
                        <span className="font-semibold text-gray-900">AI:</span>{" "}
                        {streamingMessage}
                        <span className="inline-block w-2 h-4 bg-indigo-600 ml-1 animate-pulse" />
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {messages.length === 0 && !isStreaming && (
                <div className="text-center py-12 text-gray-500">
                  <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Start a conversation by typing or using voice</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Input Bar */}
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
            <button
              onClick={handleMicClick}
              disabled={!isConnected}
              className={`absolute right-4 top-1/2 -translate-y-1/2 transition ${voiceState === "recording"
                ? "text-red-600 animate-pulse"
                : voiceState === "idle"
                  ? "text-gray-500 hover:text-blue-600 cursor-pointer"
                  : "text-gray-400"
                }`}
            >
              {voiceState === "recording" ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
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
                Responding...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send
              </>
            )}
          </button>
        </div>

        {voiceState !== "idle" && (
          <div className="max-w-5xl mx-auto mt-2 text-center text-sm text-gray-600">
            {voiceState === "recording" && "🎙️ Recording... Click mic to stop"}
            {voiceState === "processing" && "⚙️ Processing audio..."}
            {voiceState === "responding" && "🤖 AI is responding..."}
          </div>
        )}
      </div>
    </main>
  );
}
