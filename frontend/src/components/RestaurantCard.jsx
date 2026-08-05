import React from 'react';
import { Star, MapPin, Navigation, Clock } from 'lucide-react';

const dietStyle = {
  Veg:      { className: 'tag-veg',    label: '🌿 Veg'    },
  'Non-Veg':{ className: 'tag-nonveg', label: '🍗 Non-Veg' },
  Both:     { className: 'tag-both',   label: '✦ Both'    },
};

const Stars = ({ rating }) => {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.3;
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={i < full ? 'var(--color-chili-red)' : (i === full && half ? 'var(--color-marigold)' : 'var(--color-card-border)')}
            stroke="none"
          />
        </svg>
      ))}
    </div>
  );
};

export const RestaurantCard = ({ restaurant: r, onViewMap, className = '' }) => {
  const diet = dietStyle[r.type] || dietStyle['Both'];
  const isOpen = (() => {
    try {
      const now  = new Date();
      const h    = now.getHours(), m = now.getMinutes();
      const cur  = h * 60 + m;
      const [oh, om] = r.hours.open.split(':').map(Number);
      const [ch, cm] = r.hours.close.split(':').map(Number);
      const open  = oh * 60 + om;
      const close = ch * 60 + cm;
      return cur >= open && cur <= close;
    } catch { return null; }
  })();

  return (
    <div
      className={`restaurant-card fade-slide-up ${className}`}
      id={`restaurant-card-${r.id}`}
    >
      {/* Top color strip (always visible) */}
      <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--color-marigold), var(--color-chili-red))' }} />
      
      <div className="p-4">
        {/* Header row */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0 pr-2">
            <h3
              className="leading-snug truncate"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-kebab-brown)' }}
            >
              {r.name}
            </h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#9a7a65', marginTop: '1px' }}>
              {r.category}
            </p>
          </div>
          
          {/* Rating badge */}
          <div
            className="flex-shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1"
            style={{ background: 'var(--color-chili-light)', minWidth: '52px' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill="var(--color-chili-red)" stroke="none" />
            </svg>
            <span className="mono font-bold" style={{ fontSize: '0.8rem', color: 'var(--color-chili-red)' }}>
              {r.rating}
            </span>
          </div>
        </div>

        {/* Stars row */}
        <div className="mb-3">
          <Stars rating={r.rating} />
        </div>

        {/* Meta row: area, distance */}
        <div className="flex items-center gap-3 mb-3" style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#8b6e5a' }}>
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {r.area}
          </span>
          <span className="flex items-center gap-1">
            <Navigation size={11} />
            <span className="mono">{r.distance_from_campus_km}</span> km
          </span>
          {isOpen !== null && (
            <span className="flex items-center gap-1 font-semibold"
                  style={{ color: isOpen ? 'var(--color-pudina-green)' : 'var(--color-chili-red)' }}>
              <Clock size={11} />
              {isOpen ? 'Open' : 'Closed'}
            </span>
          )}
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`chip text-[10px] px-2 py-0.5 ${diet.className}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
            {diet.label}
          </span>
          <span
            className="rounded-full px-2 py-0.5 font-semibold"
            style={{ background: 'var(--color-ittar-cream)', color: 'var(--color-kebab-brown)', fontFamily: 'var(--font-body)', fontSize: '0.65rem', border: '1px solid var(--color-card-border)' }}
          >
            ₹<span className="mono">{r.budget_per_person_inr}</span>/person
          </span>
          {r.home_delivery && (
            <span
              className="rounded-full px-2 py-0.5"
              style={{ background: '#EAF4EB', color: 'var(--color-pudina-green)', fontFamily: 'var(--font-body)', fontSize: '0.65rem', fontWeight: 600, border: '1px solid var(--color-pudina-green)' }}
            >
              🛵 Delivery
            </span>
          )}
        </div>

        {/* Signature dishes */}
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#6b5344', marginBottom: '12px' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-kebab-brown)' }}>Must try: </span>
          {r.signature_dishes?.slice(0, 2).join(', ')}
        </p>

        {/* CTA Button */}
        <button
          onClick={() => onViewMap(r)}
          className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'var(--color-marigold)', color: 'var(--color-kebab-brown)', fontFamily: 'var(--font-body)' }}
          id={`view-map-${r.id}`}
        >
          <MapPin size={13} />
          View on Map
        </button>
      </div>
    </div>
  );
};
