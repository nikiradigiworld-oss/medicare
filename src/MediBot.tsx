// src/MediBot.tsx
import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED = [
  "What are symptoms of high blood pressure?",
  "How do I prepare for a blood test?",
  "What is a cardiologist?",
  "Tips for better sleep?",
];

export default function MediBot() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm **MediBot** 🤖, your MediCare+ health assistant. How can I help you today?\n\n— MediBot 🤖" },
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = { role: 'user', content };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setError('⚠️ Could not reach MediBot. Is the server running?');
    } finally {
      setLoading(false);
    }
  }

  // Simple markdown bold renderer
  function renderText(text: string) {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  }

  // ── styles ──
  const R = '#e94560', NV = '#0f3460', SL = '#64748b', BR = '#e2e8f0';

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 88, right: 20, zIndex: 500,
          width: 56, height: 56, borderRadius: '50%',
          background: `linear-gradient(135deg,${NV},#16213e)`,
          border: `3px solid ${R}`, color: '#fff', fontSize: 24,
          cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s',
        }}
        title="Ask MediBot"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 156, right: 20, zIndex: 500,
          width: 340, maxWidth: 'calc(100vw - 32px)',
          background: '#fff', borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          border: `1px solid ${BR}`, display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            background: `linear-gradient(135deg,${NV},#16213e)`,
            padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: `linear-gradient(135deg,${R},#c0392b)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>🤖</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>MediBot</div>
              <div style={{ color: '#6ee7b7', fontSize: 11 }}>● Online · MediCare+ AI</div>
            </div>
            <button onClick={() => setMessages([messages[0]])}
              style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              Clear
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 14, maxHeight: 340, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%',
                  background: m.role === 'user'
                    ? `linear-gradient(135deg,${R},#c0392b)`
                    : '#f1f5f9',
                  color: m.role === 'user' ? '#fff' : '#1a1a2e',
                  padding: '10px 13px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  fontSize: 13, lineHeight: 1.65,
                }}>
                  {renderText(m.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 5, padding: '8px 12px', background: '#f1f5f9', borderRadius: '16px 16px 16px 4px', width: 'fit-content' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: '50%', background: SL,
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}/>
                ))}
              </div>
            )}
            {error && <div style={{ color: R, fontSize: 12, padding: '6px 10px', background: '#fef2f2', borderRadius: 8 }}>{error}</div>}
            <div ref={bottomRef}/>
          </div>

          {/* Suggestions (only on first message) */}
          {messages.length === 1 && (
            <div style={{ padding: '0 14px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUGGESTED.map(s => (
                <button key={s} onClick={() => send(s)} style={{
                  background: '#f8fafc', border: `1px solid ${BR}`, borderRadius: 20,
                  padding: '5px 11px', fontSize: 11, fontWeight: 600, color: NV,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>{s}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 14px 14px', borderTop: `1px solid ${BR}`, display: 'flex', gap: 8 }}>
            <input
              style={{
                flex: 1, padding: '10px 13px', borderRadius: 12,
                border: `1.5px solid ${BR}`, fontSize: 13,
                fontFamily: 'inherit', outline: 'none', background: '#f8fafc',
              }}
              placeholder="Ask a health question…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              disabled={loading}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{
                width: 40, height: 40, borderRadius: 12, border: 'none',
                background: input.trim() ? `linear-gradient(135deg,${R},#c0392b)` : '#f1f5f9',
                color: input.trim() ? '#fff' : SL,
                cursor: input.trim() ? 'pointer' : 'default', fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >➤</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </>
  );
}
