# Voice Assistant Setup Guide

## Overview
The Star Badminton Club Management System now includes a voice-controlled AI assistant that allows you to control the dashboard using natural voice commands.

## Features
- 🎤 Voice-to-text using Web Speech API
- 🤖 AI-powered command recognition using Google Gemini
- 🔊 Text-to-speech responses
- 🎨 Real-time visual feedback
- ⚡ Instant action execution

## Tech Stack
- **Speech Recognition**: Browser's native Web Speech API
- **AI Engine**: Google Gemini Free API
- **Text-to-Speech**: Browser's native Speech Synthesis API
- **Integration**: React + Supabase

---

## Setup Instructions

### Step 1: Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"**
4. Create a new API key
5. Copy the API key (starts with `AIza...`)

### Step 2: Configure the Voice Assistant

1. Open your app in the browser
2. Look for the **microphone button** in the bottom-right corner
3. Click the **⚙️ Settings** button
4. Paste your Gemini API key
5. Click **Save**

The API key is stored in your browser's localStorage (client-side only).

### Step 3: Test the Voice Assistant

1. Click the **microphone button** (it will turn red and pulse)
2. Say a command like:
   - "Add payment for Ahmad 600"
   - "Logout"
3. The assistant will process your command and execute it

---

## Available Voice Commands

### 1. Add Payment
**Format:** "Add payment for [Player Name] [Amount]"

**Examples:**
- "Add payment for Ahmad 600"
- "Add payment for Muhammad 1000"
- "Add payment for Ali 500"

**What it does:**
- Finds the player by name
- Creates a new payment with the specified amount
- Automatically calculates installment number
- Shows confirmation message

**Response:** "Adding payment of Rs. 600 for Ahmad"

---

### 2. Delete Payment
**Format:** "Delete payment [Payment ID]"

**Examples:**
- "Delete payment 123"
- "Delete payment abc-123-def"

**What it does:**
- Asks for confirmation
- Deletes the specified payment
- Shows confirmation message

**Response:** "Deleting payment 123"

---

### 3. Logout
**Format:** "Logout" or "Log out"

**Examples:**
- "Logout"
- "Log out"
- "Sign out"

**What it does:**
- Signs out from Supabase
- Clears local storage
- Redirects to login page

**Response:** "Logging out"

---

### 4. Unknown Commands
If the assistant doesn't understand your command, it will respond with:
"I can help you with adding payments, deleting payments, or logging out"

---

## Visual Feedback

The voice assistant provides real-time visual feedback:

### Status Indicators

| Status | Icon | Meaning |
|--------|------|---------|
| **Idle** | 🎤 | Ready to listen |
| **Listening** | 🎤 (pulsing red) | Actively listening to your voice |
| **Processing** | ⏳ (spinning) | Processing your command with AI |
| **Speaking** | 🔊 | Speaking the response |
| **Success** | ✅ | Command executed successfully |
| **Error** | ❌ | Something went wrong |

### Display Panel
The assistant shows:
- **Your transcript**: What you said
- **Assistant response**: What the AI understood and is doing

---

## How It Works

```
┌─────────────┐
│   You Speak  │
│  "Add payment│
│   for Ahmad  │
│    600"      │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Web Speech API │ ← Converts voice to text
│  (Speech to Text)│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Google Gemini  │ ← AI processes the command
│     API         │   and extracts intent
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  JSON Response  │ ← { action: "add_payment",
│                 │     data: { player_name: "Ahmad",
│                 │            amount: 600 } }
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Execute Action │ ← Calls Supabase to add payment
│  (Supabase)     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Speech Output  │ ← "Adding payment of Rs. 600
│  (Text to Speech)│    for Ahmad"
└─────────────────┘
```

---

## Architecture

### VoiceAssistant Component
**Location:** `client/src/components/VoiceAssistant.tsx`

**Key Features:**
- Speech recognition using Web Speech API
- AI processing using Google Gemini
- Speech synthesis for responses
- Visual status indicators
- Configuration modal for API key

### Integration with App
**Location:** `client/src/App.tsx`

**Functions Provided:**
- `handleAddPayment`: Adds payment to Supabase
- `handleDeletePayment`: Deletes payment from Supabase
- `handleLogout`: Signs out user
- `players`: List of available players for matching

---

## System Prompt for Gemini

The AI uses this system prompt to understand commands:

```
You are a voice assistant for Star Badminton Club management system. 
Analyze the user's voice command and respond with a JSON object containing:
- action: one of ['add_payment', 'delete_payment', 'logout', 'unknown']
- data: relevant data for the action
- message: a friendly confirmation message

Available players:
- Ahmad (SB001)
- Muhammad (SB002)
- Ali (SB003)

Rules:
1. For "add payment" commands:
   - Extract player name and amount
   - Match player name to available players
   - Example: "Add payment for Ahmad 600" → 
     { "action": "add_payment", "data": { "player_name": "Ahmad", "amount": 600 }, 
       "message": "Adding payment of Rs. 600 for Ahmad" }

2. For "delete payment" commands:
   - Extract payment ID or description
   - Example: "Delete payment 123" → 
     { "action": "delete_payment", "data": { "payment_id": "123" }, 
       "message": "Deleting payment 123" }

3. For "logout" commands:
   - Example: "Logout" → 
     { "action": "logout", "data": {}, "message": "Logging out" }

4. For unknown commands:
   - Example: "What's the weather" → 
     { "action": "unknown", "data": {}, 
       "message": "I can help you with adding payments, deleting payments, or logging out" }

Respond ONLY with valid JSON, no additional text.
```

---

## Browser Compatibility

### Supported Browsers
- ✅ **Chrome** (Recommended) - Full support
- ✅ **Edge** - Full support
- ⚠️ **Safari** - Partial support (may require HTTPS)
- ❌ **Firefox** - Not supported (Web Speech API not available)

### Requirements
- Modern browser with Web Speech API support
- Microphone permission
- Internet connection (for Gemini API)

---

## Troubleshooting

### Issue: "Speech recognition is not supported"
**Solution:** Use Chrome or Edge browser

### Issue: Microphone not working
**Solution:** 
1. Check browser permissions
2. Allow microphone access when prompted
3. Make sure no other app is using the microphone

### Issue: "Gemini API error"
**Solution:**
1. Check your API key is correct
2. Verify you have internet connection
3. Check Gemini API quota (free tier: 60 requests/minute)

### Issue: Commands not recognized
**Solution:**
1. Speak clearly and slowly
2. Use exact player names as shown in the system
3. Make sure you're in a quiet environment
4. Try rephrasing the command

### Issue: Player not found
**Solution:**
1. Make sure the player exists in the system
2. Use the exact player name (case-insensitive)
3. Check the players list in the dashboard

---

## Cost

### Google Gemini Free Tier
- **60 requests per minute**
- **1,500 requests per day**
- **Perfect for voice commands**

### Rate Limits
- Free tier is sufficient for normal usage
- Each voice command = 1 API request
- No credit card required

---

## Security Notes

1. **API Key Storage**: Gemini API key is stored in browser localStorage (client-side only)
2. **No Server Required**: All AI processing happens in the browser
3. **Secure**: API key is never sent to your server
4. **User-Specific**: Each user can configure their own API key

---

## Advanced Usage

### Custom Commands
You can extend the system prompt in `VoiceAssistant.tsx` to add more commands:

```typescript
const systemPrompt = `...existing prompt...

5. For "show dashboard" commands:
   - Example: "Show dashboard" → 
     { "action": "navigate", "data": { "page": "dashboard" }, 
       "message": "Navigating to dashboard" }

Respond ONLY with valid JSON, no additional text.`
```

### Multi-Language Support
Change the recognition language:

```typescript
recognition.lang = 'en-US' // English
recognition.lang = 'ur-PK' // Urdu
recognition.lang = 'ar-SA' // Arabic
```

---

## Tips for Best Experience

1. **Use a good microphone** - Built-in laptop mics work fine
2. **Speak clearly** - Enunciate player names and amounts
3. **Quiet environment** - Reduce background noise
4. **Chrome browser** - Best compatibility
5. **Short commands** - Keep commands concise
6. **Exact player names** - Use names as they appear in the system

---

## Example Workflow

1. **Setup** (One-time):
   - Get Gemini API key
   - Configure in voice assistant settings

2. **Daily Usage**:
   - Click microphone button
   - Say: "Add payment for Ahmad 600"
   - Assistant responds: "Adding payment of Rs. 600 for Ahmad"
   - Payment is added automatically
   - Click microphone again for next command

3. **Common Commands**:
   - "Add payment for [Name] [Amount]"
   - "Delete payment [ID]"
   - "Logout"

---

## Future Enhancements

Possible additions:
- Navigate to different pages ("Go to players page")
- Add players ("Add player named Ahmad")
- View reports ("Show me today's payments")
- More natural language understanding
- Context-aware conversations

---

## Support

For issues with:
- **Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **Google Gemini**: https://ai.google.dev/docs
- **This App**: Contact Abdul Mueed Khan

---

## Summary

The voice assistant is now fully functional and ready to use! Just get your free Gemini API key, configure it in the settings, and start controlling your dashboard with your voice.

**Try saying:** "Add payment for Ahmad 600" 🎤