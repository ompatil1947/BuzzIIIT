import React, { useRef, useEffect, useState } from 'react';
import { Send, Trash2, BookOpen } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { QuickChips } from './QuickChips';

export const ChatWindow = ({ messages, loading, onSendMessage, onClear, onViewMap }) => {
    const endRef   = useRef(null);
    const inputRef = useRef(null);
    const [input, setInput] = useState('');

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !loading) {
            onSendMessage(input.trim());
            setInput('');
            inputRef.current?.focus();
        }
    };

    const handleChip = (text) => {
        if (!loading) onSendMessage(text);
    };

    return (
        <div
            className="flex flex-col h-full rounded-3xl overflow-hidden border"
            style={{ background: 'var(--color-ittar-cream)', borderColor: 'var(--color-card-border)', boxShadow: '0 4px 24px rgba(43,23,16,0.08)' }}
        >
            {/* ── Khidmatgar Header ─────────────────────────────────────────── */}
            <div
                className="px-5 py-4 flex justify-between items-center flex-shrink-0 border-b"
                style={{ background: 'var(--color-kebab-brown)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 pulse-glow"
                        style={{ background: 'var(--color-marigold)' }}
                        title="Khidmatgar — your Awadhi dining guide"
                    >
                        🍽️
                    </div>
                    <div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'white', lineHeight: 1.2 }}>
                            Khidmatgar
                        </h2>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>
                                Your Awadhi dining guide
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div
                        className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-body)' }}
                    >
                        <BookOpen size={11} />
                        RAG Powered
                    </div>
                    <button
                        onClick={onClear}
                        className="p-2 rounded-full transition-colors hover:bg-white/10"
                        title="Clear chat"
                        style={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            {/* ── Chat Messages ─────────────────────────────────────────────── */}
            <div
                className="flex-1 overflow-y-auto p-4 custom-scrollbar"
                style={{ background: 'var(--color-ittar-cream)' }}
            >
                {messages.length <= 1 && (
                    <div className="mb-5">
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#9a7a65', marginBottom: '8px' }}>
                            Try asking:
                        </p>
                        <QuickChips onSelect={handleChip} />
                    </div>
                )}

                {messages.map((m, idx) => (
                    <MessageBubble key={idx} message={m} onViewMap={onViewMap} />
                ))}

                {/* Typing indicator */}
                {loading && (
                    <div className="flex justify-start mb-4">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 flex-shrink-0"
                            style={{ background: 'var(--color-marigold)' }}
                        >
                            🍽️
                        </div>
                        <div
                            className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 border"
                            style={{ background: 'white', borderColor: 'var(--color-card-border)', borderLeft: '3px solid var(--color-marigold)' }}
                        >
                            {[0, 1, 2].map(i => (
                                <div
                                    key={i}
                                    className="w-2 h-2 rounded-full khidmatgar-dot"
                                    style={{ background: 'var(--color-marigold)', animationDelay: `${i * 0.2}s` }}
                                />
                            ))}
                        </div>
                    </div>
                )}
                <div ref={endRef} className="pb-2" />
            </div>

            {/* ── Input Bar ────────────────────────────────────────────────── */}
            <div
                className="p-3 border-t flex-shrink-0"
                style={{ background: 'white', borderColor: 'var(--color-card-border)' }}
            >
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about food, vibes, budget…"
                        disabled={loading}
                        className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none transition-all disabled:opacity-50"
                        style={{
                            background: 'var(--color-ittar-cream)',
                            border: '1.5px solid var(--color-card-border)',
                            fontFamily: 'var(--font-body)',
                            color: 'var(--color-kebab-brown)',
                        }}
                        onFocus={e  => e.target.style.borderColor = 'var(--color-marigold)'}
                        onBlur={e   => e.target.style.borderColor = 'var(--color-card-border)'}
                        id="chat-input"
                        aria-label="Message Khidmatgar"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: 'var(--color-marigold)' }}
                        id="chat-send-btn"
                        aria-label="Send message"
                    >
                        <Send size={16} style={{ color: 'var(--color-kebab-brown)', marginLeft: '2px' }} />
                    </button>
                </form>
            </div>
        </div>
    );
};
