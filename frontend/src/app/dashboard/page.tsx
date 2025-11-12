"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Brain, PlusCircle, Send, Mic, Loader2 } from "lucide-react";

type Chat = {
  id: number;
  userInput: string;
  aiResponse: string;
};

export default function Dashboard() {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: 1,
      userInput: "How does voice AI work?",
      aiResponse:
        "Voice AI converts speech into text, processes it using NLP models, and responds using text or synthesized voice.",
    },
    {
      id: 2,
      userInput: "Suggest a project idea.",
      aiResponse:
        "You could build a personal AI voice journal that summarizes your daily thoughts.",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setLoading(true);

    const newChat: Chat = {
      id: chats.length + 1,
      userInput: newMessage,
      aiResponse:
        "🤖 Generating smart AI response... (this will be handled by backend soon)",
    };

    setChats([...chats, newChat]);
    setNewMessage("");

    // Simulate loading (placeholder for backend call)
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <button
              onClick={() => alert("New chat feature coming soon!")}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md font-medium hover:opacity-90 transition-all shadow-sm"
            >
              <PlusCircle className="w-5 h-5" />
              New Chat
            </button>
          </div>

          {/* Chat Container */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-3">
              <Brain className="w-5 h-5 text-indigo-600" />
              Recent Conversations
            </h2>

            <div className="mt-5 space-y-4">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className="rounded-lg border border-gray-100 p-5 bg-gradient-to-br from-gray-50 to-white hover:shadow transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                      U
                    </div>
                    <p className="text-gray-800 leading-relaxed">
                      <span className="font-semibold text-gray-900">You:</span>{" "}
                      {chat.userInput}
                    </p>
                  </div>
                  <div className="flex items-start gap-3 mt-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                      AI
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {chat.aiResponse}
                    </p>
                  </div>
                </div>
              ))}
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
              className="w-full border border-gray-300 bg-white/90 rounded-full px-5 py-3 pr-14 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <Mic className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 cursor-pointer transition" />
          </div>

          <button
            onClick={handleSend}
            disabled={loading}
            className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium text-white shadow-sm transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
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
    </main>
  );
}
