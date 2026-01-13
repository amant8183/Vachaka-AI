import { io, Socket } from "socket.io-client";
import { Message } from "@/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

interface SocketEvents {
    // Client -> Server
    join_conversation: (data: { conversationId: string }) => void;
    send_message: (data: { conversationId: string; message: string }) => void;
    voice_input: (data: { conversationId: string; audioBuffer: ArrayBuffer }) => void;

    // Server -> Client
    joined_conversation: (data: { conversationId: string; mode: string }) => void;
    message_received: (data: Message) => void;
    message_chunk: (data: { chunk: string }) => void;
    message_complete: (data: Message) => void;
    voice_transcribed: (data: { transcript: string }) => void;
    voice_processing: (data: { status: string }) => void;
    error: (data: { message: string }) => void;
}

class SocketClient {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    connect(): Socket {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts,
        });

        this.socket.on("connect", () => {
            console.log("✅ Socket connected:", this.socket?.id);
            this.reconnectAttempts = 0;
        });

        this.socket.on("disconnect", (reason) => {
            console.log("❌ Socket disconnected:", reason);
        });

        this.socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
            this.reconnectAttempts++;
        });

        return this.socket;
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket(): Socket | null {
        return this.socket;
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export const socketClient = new SocketClient();
export default socketClient;
