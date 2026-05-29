import React, { useState, useRef, useEffect } from 'react';
import api from '../api/client';

const WELCOME = 'I am the Praxis Oracle. Ask me about your habits, request a workout plan, or ask why your momentum is stalling!';
const ERROR_MSG = '⚡ The Oracle is temporarily offline. This usually happens on a cold server start — please try again in a few seconds.';

export default function AiCoachWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [chatLog, setChatLog] = useState([
    { role: 'assistant', content: WELCOME }
  ]);
  const [loading, setLoading] = useState(false);
  const [lastUserQuery, setLastUserQuery] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatLog, isOpen]);

  const sendQuery = async (userQuery) => {
    setLoading(true);
    try {
      const res = await api.post('/insights/chat', { query: userQuery });
      setChatLog(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setChatLog(prev => [...prev, { role: 'assistant', content: ERROR_MSG, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    const userQuery = query.trim();
    setQuery('');
    setLastUserQuery(userQuery);
    setChatLog(prev => [...prev, { role: 'user', content: userQuery }]);
    await sendQuery(userQuery);
  };

  const handleRetry = async () => {
    if (!lastUserQuery || loading) return;
    // Remove the last error message
    setChatLog(prev => prev.filter((m, i) => !(i === prev.length - 1 && m.isError)));
    await sendQuery(lastUserQuery);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110"
        style={{ 
          background: 'linear-gradient(135deg, var(--primary), var(--primary-h))',
          boxShadow: '0 10px 25px rgba(124, 106, 247, 0.4)'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-2xl">{isOpen ? '×' : '🔮'}</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-28 right-8 z-50 w-80 sm:w-96 rounded-2xl glass-panel shadow-2xl overflow-hidden flex flex-col transition-all duration-300"
          style={{ height: '500px', maxHeight: '70vh', border: '1px solid var(--border)' }}
        >
          {/* Header */}
          <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)', background: 'rgba(124,106,247,0.1)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-white font-bold">P</div>
            <div>
              <h4 className="font-bold tracking-widest text-sm" style={{ fontFamily: 'Space Grotesk' }}>PRAXIS ORACLE</h4>
              <p className="text-xs opacity-70">Always analyzing.</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
            {chatLog.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'rounded-br-none' : 'rounded-bl-none'}`}
                  style={{ 
                    backgroundColor: msg.role === 'user' ? 'var(--primary)' : 'var(--surface-el)',
                    color: msg.role === 'user' ? '#fff' : 'var(--text)'
                  }}
                >
                  {msg.content}
                  {msg.isError && (
                    <button
                      onClick={handleRetry}
                      style={{
                        marginTop: '0.5rem', display: 'block',
                        background: 'rgba(124,106,247,0.15)', border: '1px solid rgba(124,106,247,0.3)',
                        borderRadius: '0.4rem', padding: '0.3rem 0.75rem',
                        color: 'var(--primary-h)', fontSize: '0.78rem', cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif'
                      }}
                    >
                      ↺ Try again
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl rounded-bl-none max-w-[85%] flex items-center gap-2 text-sm" style={{ backgroundColor: 'var(--surface-el)', color: 'var(--text-sec)' }}>
                  <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  <span>Decoding patterns</span>
                  <span className="ellipsis-dots">...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t flex gap-2" style={{ borderColor: 'var(--border)' }}>
            <input 
              type="text" 
              className="input flex-1 py-2 text-sm" 
              placeholder="Ask for advice or a roast..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !query.trim()} className="btn btn-primary px-4 py-2 flex items-center justify-center">
              ↑
            </button>
          </form>
        </div>
      )}
    </>
  );
}
