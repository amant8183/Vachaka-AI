# Quick Start Guide - Groq + Whisper Setup

## ⚠️ Environment Setup Required

Your backend server is running but needs configuration to work properly.

### Step 1: Configure MongoDB

You have two options:

#### Option A: Use Local MongoDB (Recommended for Development)
```bash
# Install MongoDB (if not installed)
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

Then update `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/voice-ai-dashboard
```

#### Option B: Use MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `backend/.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/voice-ai-dashboard
```

---

### Step 2: Get Your API Keys

You need **TWO** API keys for Groq + Whisper:

#### 1. Groq API Key (for AI responses)
- Go to: https://console.groq.com/keys
- Sign up/login
- Create a new API key
- Copy the key

#### 2. OpenAI API Key (for Whisper STT)
- Go to: https://platform.openai.com/api-keys
- Sign up/login
- Create a new API key
- Copy the key

---

### Step 3: Update Your `.env` File

Open `backend/.env` and configure it like this:

```env
# Server
PORT=5000
NODE_ENV=development

# Database - Choose one option from Step 1
MONGO_URI=mongodb://localhost:27017/voice-ai-dashboard

# Frontend
FRONTEND_URL=http://localhost:3000

# AI Provider - Using Groq
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_actual_groq_api_key_here

# STT Provider - Using Whisper (needs OpenAI key)
STT_PROVIDER=whisper
OPENAI_API_KEY=sk-your_actual_openai_api_key_here
```

**Important:** Replace the placeholder keys with your actual API keys!

---

### Step 4: Verify Backend Restart

The backend should auto-restart after you save `.env`. You should see:

```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
🔌 WebSocket server ready
🤖 AI Provider: groq
🎙️ STT Provider: whisper
```

If you don't see this, manually restart:
```bash
# Press Ctrl+C to stop, then:
cd backend
npm run dev
```

---

### Step 5: Open the App

1. Open your browser to: **http://localhost:3000**
2. You should see the Voice AI Dashboard
3. Click "Start Conversation"
4. Choose a mode (Casual or Interview)
5. Start chatting!

---

## Testing Your Setup

### Test Text Messages
1. Type a message in the input box
2. Press Enter or click Send
3. You should see AI response streaming in real-time

### Test Voice Input
1. Click the microphone icon 🎙️
2. Allow microphone permissions if prompted
3. Speak your message
4. Click the microphone again to stop
5. Watch as your voice is transcribed
6. AI will respond automatically

---

## Current Configuration Summary

| Component | Provider | Status |
|-----------|----------|--------|
| AI Responses | **Groq** (LLaMA 3.3 70B) | Fast, free tier available |
| Speech-to-Text | **Whisper** (OpenAI) | Most accurate transcription |
| Database | MongoDB (local or Atlas) | Needs setup |
| Frontend | Next.js | ✅ Running |
| Backend | Express + WebSocket | ✅ Running |

---

## Troubleshooting

### MongoDB Connection Failed
- **Local**: Make sure MongoDB is running: `brew services list`
- **Atlas**: Check your connection string and network access settings

### AI Provider Not Working
- Verify your Groq API key is correct
- Check you have credits/quota remaining
- Look for error messages in the terminal

### Voice Recording Not Working
- Grant microphone permissions in your browser
- Use Chrome/Edge (best compatibility)
- Check console for errors (F12 → Console)

### Whisper Transcription Failing
- Verify your OpenAI API key is correct
- Check you have credits in your OpenAI account
- Audio must be in supported format (webm/wav/mp3)

---

## API Key Costs

- **Groq**: Free tier available, very generous limits
- **OpenAI Whisper**: $0.006 per minute of audio (very affordable)

Example: 100 voice messages (~5 min total) = ~$0.03

---

## Next Steps

Once everything is configured:

1. ✅ Test both text and voice input
2. ✅ Try both Casual and Interview modes
3. ✅ Check conversation history persists
4. ✅ Test reconnection (refresh page)

For more details, see the main [README.md](file:///Users/amantiwari/Desktop/voice-ai-dashboard/README.md)

---

## Need Help?

If you encounter issues:
1. Check the terminal output for error messages
2. Verify all API keys are correct
3. Make sure MongoDB is running
4. Check browser console (F12) for frontend errors
