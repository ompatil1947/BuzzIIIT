import React from 'react';

// Category definitions for the Dastarkhwan strip
const CATEGORIES = [
  { emoji: '🍢', label: 'Kebabs',      filter: { vibe: '',          dish: 'kebab',   diet: '' } },
  { emoji: '🥙', label: 'Chaat',       filter: { vibe: '',          dish: 'chaat',   diet: '' } },
  { emoji: '🍛', label: 'Biryani',     filter: { vibe: '',          dish: 'biryani', diet: '' } },
  { emoji: '🌙', label: 'Late-Night',  filter: { vibe: 'late-night',dish: '',        diet: '' } },
  { emoji: '💰', label: 'Budget Eats', filter: { budget_max: '200', dish: '',        diet: '' } },
  { emoji: '☕', label: 'Study Cafe',  filter: { vibe: 'study-cafe',dish: '',        diet: '' } },
  { emoji: '🌿', label: 'Veg Only',   filter: { diet: 'Veg',       dish: '',        vibe: '' } },
  { emoji: '💑', label: 'Date Night', filter: { vibe: 'date-night', dish: '',        diet: '' } },
];

export const DastarkhwanStrip = ({ onSelect, compact = false }) => {
  return (
    <div className="dastarkhwan-strip" role="list" aria-label="Browse by category">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.label}
          role="listitem"
          onClick={() => onSelect(cat.filter)}
          className="flex-shrink-0 flex flex-col items-center gap-1.5 transition-all hover:scale-105 active:scale-95 group"
          title={`Browse ${cat.label}`}
        >
          <div
            className="rounded-2xl flex items-center justify-center transition-all group-hover:shadow-md"
            style={{
              width: compact ? '52px' : '64px',
              height: compact ? '52px' : '64px',
              background: 'white',
              border: '2px solid var(--color-card-border)',
              fontSize: compact ? '1.5rem' : '1.8rem',
            }}
            // On hover — marigold border
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-marigold)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-card-border)'}
          >
            {cat.emoji}
          </div>
          {!compact && (
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--color-kebab-brown)',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.label}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
