import React from 'react';

const DIET_OPTIONS   = [
  { value: '',        label: '🍽️ All Diets' },
  { value: 'Veg',    label: '🌿 Veg Only' },
  { value: 'Non-Veg',label: '🍗 Non-Veg' },
];

const BUDGET_OPTIONS = [
  { value: '',     label: '💰 Any Budget' },
  { value: '100',  label: '₹ Under 100' },
  { value: '200',  label: '₹ Under 200' },
  { value: '500',  label: '₹₹ Under 500' },
  { value: '1000', label: '₹₹₹ Under ₹1000' },
];

const VIBE_OPTIONS   = [
  { value: '',          label: '✨ Any Vibe' },
  { value: 'late-night',label: '🌙 Late Night' },
  { value: 'date-night',label: '💑 Date Night' },
  { value: 'study-cafe',label: '📚 Study Cafe' },
  { value: 'student-hangout', label: '👥 Hangout' },
];

const SORT_OPTIONS   = [
  { value: 'rating',   label: '⭐ By Rating' },
  { value: 'distance', label: '📍 By Distance' },
  { value: 'budget',   label: '💸 By Budget' },
];

const ChipGroup = ({ options, value, onChange, label }) => (
  <div>
    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 600, color: '#9a7a65', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </p>
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`chip ${value === opt.value ? 'chip-active' : 'chip-inactive'}`}
          style={{ fontSize: '0.78rem', padding: '5px 12px' }}
          aria-pressed={value === opt.value}
          id={`filter-${label.replace(/\s/g,'-').toLowerCase()}-${opt.value || 'all'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

export const FilterBar = ({ filters, setFilters }) => {
  const set = (key) => (val) => setFilters(prev => ({ ...prev, [key]: val }));

  const activeCount = [filters.diet, filters.budget_max, filters.vibe]
    .filter(v => v && v !== '').length;

  return (
    <div
      className="rounded-2xl p-4 mb-4 border"
      style={{ background: 'white', borderColor: 'var(--color-card-border)' }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-kebab-brown)' }}>
          Filters {activeCount > 0 && (
            <span
              className="ml-2 px-2 py-0.5 rounded-full text-xs"
              style={{ background: 'var(--color-marigold)', color: 'var(--color-kebab-brown)', fontFamily: 'var(--font-mono)' }}
            >
              {activeCount}
            </span>
          )}
        </h3>
        {activeCount > 0 && (
          <button
            onClick={() => setFilters({ diet: '', budget_max: '', vibe: '', area: '', sort_by: 'rating' })}
            className="text-xs font-semibold transition-colors"
            style={{ color: 'var(--color-chili-red)', fontFamily: 'var(--font-body)' }}
            id="clear-all-filters"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <ChipGroup
          label="Diet"
          options={DIET_OPTIONS}
          value={filters.diet || ''}
          onChange={set('diet')}
        />
        <ChipGroup
          label="Budget"
          options={BUDGET_OPTIONS}
          value={filters.budget_max || ''}
          onChange={set('budget_max')}
        />
        <ChipGroup
          label="Vibe"
          options={VIBE_OPTIONS}
          value={filters.vibe || ''}
          onChange={set('vibe')}
        />
        <ChipGroup
          label="Sort by"
          options={SORT_OPTIONS}
          value={filters.sort_by || 'rating'}
          onChange={set('sort_by')}
        />
      </div>
    </div>
  );
};
