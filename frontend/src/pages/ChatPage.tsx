import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import InputBar from '../components/InputBar';
import { sendMessage, getConversations, getConversation, deleteConversation } from '../utils/api';
import type { Message, Conversation } from '../types';

interface ChatPageProps {
  onLock: () => void;
}

export default function ChatPage({ onLock }: ChatPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load conversations list (no auth token needed — backend runs without auth)
  const loadConversations = useCallback(async () => {
    try {
      const { conversations: convs } = await getConversations(null);
      setConversations(convs);
    } catch {
      // Backend might not be running — silently fail
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) { setMessages([]); return; }

    (async () => {
      try {
        const { conversation } = await getConversation(activeConvId, null);
        setMessages(conversation.messages || []);
      } catch {
        setMessages([]);
      }
    })();
  }, [activeConvId]);

  // Send a message
  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    const optimisticUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticUserMsg]);
    setIsTyping(true);

    try {
      const { conversationId, message: aiMsg } = await sendMessage(text.trim(), activeConvId, null);

      // If this was a new conversation, select it
      if (!activeConvId) setActiveConvId(conversationId);

      setMessages(prev => [...prev.filter(m => m.id !== optimisticUserMsg.id), optimisticUserMsg, aiMsg as Message]);
      await loadConversations();
    } catch {
      setMessages(prev => [
        ...prev.filter(m => m.id !== optimisticUserMsg.id),
        optimisticUserMsg,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ Could not reach the backend. Make sure the Draken API server is running on port 3001.\n\n```\ncd backend\nnpm run dev\n```',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [activeConvId, isTyping, loadConversations]);

  // Start a new conversation
  const handleNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
  };

  // Delete a conversation
  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteConversation(id, null);
      if (activeConvId === id) {
        setActiveConvId(null);
        setMessages([]);
      }
      await loadConversations();
    } catch { /* silent */ }
  }, [activeConvId, loadConversations]);

  const activeTitle = conversations.find(c => c.id === activeConvId)?.title || null;

  return (
    <div className="chat-layout">
      <Sidebar
        conversations={conversations}
        activeId={activeConvId}
        onSelect={id => { setActiveConvId(id); if (window.innerWidth < 768) setSidebarOpen(false); }}
        onNewChat={handleNewChat}
        onDelete={handleDelete}
        user={null}
        onLogout={onLock}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
      />

      <main className="chat-main">
        {/* Header */}
        <header className="chat-header">
          <button
            id="sidebar-toggle-btn"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="chat-header-info">
            <span className="chat-header-title">
              {activeTitle || 'New Conversation'}
            </span>
            <span className="chat-header-model">
              <span className="model-dot" />
              Draken AI · Demo Mode
            </span>
          </div>
        </header>

        {/* Messages */}
        <ChatWindow messages={messages} isTyping={isTyping} />

        {/* Input */}
        <InputBar onSend={handleSend} disabled={isTyping} />
      </main>
    </div>
  );
}
