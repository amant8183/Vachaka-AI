# Voice AI Dashboard

A production-grade **real-time Voice AI Agent** built with **Next.js**, **Express**, **WebSockets**, and **AI integration**. Supports both casual conversations and professional interview modes with voice and text input.

## 🎯 Features

### Core Capabilities
- ✅ **Real-time AI Conversations** - Streaming responses via WebSocket
- ✅ **Voice Input** - Record and transcribe voice messages
- ✅ **Dual Conversation Modes**
  - 💬 **Casual Mode**: Friendly, conversational AI
  - 💼 **Interview Mode**: Professional, structured interviewer
- ✅ **Persistent History** - All conversations saved to MongoDB
- ✅ **Modern UI** - Clean, responsive dashboard with real-time updates

### Technical Features
- WebSocket-based real-time communication
- Streaming AI responses (token-by-token)
- Speech-to-Text integration (Whisper/Deepgram)
- Production-grade architecture with clean separation of concerns
- TypeScript throughout (frontend & backend)
- Error handling and reconnection logic

## 📦 Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Socket.IO Client**
- **MediaRecorder API** for voice recording

### Backend
- **Express 5**
- **TypeScript**
- **MongoDB + Mongoose**
- **Socket.IO** for WebSockets
- **Groq SDK** (LLaMA 3) or **OpenAI** for AI
- **Whisper/Deepgram** for Speech-to-Text

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- API Keys:
  - Groq API key OR OpenAI API key
  - OpenAI API key (for Whisper) OR Deepgram API key

### Installation

#### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 2. Configure Backend Environment

Create `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/voice-ai-dashboard

# Frontend
FRONTEND_URL=http://localhost:3000

# AI Provider (choose one: groq or openai)
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
# OR
# AI_PROVIDER=openai
# OPENAI_API_KEY=your_openai_api_key_here

# STT Provider (choose one: whisper, deepgram, or assemblyai)
STT_PROVIDER=whisper
# If using Whisper, you need OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here
# OR
# STT_PROVIDER=deepgram
# DEEPGRAM_API_KEY=your_deepgram_api_key_here
```

#### 3. Configure Frontend Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

#### 4. Start MongoDB

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas cloud database
```

#### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### 6. Open the App

Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Starting a Conversation

1. **Select Mode**: Choose between Casual or Interview mode
2. **Start Conversation**: Click "Start Conversation" button
3. **Interact**:
   - **Text**: Type your message and press Enter or click Send
   - **Voice**: Click the microphone icon, speak, then click again to stop

### Conversation Modes

#### Casual Mode 💬
- Friendly, conversational tone
- Natural language responses
- Follow-up questions
- Great for brainstorming and creative discussions

#### Interview Mode 💼
- Professional, structured questions
- Formal tone
- Direct and concise
- Perfect for interview practice

### Voice Recording
- Click microphone icon to start recording
- Speak your message
- Click again to stop and send
- Audio is transcribed and sent to AI
- Response streams back in real-time

## 🏗️ Architecture

### Backend Structure
```
backend/src/
├── server.ts              # Entry point with WebSocket
├── app.ts                 # Express configuration
├── config/
│   └── env.ts            # Environment config
├── db/
│   └── index.ts          # MongoDB connection
├── models/
│   ├── User.ts           # User schema
│   ├── Conversation.ts   # Conversation schema
│   └── Message.ts        # Message subdocument
├── routes/
│   ├── user.routes.ts
│   ├── conversation.routes.ts
│   └── agent.routes.ts
├── controllers/
│   ├── user.controller.ts
│   ├── conversation.controller.ts
│   └── agent.controller.ts
├── services/
│   ├── ai.service.ts      # AI integration
│   ├── stt.service.ts     # Speech-to-Text
│   ├── tts.service.ts     # TTS placeholder
│   └── memory.service.ts  # Conversation memory
├── websocket/
│   └── socket.ts          # WebSocket handlers
├── middlewares/
│   └── error.middleware.ts
└── utils/
    ├── prompts.ts         # System prompts
    └── logger.ts          # Logging utility
```

### Frontend Structure
```
frontend/src/
├── app/
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   └── dashboard/
│       └── page.tsx       # Main dashboard
├── components/
│   └── navbar.tsx         # Navigation
├── lib/
│   └── socket.ts          # WebSocket client
├── hooks/
│   ├── useVoiceRecorder.ts
│   └── useConversation.ts
└── types/
    └── index.ts           # TypeScript types
```

## 🔌 API Endpoints

### REST API

#### Users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user

#### Conversations
- `POST /api/conversations` - Create conversation
- `GET /api/conversations/user/:userId` - Get user conversations
- `GET /api/conversations/:id` - Get conversation
- `PATCH /api/conversations/:id` - Update conversation
- `DELETE /api/conversations/:id` - Delete conversation

#### Agent
- `POST /api/agent/transcribe` - Transcribe audio
- `POST /api/agent/message` - Send message (REST fallback)

### WebSocket Events

#### Client → Server
- `join_conversation` - Join conversation room
- `send_message` - Send text message
- `voice_input` - Send voice audio

#### Server → Client
- `joined_conversation` - Confirmation of join
- `message_received` - New message added
- `message_chunk` - Streaming AI response chunk
- `message_complete` - AI response complete
- `voice_transcribed` - Voice transcription result
- `voice_processing` - Voice processing status
- `error` - Error occurred

## 🧪 Testing

### Manual Testing Checklist

1. **Voice Recording**
   - [ ] Click mic icon
   - [ ] Record voice
   - [ ] Stop recording
   - [ ] Verify transcription appears
   - [ ] Verify AI responds

2. **Text Messages**
   - [ ] Type message
   - [ ] Send message
   - [ ] Verify streaming response
   - [ ] Verify message saved

3. **Conversation Modes**
   - [ ] Create casual conversation
   - [ ] Verify friendly tone
   - [ ] Create interview conversation
   - [ ] Verify professional tone

4. **Real-time Features**
   - [ ] Verify token streaming
   - [ ] Test reconnection
   - [ ] Check connection indicator

## 🔧 Configuration

### AI Provider Selection

**Groq (Recommended for speed)**
```env
AI_PROVIDER=groq
GROQ_API_KEY=your_key
```

**OpenAI (Better quality)**
```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_key
```

### STT Provider Selection

**Whisper (Most accurate)**
```env
STT_PROVIDER=whisper
OPENAI_API_KEY=your_key
```

**Deepgram (Fastest)**
```env
STT_PROVIDER=deepgram
DEEPGRAM_API_KEY=your_key
```

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify API keys in `.env`
- Check port 5000 is available

### Frontend can't connect
- Verify backend is running
- Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
- Check browser console for errors

### Voice recording not working
- Grant microphone permissions
- Use HTTPS in production (required for MediaRecorder)
- Check browser compatibility

### WebSocket connection fails
- Verify CORS settings
- Check firewall rules
- Ensure backend WebSocket is initialized

## 📝 Development Scripts

### Backend
```bash
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript
npm start        # Start production server
```

### Frontend
```bash
npm run dev      # Start Next.js dev server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build TypeScript: `npm run build`
3. Start server: `npm start`
4. Use process manager (PM2, systemd)

### Frontend Deployment
1. Set `NEXT_PUBLIC_BACKEND_URL` to production backend
2. Build: `npm run build`
3. Deploy to Vercel/Netlify or use `npm start`

### Environment Considerations
- Use HTTPS for production (required for voice)
- Set `NODE_ENV=production`
- Use MongoDB Atlas for database
- Configure CORS for production domains

## 📄 License

MIT

## 🙏 Acknowledgments

- Built with Next.js, Express, and Socket.IO
- AI powered by Groq/OpenAI
- Speech-to-Text by Whisper/Deepgram
