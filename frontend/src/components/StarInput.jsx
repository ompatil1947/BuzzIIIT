import React, { useState } from 'react';

/**
 * StarInput — interactive star rating widget
 * Props:
 *   value:    number (current rating, 0 if none)
 *   onChange: (rating: number) => void
 *   readOnly: boolean (display-only mode)
 *   size:     number (icon size in px, default 20)
 */
export const StarInput = ({ value = 0, onChange, readOnly = false, size = 20 }) => {
    const [hover, setHover] = useState(0);
    const displayed = hover || value;

    return (
        <div
            className="flex items-center gap-0.5"
            role={readOnly ? 'img' : 'group'}
            aria-label={`${value} out of 5 stars${readOnly ? '' : ', select a rating'}`}
        >
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= displayed;
                return (
                    <button
                        key={star}
                        type="button"
                        disabled={readOnly}
                        onClick={() => !readOnly && onChange && onChange(star)}
                        onMouseEnter={() => !readOnly && setHover(star)}
                        onMouseLeave={() => !readOnly && setHover(0)}
                        aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '0 1px',
                            cursor: readOnly ? 'default' : 'pointer',
                            transition: 'transform 0.12s ease',
                            transform: (!readOnly && hover === star) ? 'scale(1.25)' : 'scale(1)',
                        }}
                    >
                        <svg
                            width={size}
                            height={size}
                            viewBox="0 0 24 24"
                            fill={
                                isFilled
                                    ? (hover && !readOnly ? 'var(--color-marigold)' : 'var(--color-chili-red)')
                                    : 'var(--color-card-border)'
                            }
                        >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
};
