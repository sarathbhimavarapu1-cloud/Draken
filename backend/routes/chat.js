const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const verifyToken = require('../middleware/verifyToken');

// ── Google Gemini AI ─────────────────────────────────────────────────────────
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let geminiModel = null;

if (GEMINI_API_KEY) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  console.log('  🤖 Gemini AI   →  Connected (gemini-2.0-flash)');
} else {
  console.log('  🤖 AI Mode     →  Demo (set GEMINI_API_KEY for real AI)');
}

const SYSTEM_PROMPT = `You are Draken, a premium AI assistant. You are helpful, concise, and friendly. 
You use markdown formatting when appropriate (bold, code blocks, lists, etc.).
Keep responses focused and useful. Don't be overly verbose.`;

// ── In-memory store (replace with a real DB like Firestore/Postgres later) ──
const conversations = {};

// ── Gemini AI response generator ────────────────────────────────────────────
const generateGeminiResponse = async (userMessage, conversationHistory) => {
  if (!geminiModel) return null;

  try {
    // Build chat history for context
    const history = conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = geminiModel.startChat({
      history,
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (err) {
    console.error('Gemini API error:', err.message);
    return null; // Fall back to mock
  }
};

// ── Fallback mock AI response generator ─────────────────────────────────────
const generateMockResponse = (userMessage) => {
  const msg = userMessage.toLowerCase().trim();

  if (/^(hi|hello|hey|howdy|sup|what's up|yo)\b/.test(msg)) {
    return `Hello! 👋 I'm **Draken**, your AI assistant. How can I help you today?`;
  }
  if (/how are you|how r u|how do you do/.test(msg)) {
    return `I'm doing great, thanks for asking! Always ready to help. What's on your mind?`;
  }
  if (/what can you do|your capabilities|help me|how do you work/.test(msg)) {
    return `Here's what I can help with:\n\n• **Answer questions** — Ask me anything\n• **Write & edit** — Emails, essays, code, creative writing\n• **Brainstorm** — Ideas, plans, strategies\n• **Explain concepts** — Break down complex topics simply\n• **Analyze** — Data, text, code, problems\n\n> 🔌 *Currently in demo mode. Set GEMINI_API_KEY for full AI intelligence.*`;
  }
  if (/code|programming|javascript|typescript|python|react|node|sql|css|html/.test(msg)) {
    return `Great, let's talk code! Here's a quick example:\n\n\`\`\`typescript\nasync function fetchData<T>(url: string): Promise<T> {\n  const response = await fetch(url);\n  if (!response.ok) throw new Error(\`HTTP \${response.status}\`);\n  return response.json() as Promise<T>;\n}\n\`\`\`\n\nWhat specific challenge are you working on?`;
  }
  if (/who are you|what are you|your name|about draken/.test(msg)) {
    return `I'm **Draken** — an AI chat assistant built with React, TypeScript, and Node.js. Currently in **demo mode**. 🔌`;
  }
  if (/joke|funny|make me laugh|humor/.test(msg)) {
    const jokes = [
      `Why do programmers prefer dark mode? **Because light attracts bugs!** 🐛`,
      `Why did the developer go broke? **Because he used up all his cache!** 💸`,
      `A SQL query walks into a bar, walks up to two tables and asks... **"Can I join you?"** 😄`,
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  if (/thank|thanks|appreciate|thx/.test(msg)) {
    return `You're very welcome! 😊 Feel free to ask me anything else.`;
  }
  if (/bye|goodbye|see you|later|cya/.test(msg)) {
    return `Goodbye! 👋 Come back anytime!`;
  }

  return `I'm currently in **demo mode**. To unlock real AI responses, add \`GEMINI_API_KEY\` to the backend environment variables. The architecture is production-ready — just plug in the key! 🚀`;
};

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * POST /api/chat/message
 * Body: { message: string, conversationId?: string }
 * Sends a message and returns the AI reply.
 */
router.post('/message', verifyToken, async (req, res) => {
  const { message, conversationId } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'message is required and must be a non-empty string' });
  }

  const trimmed = message.trim();
  const convId = conversationId || uuidv4();

  // Initialize a new conversation
  if (!conversations[convId]) {
    conversations[convId] = {
      id: convId,
      userId: req.user.uid,
      title: trimmed.slice(0, 60) + (trimmed.length > 60 ? '…' : ''),
      messages: [],
      createdAt: new Date().toISOString(),
    };
  }

  // Append user message
  const userMessage = {
    id: uuidv4(),
    role: 'user',
    content: trimmed,
    timestamp: new Date().toISOString(),
  };
  conversations[convId].messages.push(userMessage);

  // Generate AI reply — try Gemini first, fall back to mock
  const previousMessages = conversations[convId].messages.slice(0, -1); // history before this message
  let aiContent = await generateGeminiResponse(trimmed, previousMessages);

  if (!aiContent) {
    // No Gemini key or API error — use mock with simulated delay
    await new Promise(r => setTimeout(r, 600 + Math.random() * 1200));
    aiContent = generateMockResponse(trimmed);
  }

  const aiMessage = {
    id: uuidv4(),
    role: 'assistant',
    content: aiContent,
    timestamp: new Date().toISOString(),
  };
  conversations[convId].messages.push(aiMessage);

  res.json({ conversationId: convId, message: aiMessage });
});

/**
 * GET /api/chat/conversations
 * Returns a list of the user's conversations (summary only).
 */
router.get('/conversations', verifyToken, (req, res) => {
  const userConvs = Object.values(conversations)
    .filter(c => c.userId === req.user.uid)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(c => ({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt,
      lastMessage: c.messages.at(-1)?.content?.slice(0, 100) || '',
    }));

  res.json({ conversations: userConvs });
});

/**
 * GET /api/chat/conversations/:id
 * Returns a full conversation including all messages.
 */
router.get('/conversations/:id', verifyToken, (req, res) => {
  const conv = conversations[req.params.id];
  if (!conv || conv.userId !== req.user.uid) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  res.json({ conversation: conv });
});

/**
 * DELETE /api/chat/conversations/:id
 * Deletes a conversation.
 */
router.delete('/conversations/:id', verifyToken, (req, res) => {
  const conv = conversations[req.params.id];
  if (!conv || conv.userId !== req.user.uid) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  delete conversations[req.params.id];
  res.json({ success: true });
});

module.exports = router;
