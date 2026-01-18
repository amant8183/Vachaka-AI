
<div align="center" style="margin-bottom: 20px;">
  <img src="frontend/public/favicon.ico" alt="Vachaka AI Logo" width="70" style="vertical-align: bottom; margin-right: 10px;" />
  <h1>Vachaka AI</h1>
</div>


<div align="center" style="margin-bottom: 20px;">

**Production-grade Real-time Voice AI Agent**  
*Built for latency-critical applications with streaming text & audio.*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-5-green?style=for-the-badge&logo=nodedotjs)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-blue?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![Groq](https://img.shields.io/badge/Groq-LPU-orange?style=for-the-badge)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-gray?style=for-the-badge)](LICENSE)

[Live Demo](https://vachaka-ai.vercel.app/) • [Report Bug](https://github.com/amant8183/Vachaka-AI/issues) • [Request Feature](https://github.com/amant8183/Vachaka-AI/issues)

</div>

---

## 🚀 Overview

**Vachaka AI** is a state-of-the-art conversational agent designed to bridge the gap between human speech and AI intelligence. Unlike traditional chatbots, Vachaka processes audio streams in real-time, delivering sub-second latency responses.

It features **dual-mode intelligence**:
*   **Casual Mode 💬**: Perfect for open-ended brainstorming and friendly chat.
*   **Interview Mode 💼**: A structured, professional persona for mock interviews and assessments.

## ✨ Key Features

### 🧠 Advanced AI Core
*   **Real-time Streaming**: Token-by-token responses via WebSockets for instant feedback.
*   **Multi-LLM Support**: Powered by **Groq** (LLaMA 3) for speed, with **OpenAI** fallback.
*   **Context Awareness**: Maintains conversation history for coherent long-form interactions.

### 🗣️ Voice Capabilities
*   **Instant Transcription**: High-fidelity STT using **Deepgram Nova-2** or **OpenAI Whisper**.
*   **Voice Activity Detection**: Smart silence detection to manage turn-taking naturally.

### 🏗️ Production Architecture
*   **Hybrid Deployment**:
    *   **Frontend**: Next.js App Router deployed on **Vercel** (Global Edge Network).
    *   **Backend**: Express/Socket.io server on **AWS EC2**.
    *   **Networking**: Secure **Cloudflare Tunnel** for encrypted low-latency ingress.
*   **Scalable**: Modular service architecture separating AI, STT, and WebSocket layers.

---

## 📦 Tech Stack

### Frontend (Client)
*   **Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS v4 + Framer Motion
*   **Real-time**: Socket.IO Client
*   **Audio**: Web Audio API + MediaRecorder

### Backend (Server)
*   **Runtime**: Node.js / Express 5
*   **Database**: MongoDB (Atlas)
*   **Transport**: Socket.IO (WebSockets)
*   **AI Engine**: Groq SDK / OpenAI SDK
*   **Compute**: AWS EC2 (Amazon Linux 2023)

---

## 🛠️ Installation & Setup

### Prerequisites
*   Node.js 18+
*   MongoDB Instance
*   API Keys (Groq, OpenAI, or Deepgram)

### 1. Clone Repository
```bash
git clone https://github.com/amant8183/Vachaka-AI.git
cd Vachaka-AI
```

### 2. Configure Backend
```bash
cd backend
npm install
```

Create `.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://...
FRONTEND_URL=http://localhost:3000
AI_PROVIDER=groq
GROQ_API_KEY=gsk_...
DEEPGRAM_API_KEY=...
```

### 3. Configure Frontend
```bash
cd frontend
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### 4. Run Locally
**Terminal 1 (Backend):**
```bash
cd backend && npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend && npm run dev
```

Visit `http://localhost:3000` to start chatting.

---

## 🌍 Deployment Guide

### Architecture Diagram
```plaintext
[User Browser] <--> [Vercel (Frontend)]
       ^
       | (WSS / HTTPS)
       v
[Cloudflare Tunnel] <--> [AWS EC2 (Backend)] <--> [MongoDB Atlas]
                                 ^
                                 |
                        [Groq/Deepgram API]
```

### Backend (AWS EC2)
1.  **Provision**: Launch Amazon Linux 2023 instance.
2.  **Environment**: Install Node.js, PM2, and Git.
3.  **Tunnel**: Install `cloudflared` for secure HTTPS ingress.
    ```bash
    cloudflared tunnel --url http://localhost:5000
    ```
4.  **Process Management**: Use PM2 to keep services alive.
    ```bash
    pm2 start dist/server.js --name "vachaka-backend"
    pm2 start cloudflared --name "tunnel"
    ```

### Frontend (Vercel)
1.  Import project to Vercel.
2.  Set Environment Variable:
    *   `NEXT_PUBLIC_BACKEND_URL`: Your Cloudflare Tunnel URL (e.g., `https://xyz.trycloudflare.com`).
3.  Deploy.

---

## 🤝 Contributing

Contributions are welcome! Please check out the [issues](https://github.com/amant8183/Vachaka-AI/issues) or submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/amant8183">Aman Tiwari</a></p>
</div>
