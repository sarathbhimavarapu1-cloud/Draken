import type { User } from 'firebase/auth';
import type { Conversation } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  user: User | null;
  onLogout: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Group conversations by relative date
function groupConversations(convs: Conversation[]) {
  const groups: Record<string, Conversation[]> = {};
  for (const c of convs) {
    const label = formatDate(c.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(c);
  }
  return groups;
}

export default function Sidebar({
  conversations, activeId, onSelect, onNewChat, onDelete, user, onLogout, isOpen,
}: SidebarProps) {
  const groups = groupConversations(conversations);
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Demo User';
  const avatarInitial = displayName[0]?.toUpperCase() || 'D';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`} aria-label="Conversations sidebar">
      {/* Logo & New Chat */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
            <defs>
              <linearGradient id="sblg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7c3aed" /><stop offset="1" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <rect width="48" height="48" rx="12" fill="url(#sblg)" />
            <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
              fontSize="26" fontWeight="800" fontFamily="Inter, sans-serif" fill="white">D</text>
          </svg>
          <span className="sidebar-brand-name">Draken</span>
        </div>

        <button id="new-chat-btn" className="new-chat-btn" onClick={onNewChat} aria-label="New chat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversation list */}
      <nav className="sidebar-nav" aria-label="Chat history">
        {Object.keys(groups).length === 0 ? (
          <div className="sidebar-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p>No conversations yet.<br/>Start a new chat!</p>
          </div>
        ) : (
          Object.entries(groups).map(([label, convs]) => (
            <div key={label} className="sidebar-group">
              <p className="sidebar-group-label">{label}</p>
              {convs.map(conv => (
                <div
                  key={conv.id}
                  className={`sidebar-item ${activeId === conv.id ? 'active' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(conv.id)}
                  onKeyDown={e => e.key === 'Enter' && onSelect(conv.id)}
                  aria-current={activeId === conv.id ? 'page' : undefined}
                >
                  <svg className="sidebar-item-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="sidebar-item-title">{conv.title}</span>
                  <button
                    className="sidebar-item-delete"
                    aria-label="Delete conversation"
                    onClick={e => { e.stopPropagation(); onDelete(conv.id); }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </nav>

      {/* User profile */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">{avatarInitial}</div>
          <div className="user-info">
            <p className="user-name">{displayName}</p>
            <p className="user-email">{user?.email || 'demo mode'}</p>
          </div>
          <button
            id="logout-btn"
            className="logout-btn"
            onClick={onLogout}
            aria-label="Sign out"
            title="Sign out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
