import { useState, useEffect, useCallback, useRef } from "react";
import { Socket } from "socket.io-client";
import { Message, ConversationMode } from "@/types";
import { socketClient } from "@/lib/socket";

export const useConversation = (conversationId: string | null) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [mode, setMode] = useState<ConversationMode>("casual");

    useEffect(() => {
        const socketInstance = socketClient.connect();
        setSocket(socketInstance);

        socketInstance.on("connect", () => {
            setIsConnected(true);
        });

        socketInstance.on("disconnect", () => {
            setIsConnected(false);
        });

        return () => {
            socketClient.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!socket || !conversationId) return;

        // Join conversation
        socket.emit("join_conversation", { conversationId });

        // Listen for joined confirmation
        socket.on("joined_conversation", (data: { conversationId: string; mode: ConversationMode }) => {
            setMode(data.mode);
        });

        // Listen for messages
        socket.on("message_received", (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        // Listen for streaming chunks
        socket.on("message_chunk", (data: { chunk: string }) => {
            setIsStreaming(true);
            setStreamingMessage((prev) => prev + data.chunk);
        });

        // Listen for complete message
        socket.on("message_complete", (message: Message) => {
            setMessages((prev) => [...prev, message]);
            setStreamingMessage("");
            setIsStreaming(false);
        });

        // Listen for errors
        socket.on("error", (data: { message: string }) => {
            console.error("Socket error:", data.message);
            alert(`Error: ${data.message}`);
        });

        // Listen for AI voice responses
        socket.on("ai_voice_response", (data: { audio: string; mimeType: string }) => {
            console.log("🎙️ Received ai_voice_response event, audio length:", data.audio?.length, "mimeType:", data.mimeType);
            // Emit event that can be caught by audio player
            const event = new CustomEvent("ai_voice_response", { detail: data });
            window.dispatchEvent(event);
            console.log("📢 Dispatched ai_voice_response custom event");
        });

        return () => {
            socket.off("joined_conversation");
            socket.off("message_received");
            socket.off("message_chunk");
            socket.off("message_complete");
            socket.off("error");
            socket.off("ai_voice_response");
        };
    }, [socket, conversationId]);

    const sendMessage = useCallback(
        (message: string) => {
            if (!socket || !conversationId) return;
            socket.emit("send_message", { conversationId, message });
        },
        [socket, conversationId]
    );

    const sendVoiceInput = useCallback(
        (audioBuffer: ArrayBuffer) => {
            if (!socket || !conversationId) {
                console.error("❌ sendVoiceInput aborted: Missing socket or conversationId", { socket: !!socket, conversationId });
                return;
            }
            console.log(`📤 useConversation sending voice input to ${conversationId}, buffer: ${audioBuffer.byteLength} bytes`);
            // Convert ArrayBuffer to Uint8Array for Socket.IO transmission
            const audioData = new Uint8Array(audioBuffer);
            socket.emit("voice_input", { conversationId, audioBuffer: audioData });
        },
        [socket, conversationId]
    );

    return {
        socket,
        isConnected,
        messages,
        streamingMessage,
        isStreaming,
        mode,
        sendMessage,
        sendVoiceInput,
        setMessages,
    };
};
