import { useState, useRef, useCallback, useEffect } from 'react';

interface InputBarProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

// Extend window type for vendor-prefixed SpeechRecognition
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function InputBar({ onSend, disabled }: InputBarProps) {
  const [value, setValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [micSupported] = useState(() => !!SpeechRecognition);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => { recognitionRef.current?.abort(); };
  }, []);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    autoResize();
  };

  const handleSend = useCallback(() => {
    const text = value.trim();
    if (!text || disabled) return;
    // Stop listening before sending
    recognitionRef.current?.abort();
    setIsListening(false);
    onSend(text);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMic = useCallback(() => {
    if (!micSupported) return;

    // Already listening → stop
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setValue(prev => {
        const updated = prev ? `${prev} ${transcript}` : transcript;
        setTimeout(autoResize, 0);
        return updated;
      });
      textareaRef.current?.focus();
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend  = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, micSupported]);

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="input-bar-wrapper">
      <div className={`input-bar ${isListening ? 'listening' : ''}`}>
        <textarea
          id="chat-input"
          ref={textareaRef}
          className="chat-textarea"
          placeholder={isListening ? '🎙️ Listening…' : 'Message Draken… (Enter to send, Shift+Enter for new line)'}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          aria-label="Message input"
        />

        {/* Mic button */}
        {micSupported && (
          <button
            id="mic-btn"
            className={`mic-btn ${isListening ? 'recording' : ''}`}
            onClick={toggleMic}
            disabled={disabled}
            aria-label={isListening ? 'Stop recording' : 'Voice input'}
            title={isListening ? 'Stop recording' : 'Speak a message'}
          >
            {isListening ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="5" y="5" width="14" height="14" rx="2" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
            {isListening && <span className="mic-pulse" />}
          </button>
        )}

        {/* Send button */}
        <button
          id="send-btn"
          className={`send-btn ${canSend ? 'active' : ''}`}
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          title="Send (Enter)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      <p className="input-hint">
        Draken can make mistakes. Verify important information.
      </p>
    </div>
  );
}
