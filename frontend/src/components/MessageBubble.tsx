import React from 'react';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

// ── Simple markdown-ish renderer ──────────────────────────────────────────────
function renderContent(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      nodes.push(
        <div key={i} className="code-block">
          {lang && <div className="code-lang">{lang}</div>}
          <pre><code>{codeLines.join('\n')}</code></pre>
        </div>
      );
      i++;
      continue;
    }

    // Bullet list
    if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith('• ') || lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={i} className="msg-list">
          {items.map((item, j) => <li key={j}>{inlineFormat(item)}</li>)}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      nodes.push(
        <ol key={i} className="msg-list">
          {items.map((item, j) => <li key={j}>{inlineFormat(item)}</li>)}
        </ol>
      );
      continue;
    }

    // Blockquote (>)
    if (line.startsWith('> ')) {
      nodes.push(
        <blockquote key={i} className="msg-quote">{inlineFormat(line.slice(2))}</blockquote>
      );
      i++;
      continue;
    }

    // Empty line → paragraph break
    if (line.trim() === '') {
      nodes.push(<div key={i} className="msg-spacer" />);
      i++;
      continue;
    }

    // Regular line
    nodes.push(<p key={i} className="msg-line">{inlineFormat(line)}</p>);
    i++;
  }

  return nodes;
}

/** Apply inline formatting: **bold**, `code`, *italic* */
function inlineFormat(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="inline-code">{part.slice(1, -1)}</code>;
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

// ── MessageBubble ─────────────────────────────────────────────────────────────
export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
      {!isUser && (
        <div className="message-avatar assistant-avatar" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
            <defs>
              <linearGradient id="malg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7c3aed" /><stop offset="1" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <rect width="48" height="48" rx="12" fill="url(#malg)" />
            <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
              fontSize="26" fontWeight="800" fontFamily="Inter, sans-serif" fill="white">D</text>
          </svg>
        </div>
      )}

      <div className={`message-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
        <div className="message-content">
          {isUser
            ? <p className="msg-line">{message.content}</p>
            : renderContent(message.content)
          }
        </div>
        <time className="message-time" dateTime={message.timestamp}>{time}</time>
      </div>

      {isUser && (
        <div className="message-avatar user-avatar" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </div>
      )}
    </div>
  );
}
