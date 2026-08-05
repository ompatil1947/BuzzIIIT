import React, { useState, useEffect } from 'react';
import { StarInput } from './StarInput';
import { getReviews, postReview, getRatingSummary } from '../api/client';

const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const ReviewSection = ({ restaurantId }) => {
    const [reviews, setReviews]         = useState([]);
    const [summary, setSummary]         = useState({ average: null, count: 0 });
    const [loading, setLoading]         = useState(false);
    const [submitting, setSubmitting]   = useState(false);
    const [showForm, setShowForm]       = useState(false);
    const [form, setForm]               = useState({ nickname: '', rating: 0, text: '' });
    const [error, setError]             = useState('');
    const [success, setSuccess]         = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const [rev, sum] = await Promise.all([
                getReviews(restaurantId),
                getRatingSummary(restaurantId),
            ]);
            setReviews(rev);
            setSummary(sum);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [restaurantId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.rating === 0) { setError('Please select a star rating.'); return; }
        if (!form.text.trim()) { setError('Please write a review.'); return; }
        setError('');
        setSubmitting(true);
        try {
            await postReview(restaurantId, {
                nickname: form.nickname.trim() || 'Anonymous',
                rating: form.rating,
                text: form.text.trim(),
            });
            setForm({ nickname: '', rating: 0, text: '' });
            setShowForm(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            await load();
        } catch (e) {
            setError('Could not submit review. Try again.');
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
                        Student Reviews
                    </h3>
                    {summary.count > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                            <StarInput value={Math.round(summary.average)} readOnly size={14} />
                            <span className="mono font-bold" style={{ color: 'var(--color-chili-red)', fontSize: '0.9rem' }}>
                                {summary.average}
                            </span>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#9a7a65' }}>
                                (<span className="mono">{summary.count}</span> review{summary.count !== 1 ? 's' : ''})
                            </span>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95"
                    style={{ background: showForm ? 'var(--color-card-border)' : 'var(--color-marigold)', color: 'var(--color-kebab-brown)', fontFamily: 'var(--font-body)' }}
                    id="write-review-btn"
                >
                    {showForm ? '✕ Cancel' : '✏️ Write Review'}
                </button>
            </div>

            {/* Success toast */}
            {success && (
                <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold fade-slide-up"
                     style={{ background: 'var(--color-pudina-light)', color: 'var(--color-pudina-green)', fontFamily: 'var(--font-body)', border: '1px solid var(--color-pudina-green)' }}>
                    ✓ Shukriya! Your review has been posted.
                </div>
            )}

            {/* Review form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-5 p-4 rounded-2xl border fade-slide-up"
                      style={{ background: 'white', borderColor: 'var(--color-card-border)' }}>
                    <div className="mb-3">
                        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-kebab-brown)', display: 'block', marginBottom: '4px' }}>
                            Your name / nickname
                        </label>
                        <input
                            type="text"
                            value={form.nickname}
                            onChange={e => setForm(p => ({ ...p, nickname: e.target.value }))}
                            placeholder="e.g. Priya23 (optional)"
                            maxLength={50}
                            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                            style={{ border: '1.5px solid var(--color-card-border)', fontFamily: 'var(--font-body)', color: 'var(--color-kebab-brown)' }}
                            id="review-nickname"
                        />
                    </div>

                    <div className="mb-3">
                        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-kebab-brown)', display: 'block', marginBottom: '6px' }}>
                            Your rating *
                        </label>
                        <StarInput value={form.rating} onChange={r => setForm(p => ({ ...p, rating: r }))} size={28} />
                    </div>

                    <div className="mb-3">
                        <label style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-kebab-brown)', display: 'block', marginBottom: '4px' }}>
                            Your review *
                        </label>
                        <textarea
                            value={form.text}
                            onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
                            placeholder="How was the food? Good for students? Any tips?"
                            rows={3}
                            maxLength={1000}
                            required
                            className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
                            style={{ border: '1.5px solid var(--color-card-border)', fontFamily: 'var(--font-body)', color: 'var(--color-kebab-brown)' }}
                            id="review-text"
                        />
                    </div>

                    {error && (
                        <p style={{ color: 'var(--color-chili-red)', fontFamily: 'var(--font-body)', fontSize: '0.78rem', marginBottom: '8px' }}>
                            ⚠️ {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2 rounded-full font-semibold text-sm transition-all disabled:opacity-50"
                        style={{ background: 'var(--color-marigold)', color: 'var(--color-kebab-brown)', fontFamily: 'var(--font-body)' }}
                        id="submit-review-btn"
                    >
                        {submitting ? 'Posting…' : 'Post Review'}
                    </button>
                </form>
            )}

            {/* Reviews list */}
            {loading ? (
                <div style={{ fontFamily: 'var(--font-body)', color: '#9a7a65', fontSize: '0.85rem' }}>Loading reviews…</div>
            ) : reviews.length === 0 ? (
                <div className="py-6 text-center rounded-2xl border border-dashed"
                     style={{ borderColor: 'var(--color-card-border)' }}>
                    <div className="text-2xl mb-2">✍️</div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#9a7a65' }}>
                        No reviews yet. Be the first IIIT student to review!
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {reviews.map(r => (
                        <div key={r.id} className="p-4 rounded-2xl border fade-slide-up"
                             style={{ background: 'white', borderColor: 'var(--color-card-border)' }}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-kebab-brown)' }}>
                                        {r.nickname}
                                    </span>
                                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#c9a97a', marginLeft: '8px' }}>
                                        {formatDate(r.created_at)}
                                    </span>
                                </div>
                                <StarInput value={r.rating} readOnly size={13} />
                            </div>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#5a3e2b', lineHeight: 1.5 }}>
                                {r.text}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
