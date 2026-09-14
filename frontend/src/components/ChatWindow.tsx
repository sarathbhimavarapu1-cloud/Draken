import { useEffect, useRef } from 'react';
import type { Message } from '../types';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  messages: Message[];
  isTyping: boolean;
}

// ── Typing Indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="message-row assistant">
      <div className="message-avatar assistant-avatar">
        <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="talg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7c3aed" /><stop offset="1" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#talg)" />
          <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
            fontSize="26" fontWeight="800" fontFamily="Inter, sans-serif" fill="white">D</text>
        </svg>
      </div>
      <div className="typing-indicator" aria-label="Draken is typing">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

// ── Welcome Screen ────────────────────────────────────────────────────────────
function WelcomeScreen() {
  const suggestions = [
    'What can you help me with?',
    'Explain quantum computing simply',
    'Write me a JavaScript utility function',
    'Tell me a programming joke 😄',
  ];
  return (
    <div className="welcome-screen">
      <div className="welcome-logo">
        <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="wlg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7c3aed" /><stop offset="1" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="14" fill="url(#wlg)" />
          <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
            fontSize="26" fontWeight="800" fontFamily="Inter, sans-serif" fill="white">D</text>
        </svg>
      </div>
      <h2 className="welcome-title">How can I help you today?</h2>
      <p className="welcome-subtitle">Ask me anything — I'm ready to assist.</p>
      <div className="welcome-suggestions">
        {suggestions.map((s, i) => (
          <button key={i} className="suggestion-chip" id={`suggestion-${i}`}
            onClick={() => {
              const input = document.querySelector<HTMLTextAreaElement>('#chat-input');
              if (input) {
                const nativeSet = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')!.set!;
                nativeSet.call(input, s);
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.focus();
              }
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── ChatWindow ────────────────────────────────────────────────────────────────
export default function ChatWindow({ messages, isTyping }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="chat-window" role="log" aria-live="polite" aria-label="Chat messages">
      {messages.length === 0 && !isTyping ? (
        <WelcomeScreen />
      ) : (
        <div className="messages-list">
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
