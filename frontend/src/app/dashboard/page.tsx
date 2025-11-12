"use client";

import { useState } from "react";
import { MessageSquare, Brain, PlusCircle } from "lucide-react";

type Chat = {
  id: number;
  userInput: string;
  aiResponse: string;
};

export default function Dashboard() {
  const [chats] = useState<Chat[]>([
    { id: 1, userInput: "How does voice AI work?", aiResponse: "Voice AI converts speech into text, processes it using NLP models, and responds using text or synthesized voice." },
    { id: 2, userInput: "Suggest a project idea.", aiResponse: "You could build a personal AI voice journal that summarizes your daily thoughts." },
  ]);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <button
            onClick={() => alert("New chat coming soon!")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-all shadow-sm"
          >
            <PlusCircle className="w-5 h-5" />
            New Chat
          </button>
        </div>

        {/* Conversations Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-3">
            <Brain className="w-5 h-5 text-indigo-600" />
            Recent Conversations
          </h2>

          <div className="mt-5 space-y-4">
            {chats.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">
                No conversations yet — start chatting with your AI assistant!
              </p>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className="rounded-lg border border-gray-100 p-5 hover:shadow-sm transition bg-gradient-to-br from-gray-50 to-white"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 text-lg">🧑‍💻</span>
                    <p className="text-gray-800 leading-relaxed">
                      <span className="font-semibold text-gray-900">You:</span>{" "}
                      {chat.userInput}
                    </p>
                  </div>
                  <div className="flex items-start gap-3 mt-2">
                    <span className="text-indigo-600 text-lg">🤖</span>
                    <p className="text-gray-700 leading-relaxed">
                      <span className="font-semibold text-gray-900">AI:</span>{" "}
                      {chat.aiResponse}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
