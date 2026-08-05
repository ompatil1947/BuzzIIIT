import React from 'react';

const SUGGESTIONS = [
    "Best Galouti Kebab near campus",
    "Biryani under ₹250",
    "Late night dhaba open now",
    "Veg-only places nearby",
    "Best Awadhi food in Lucknow",
    "Cheap chai and snacks",
    "Date night restaurant",
    "Quick delivery options",
];

export const QuickChips = ({ onSelect }) => {
    return (
        <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, idx) => (
                <button
                    key={idx}
                    onClick={() => onSelect(s)}
                    className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:scale-105 active:scale-95 border"
                    style={{
                        background: 'white',
                        color: 'var(--color-kebab-brown)',
                        borderColor: 'var(--color-card-border)',
                        fontFamily: 'var(--font-body)',
                        whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--color-marigold-light)';
                        e.currentTarget.style.borderColor = 'var(--color-marigold)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.borderColor = 'var(--color-card-border)';
                    }}
                    id={`quick-chip-${idx}`}
                >
                    {s}
                </button>
            ))}
        </div>
    );
};
