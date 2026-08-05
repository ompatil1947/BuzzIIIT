import React, { useState, useEffect, useCallback } from 'react';
import { ChefHat, Map as MapIcon, Compass, UtensilsCrossed, MessageCircle, Star, Flame } from 'lucide-react';
import { FilterBar } from './components/FilterBar';
import { RestaurantCard } from './components/RestaurantCard';
import { ChatWindow } from './components/ChatWindow';
import { MapView } from './components/MapView';
import { DastarkhwanStrip } from './components/DastarkhwanStrip';
import { getRestaurants } from './api/client';
import { useChat } from './hooks/useChat';

const SECTIONS = ['home', 'restaurants', 'chat'];

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [filters, setFilters] = useState({ diet: '', budget_max: '', vibe: '', area: '', sort_by: 'rating' });
  const [restaurants, setRestaurants] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [focusRestaurant, setFocusRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const { messages, sendMessage, loading: chatLoading, clearChat } = useChat();

  const fetchRestaurants = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = {};
      if (f.diet)       params.diet = f.diet;
      if (f.budget_max) params.budget_max = f.budget_max;
      if (f.vibe)       params.vibe = f.vibe;
      if (f.area && f.area !== 'All Areas') params.area = f.area;
      if (f.sort_by)    params.sort_by = f.sort_by;
      const data = await getRestaurants(params);
      setRestaurants(data);
    } catch (err) {
      console.error('Failed to fetch restaurants', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants(filters);
  }, [filters, fetchRestaurants]);

  const handleViewMap = (r) => {
    setShowMap(true);
    setFocusRestaurant(r);
    setActiveSection('restaurants');
  };

  const handleDastarkhwanSelect = (filterUpdate) => {
    setFilters(prev => ({ ...prev, ...filterUpdate }));
    setActiveSection('restaurants');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-ittar-cream)', fontFamily: 'var(--font-body)' }}>
      
      {/* ── Pill Nav Bar ──────────────────────────────────────────────────── */}
      <header style={{ background: 'var(--color-ittar-cream)' }} className="sticky top-0 z-50 px-4 pt-4 pb-2">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between bg-white rounded-full px-5 py-2.5 shadow-md border"
               style={{ borderColor: 'var(--color-card-border)' }}>
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                   style={{ background: 'var(--color-marigold)' }}>
                <UtensilsCrossed size={18} style={{ color: 'var(--color-kebab-brown)' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--color-kebab-brown)' }}>
                BuzzIIIT
              </span>
            </div>

            {/* Nav Pills */}
            <nav className="hidden sm:flex items-center gap-1">
              {[
                { key: 'home', label: 'Home' },
                { key: 'restaurants', label: 'Restaurants' },
                { key: 'chat', label: 'Khidmatgar' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className="nav-pill"
                  style={activeSection === key ? {
                    background: 'var(--color-marigold)',
                    color: 'var(--color-kebab-brown)',
                    fontWeight: 700,
                  } : {}}
                >
                  {label}
                </button>
              ))}
            </nav>

            {/* CTA */}
            <button
              onClick={() => setActiveSection('restaurants')}
              className="hidden sm:flex items-center gap-2 rounded-full px-5 py-2 font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'var(--color-kebab-brown)', color: 'white', fontFamily: 'var(--font-body)' }}
            >
              Find Food Now
            </button>

            {/* Mobile: chat icon */}
            <button
              className="sm:hidden p-2 rounded-full"
              style={{ background: 'var(--color-marigold-light)' }}
              onClick={() => setActiveSection(activeSection === 'chat' ? 'home' : 'chat')}
            >
              <MessageCircle size={18} style={{ color: 'var(--color-kebab-brown)' }} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Bottom Nav ─────────────────────────────────────────────── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex"
           style={{ borderColor: 'var(--color-card-border)' }}>
        {[
          { key: 'home', icon: <ChefHat size={20}/>, label: 'Home' },
          { key: 'restaurants', icon: <Compass size={20}/>, label: 'Explore' },
          { key: 'chat', icon: <MessageCircle size={20}/>, label: 'Chat' },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className="flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors"
            style={{
              color: activeSection === key ? 'var(--color-marigold-dark)' : '#9ca3af',
              fontFamily: 'var(--font-body)',
            }}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          HOME SECTION
      ══════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'home' && (
        <main className="max-w-6xl mx-auto px-4 pb-24 sm:pb-8">
          
          {/* Hero */}
          <section className="pt-10 pb-8 flex flex-col lg:flex-row items-center gap-8">
            {/* Left: Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-sm font-semibold"
                   style={{ background: 'var(--color-marigold-light)', color: 'var(--color-kebab-brown)', fontFamily: 'var(--font-body)' }}>
                <Flame size={14} style={{ color: 'var(--color-chili-red)' }} />
                28 restaurants near IIIT Lucknow
              </div>
              
              <h1 className="hero-headline mb-4" style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)' }}>
                HUNGRY?<br />
                <span style={{ color: 'var(--color-chili-red)' }}>WE KNOW</span><br />
                LUCKNOW.
              </h1>
              
              <p className="text-base mb-6 max-w-md mx-auto lg:mx-0" style={{ color: '#6b5344', fontFamily: 'var(--font-body)' }}>
                From Galouti Kebabs in Aminabad to late-night dhabas near campus — 
                your AI-powered Awadhi dining guide built for IIIT students.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button
                  onClick={() => setActiveSection('restaurants')}
                  className="rounded-full px-8 py-3.5 font-bold text-base transition-all hover:opacity-90 active:scale-95 shadow-lg pulse-glow"
                  style={{ background: 'var(--color-marigold)', color: 'var(--color-kebab-brown)', fontFamily: 'var(--font-display)' }}
                >
                  🍽️ Find Food Now
                </button>
                <button
                  onClick={() => setActiveSection('chat')}
                  className="rounded-full px-8 py-3.5 font-bold text-base transition-all border-2 hover:bg-opacity-10"
                  style={{ borderColor: 'var(--color-kebab-brown)', color: 'var(--color-kebab-brown)', fontFamily: 'var(--font-display)' }}
                >
                  Ask Khidmatgar
                </button>
              </div>
            </div>
            
            {/* Right: Awadhi dish grid */}
            <div className="flex-shrink-0 grid grid-cols-2 gap-3 max-w-xs w-full">
              {[
                { emoji: '🍢', name: 'Galouti Kebab', sub: 'Awadhi Classic' },
                { emoji: '🍛', name: 'Dum Biryani', sub: 'Aromatic & Rich' },
                { emoji: '🍨', name: 'Kulfi Falooda', sub: 'Summer Special' },
                { emoji: '🥙', name: 'Basket Chaat', sub: 'Lucknow Original' },
              ].map((dish) => (
                <button
                  key={dish.name}
                  onClick={() => { setFilters(prev => ({ ...prev, dish: dish.name.split(' ')[0].toLowerCase() })); setActiveSection('restaurants'); }}
                  className="rounded-2xl p-4 text-center transition-all hover:scale-105 hover:shadow-lg active:scale-95 border"
                  style={{ background: 'white', borderColor: 'var(--color-card-border)' }}
                >
                  <div className="text-3xl mb-2">{dish.emoji}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-kebab-brown)' }}>
                    {dish.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: '#9a7a65', marginTop: '2px' }}>
                    {dish.sub}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Dastarkhwan Strip */}
          <section className="mb-10">
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--color-kebab-brown)', marginBottom: '12px' }}>
              🪔 The Dastarkhwan
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#8b6e5a', marginBottom: '12px' }}>
              Tap a category to instantly filter restaurants
            </p>
            <DastarkhwanStrip onSelect={handleDastarkhwanSelect} />
          </section>

          {/* Top picks preview */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--color-kebab-brown)' }}>
                ⭐ Top Picks Near Campus
              </h2>
              <button
                onClick={() => setActiveSection('restaurants')}
                className="text-sm font-semibold transition-colors"
                style={{ color: 'var(--color-chili-red)', fontFamily: 'var(--font-body)' }}
              >
                See all →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {restaurants.slice(0, 3).map(r => (
                <RestaurantCard key={r.id} restaurant={r} onViewMap={handleViewMap} />
              ))}
            </div>
          </section>
        </main>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          RESTAURANTS SECTION
      ══════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'restaurants' && (
        <main className="max-w-6xl mx-auto px-4 pb-24 sm:pb-8 pt-4">
          
          {/* Dastarkhwan strip (compact version) */}
          <div className="mb-4">
            <DastarkhwanStrip onSelect={handleDastarkhwanSelect} compact />
          </div>

          {/* Filters */}
          <FilterBar filters={filters} setFilters={setFilters} />

          {/* Controls row */}
          <div className="flex justify-between items-center mb-4">
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#8b6e5a' }}>
              {loading ? 'Searching…' : (
                <>
                  <span className="mono font-semibold" style={{ color: 'var(--color-kebab-brown)' }}>{restaurants.length}</span> places found
                </>
              )}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all"
                style={showMap
                  ? { background: 'var(--color-kebab-brown)', color: 'white', borderColor: 'var(--color-kebab-brown)' }
                  : { background: 'white', color: 'var(--color-kebab-brown)', borderColor: 'var(--color-card-border)' }
                }
              >
                <MapIcon size={14} />
                {showMap ? 'Hide Map' : 'Map View'}
              </button>
            </div>
          </div>

          {/* Map */}
          {showMap && (
            <div className="mb-5">
              <MapView
                restaurants={restaurants}
                focusRestaurant={focusRestaurant}
                onMapClose={() => setShowMap(false)}
              />
            </div>
          )}

          {/* Cards grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border animate-pulse h-48"
                     style={{ background: 'white', borderColor: 'var(--color-card-border)' }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {restaurants.map(r => (
                <RestaurantCard key={r.id} restaurant={r} onViewMap={handleViewMap} />
              ))}
              {restaurants.length === 0 && (
                <div className="col-span-full py-16 text-center rounded-2xl border border-dashed"
                     style={{ borderColor: 'var(--color-card-border)', background: 'white' }}>
                  <div className="text-4xl mb-3">🫙</div>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-kebab-brown)' }}>
                    No restaurants match your filters
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#9a7a65', marginTop: '4px' }}>
                    Try adjusting the filters above
                  </p>
                  <button
                    onClick={() => setFilters({ diet: '', budget_max: '', vibe: '', area: '', sort_by: 'rating' })}
                    className="mt-4 px-5 py-2 rounded-full text-sm font-semibold"
                    style={{ background: 'var(--color-marigold)', color: 'var(--color-kebab-brown)' }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CHAT SECTION
      ══════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'chat' && (
        <main className="max-w-3xl mx-auto px-4 pb-24 sm:pb-8 pt-4"
              style={{ height: 'calc(100vh - 100px)' }}>
          <ChatWindow
            messages={messages}
            loading={chatLoading}
            onSendMessage={sendMessage}
            onClear={clearChat}
            onViewMap={handleViewMap}
          />
        </main>
      )}
    </div>
  );
}

export default App;
