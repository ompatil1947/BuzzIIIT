import React, { useState, useEffect } from 'react';
import { MessageCircle, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { getQuestions, postQuestion, postAnswer } from '../api/client';

const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const AnswerItem = ({ answer }) => (
    <div className="ml-6 mt-2 pl-3 border-l-2 fade-slide-up"
         style={{ borderColor: 'var(--color-marigold)' }}>
        <div className="flex items-baseline gap-2 mb-0.5">
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.78rem', color: 'var(--color-kebab-brown)' }}>
                {answer.nickname}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#c9a97a' }}>
                {formatDate(answer.created_at)}
            </span>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#5a3e2b', lineHeight: 1.5 }}>
            {answer.text}
        </p>
    </div>
);

const QuestionItem = ({ question, restaurantId, onAnswerPosted }) => {
    const [expanded, setExpanded] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm]         = useState({ nickname: '', text: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleAnswer = async (e) => {
        e.preventDefault();
        if (!form.text.trim()) return;
        setSubmitting(true);
        try {
            await postAnswer(question.id, {
                nickname: form.nickname.trim() || 'Anonymous',
                text: form.text.trim(),
            });
            setForm({ nickname: '', text: '' });
            setShowForm(false);
            onAnswerPosted();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="rounded-2xl border p-4 fade-slide-up"
             style={{ background: 'white', borderColor: 'var(--color-card-border)' }}>
            
            {/* Question header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">❓</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.78rem', color: 'var(--color-kebab-brown)' }}>
                            {question.nickname}
                        </span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: '#c9a97a' }}>
                            {formatDate(question.created_at)}
                        </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--color-kebab-brown)', lineHeight: 1.5 }}>
                        {question.text}
                    </p>
                </div>
                
                {question.answers.length > 0 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1 transition-all"
                        style={{ background: 'var(--color-pudina-light)', color: 'var(--color-pudina-green)', fontFamily: 'var(--font-body)' }}
                    >
                        <span className="mono">{question.answers.length}</span>
                        {expanded ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                    </button>
                )}
            </div>

            {/* Answers */}
            {expanded && question.answers.map(a => <AnswerItem key={a.id} answer={a} />)}

            {/* Answer form */}
            {showForm ? (
                <form onSubmit={handleAnswer} className="mt-3 ml-6 fade-slide-up">
                    <input
                        type="text"
                        value={form.nickname}
                        onChange={e => setForm(p => ({ ...p, nickname: e.target.value }))}
                        placeholder="Your nickname (optional)"
                        className="w-full rounded-xl px-3 py-1.5 text-sm mb-2 outline-none"
                        style={{ border: '1.5px solid var(--color-card-border)', fontFamily: 'var(--font-body)', color: 'var(--color-kebab-brown)' }}
                    />
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={form.text}
                            onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
                            placeholder="Write your answer…"
                            required
                            className="flex-1 rounded-xl px-3 py-1.5 text-sm outline-none"
                            style={{ border: '1.5px solid var(--color-card-border)', fontFamily: 'var(--font-body)', color: 'var(--color-kebab-brown)' }}
                        />
                        <button
                            type="submit"
                            disabled={submitting || !form.text.trim()}
                            className="px-4 py-1.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                            style={{ background: 'var(--color-marigold)', color: 'var(--color-kebab-brown)', fontFamily: 'var(--font-body)' }}
                        >
                            {submitting ? '…' : <Send size={14} />}
                        </button>
                    </div>
                    <button type="button" onClick={() => setShowForm(false)}
                            className="text-xs mt-1" style={{ color: '#9a7a65', fontFamily: 'var(--font-body)' }}>
                        Cancel
                    </button>
                </form>
            ) : (
                <button
                    onClick={() => { setShowForm(true); setExpanded(true); }}
                    className="mt-2 text-xs font-semibold transition-colors"
                    style={{ color: 'var(--color-pudina-green)', fontFamily: 'var(--font-body)' }}
                >
                    + Answer this
                </button>
            )}
        </div>
    );
};

export const QnASection = ({ restaurantId }) => {
    const [questions, setQuestions]   = useState([]);
    const [loading, setLoading]       = useState(false);
    const [showForm, setShowForm]     = useState(false);
    const [form, setForm]             = useState({ nickname: '', text: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState('');

    const load = async () => {
        setLoading(true);
        try {
            setQuestions(await getQuestions(restaurantId));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [restaurantId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.text.trim()) return;
        setError('');
        setSubmitting(true);
        try {
            await postQuestion(restaurantId, {
                nickname: form.nickname.trim() || 'Anonymous',
                text: form.text.trim(),
            });
            setForm({ nickname: '', text: '' });
            setShowForm(false);
            await load();
        } catch (e) {
            setError('Could not post question. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-kebab-brown)' }}>
                        🪔 Dastarkhwan Talk
                    </h3>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#9a7a65', marginTop: '2px' }}>
                        Student Q&A — ask anything, answer what you know
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                    style={{ background: showForm ? 'var(--color-card-border)' : 'var(--color-pudina-light)', color: showForm ? 'var(--color-kebab-brown)' : 'var(--color-pudina-green)', fontFamily: 'var(--font-body)' }}
                    id="ask-question-btn"
                >
                    {showForm ? '✕ Cancel' : '❓ Ask a Question'}
                </button>
            </div>

            {/* Ask form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-5 p-4 rounded-2xl border fade-slide-up"
                      style={{ background: 'white', borderColor: 'var(--color-card-border)' }}>
                    <input
                        type="text"
                        value={form.nickname}
                        onChange={e => setForm(p => ({ ...p, nickname: e.target.value }))}
                        placeholder="Your nickname (optional)"
                        className="w-full rounded-xl px-3 py-2 text-sm mb-3 outline-none"
                        style={{ border: '1.5px solid var(--color-card-border)', fontFamily: 'var(--font-body)', color: 'var(--color-kebab-brown)' }}
                        id="question-nickname"
                    />
                    <textarea
                        value={form.text}
                        onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
                        placeholder="e.g. Is it good for takeout? Crowded on weekends? Parking available?"
                        rows={2}
                        maxLength={500}
                        required
                        className="w-full rounded-xl px-3 py-2 text-sm mb-3 outline-none resize-none"
                        style={{ border: '1.5px solid var(--color-card-border)', fontFamily: 'var(--font-body)', color: 'var(--color-kebab-brown)' }}
                        id="question-text"
                    />
                    {error && <p style={{ color: 'var(--color-chili-red)', fontSize: '0.78rem', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>{error}</p>}
                    <button
                        type="submit"
                        disabled={submitting || !form.text.trim()}
                        className="px-5 py-2 rounded-full font-semibold text-sm transition-all disabled:opacity-50"
                        style={{ background: 'var(--color-pudina-green)', color: 'white', fontFamily: 'var(--font-body)' }}
                        id="submit-question-btn"
                    >
                        {submitting ? 'Posting…' : 'Post Question'}
                    </button>
                </form>
            )}

            {/* Questions list */}
            {loading ? (
                <div style={{ fontFamily: 'var(--font-body)', color: '#9a7a65', fontSize: '0.85rem' }}>Loading discussions…</div>
            ) : questions.length === 0 ? (
                <div className="py-6 text-center rounded-2xl border border-dashed"
                     style={{ borderColor: 'var(--color-card-border)' }}>
                    <div className="text-2xl mb-2"><MessageCircle size={28} style={{ color: '#c9a97a', margin: '0 auto' }} /></div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#9a7a65' }}>
                        No questions yet. Start the conversation!
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {questions.map(q => (
                        <QuestionItem
                            key={q.id}
                            question={q}
                            restaurantId={restaurantId}
                            onAnswerPosted={load}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
