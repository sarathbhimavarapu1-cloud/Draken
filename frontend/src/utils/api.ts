// In production, VITE_API_URL is set as a GitHub Actions secret
// pointing to the Render.com backend: https://draken-bauj.onrender.com/api
const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001/api';

/** Build auth headers – works with or without a token (backend allows no-token in dev mode) */
const headers = (idToken?: string | null) => ({
  'Content-Type': 'application/json',
  ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
});

// ── Chat ─────────────────────────────────────────────────────────────────────

export const sendMessage = async (
  message: string,
  conversationId: string | null,
  idToken?: string | null
) => {
  const res = await fetch(`${API_BASE}/chat/message`, {
    method: 'POST',
    headers: headers(idToken),
    body: JSON.stringify({ message, conversationId }),
  });
  if (!res.ok) throw new Error(`Send failed: ${res.status}`);
  return res.json() as Promise<{ conversationId: string; message: { id: string; role: string; content: string; timestamp: string } }>;
};

export const getConversations = async (idToken?: string | null) => {
  const res = await fetch(`${API_BASE}/chat/conversations`, {
    headers: headers(idToken),
  });
  if (!res.ok) throw new Error(`Fetch conversations failed: ${res.status}`);
  return res.json() as Promise<{ conversations: Array<{ id: string; title: string; createdAt: string; lastMessage: string }> }>;
};

export const getConversation = async (id: string, idToken?: string | null) => {
  const res = await fetch(`${API_BASE}/chat/conversations/${id}`, {
    headers: headers(idToken),
  });
  if (!res.ok) throw new Error(`Fetch conversation failed: ${res.status}`);
  return res.json() as Promise<{ conversation: any }>;
};

export const deleteConversation = async (id: string, idToken?: string | null) => {
  const res = await fetch(`${API_BASE}/chat/conversations/${id}`, {
    method: 'DELETE',
    headers: headers(idToken),
  });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
  return res.json();
};
