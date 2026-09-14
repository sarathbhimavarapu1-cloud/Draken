const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const verifyToken = require('../middleware/verifyToken');

// ── In-memory store (replace with a real DB like Firestore/Postgres later) ──
const conversations = {};

// ── Smart mock AI response generator ────────────────────────────────────────
const generateAIResponse = (userMessage) => {
  const msg = userMessage.toLowerCase().trim();

  // Greeting
  if (/^(hi|hello|hey|howdy|sup|what's up|yo)\b/.test(msg)) {
    return `Hello! 👋 I'm **Draken**, your AI assistant. How can I help you today?`;
  }

  // How are you
  if (/how are you|how r u|how do you do/.test(msg)) {
    return `I'm doing great, thanks for asking! Always ready to help. What's on your mind?`;
  }

  // Capabilities
  if (/what can you do|your capabilities|help me|how do you work/.test(msg)) {
    return `Here's what I can help with:\n\n• **Answer questions** — Ask me anything\n• **Write & edit** — Emails, essays, code, creative writing\n• **Brainstorm** — Ideas, plans, strategies\n• **Explain concepts** — Break down complex topics simply\n• **Analyze** — Data, text, code, problems\n\n> 🔌 *Currently in demo mode. Connect a real AI API in \`backend/routes/chat.js\` for full intelligence.*`;
  }

  // Code / Programming
  if (/code|programming|javascript|typescript|python|react|node|sql|css|html/.test(msg)) {
    return `Great, let's talk code! Here's a quick example:\n\n\`\`\`typescript\n// Async fetch with error handling\nasync function fetchData<T>(url: string): Promise<T> {\n  const response = await fetch(url);\n  if (!response.ok) {\n    throw new Error(\`HTTP error: \${response.status}\`);\n  }\n  return response.json() as Promise<T>;\n}\n\`\`\`\n\nWhat specific challenge are you working on?`;
  }

  // Identity
  if (/who are you|what are you|your name|about draken/.test(msg)) {
    return `I'm **Draken** — an AI-powered chat assistant built with:\n\n• ⚛️  React + TypeScript (frontend)\n• 🔥  Firebase Authentication\n• 🚀  Node.js + Express (backend)\n• 🎨  Custom dark glassmorphism UI\n\nCurrently running in **demo mode**. To unlock real AI responses, connect Google Gemini or OpenAI in \`backend/routes/chat.js\`. 🔌`;
  }

  // Joke
  if (/joke|funny|make me laugh|humor/.test(msg)) {
    const jokes = [
      `Why do programmers prefer dark mode? **Because light attracts bugs!** 🐛`,
      `Why did the developer go broke? **Because he used up all his cache!** 💸`,
      `A SQL query walks into a bar, walks up to two tables and asks... **"Can I join you?"** 😄`,
      `How many programmers does it take to change a light bulb? **None — that's a hardware problem!** 💡`,
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // Thank you
  if (/thank|thanks|appreciate|thx/.test(msg)) {
    return `You're very welcome! 😊 Feel free to ask me anything else.`;
  }

  // Goodbye
  if (/bye|goodbye|see you|later|cya/.test(msg)) {
    return `Goodbye! 👋 It was great chatting with you. Come back anytime!`;
  }

  // Time / date
  if (/what time|what date|today's date|current time/.test(msg)) {
    return `The current date and time on the server is: **${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}**`;
  }

  // Default intelligent-sounding response pool
  const defaults = [
    `That's an interesting question! Here's my take:\n\nIn **demo mode**, I generate curated responses to show off the interface. For a real AI-powered reply, you'd need to:\n\n1. Get an API key from [Google AI Studio](https://aistudio.google.com) (free)\n2. Add \`GEMINI_API_KEY\` to \`backend/.env\`\n3. Update the \`generateAIResponse\` function in \`backend/routes/chat.js\`\n\nThe entire frontend, auth, and API pipeline are ready — just plug in the model! 🚀`,

    `Great question! I'm currently operating in **demo mode**, which means my responses are pre-crafted rather than truly AI-generated.\n\nThe good news: Draken's architecture is production-ready. Adding a real AI model is as simple as one API call swap in the backend. Want me to explain how? Just ask! ✨`,

    `I understand what you're asking. To give you the best answer, I'd normally consult a large language model — but in demo mode I'm working with a local response engine.\n\nThe interface you're using right now is fully functional: authentication, conversation history, streaming-ready API. The AI brain is the only missing piece! 🧠`,
  ];

  return defaults[Math.floor(Math.random() * defaults.length)];
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

  // Simulate AI thinking latency (600 – 1800 ms)
  await new Promise(r => setTimeout(r, 600 + Math.random() * 1200));

  // Generate and append AI reply
  const aiContent = generateAIResponse(trimmed);
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
