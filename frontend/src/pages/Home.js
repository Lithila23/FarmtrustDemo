import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Hero slideshow — high-quality Unsplash agriculture images.
// We use translateX on an absolute flex track to create the physical slide.
// ---------------------------------------------------------------------------
const HERO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&auto=format&fit=crop&q=80',
    alt: 'Golden wheat field at sunrise',
  },
  {
    url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1600&auto=format&fit=crop&q=80',
    alt: 'Tractor working a large green farm',
  },
  {
    url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1600&auto=format&fit=crop&q=80',
    alt: 'Fresh produce at a farmers market',
  },
  {
    url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1600&auto=format&fit=crop&q=80',
    alt: 'Sunrise over a lush agricultural valley',
  },
];

// ---------------------------------------------------------------------------
// Featured Products — mock data (image: '' triggers emoji fallback logic)
// ---------------------------------------------------------------------------
const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: 'Organic Mango',
    quantity: 200,
    price: 3.49,
    originalPrice: 4.49,
    discount: 22,
    image: '',
  },
  {
    id: 2,
    name: 'Fresh Watermelon',
    quantity: 85,
    price: 1.99,
    originalPrice: 2.49,
    discount: 20,
    image: '',
  },
  {
    id: 3,
    name: 'Premium Basmati Rice',
    quantity: 500,
    price: 2.79,
    originalPrice: 3.49,
    discount: 20,
    image: '',
  },
];

// ---------------------------------------------------------------------------
// Image-fallback emoji mapping (mirrors BuyerDashboard / FarmerDashboard)
// ---------------------------------------------------------------------------
const CROP_EMOJI_MAP = {
  banana: '🍌', coconut: '🥥', watermelon: '🍉', mango: '🥭',
  apple: '🍎', orange: '🍊', grape: '🍇', strawberry: '🍓',
  tomato: '🍅', potato: '🥔', carrot: '🥕', corn: '🌽',
  wheat: '🌾', rice: '🍚', onion: '🧅', garlic: '🧄',
  pepper: '🫑', broccoli: '🥦', spinach: '🥬', pumpkin: '🎃',
  lemon: '🍋', pineapple: '🍍', peach: '🍑', pear: '🍐',
  cherry: '🍒', blueberry: '🫐', mushroom: '🍄', cabbage: '🥬',
  cucumber: '🥒', avocado: '🥑', eggplant: '🍆', radish: '🌱',
};

const getCropEmoji = (name = '') => {
  const key = name.toLowerCase();
  for (const [word, emoji] of Object.entries(CROP_EMOJI_MAP)) {
    if (key.includes(word)) return emoji;
  }
  return '🌿';
};

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // ---------------------------------------------------------------------------
  // Bulletproof scroll-reveal: ref on the <section> (guaranteed intrinsic
  // height from py-24 + heading), currentRef captured before the callback
  // closes over it, observer.unobserve() stops it after the first fire.
  // ---------------------------------------------------------------------------
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isInitialLoading) return; // Splash screen is still mounted; sectionRef.current is null — wait.

    const currentRef = sectionRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(currentRef); // stop after first intersection
        }
      },
      { root: null, rootMargin: '0px', threshold: 0.1 }
    );

    observer.observe(currentRef);
    return () => observer.disconnect();
  }, [isInitialLoading]); // re-runs when splash finishes → sectionRef is now valid

  // ---------------------------------------------------------------------------
  // Independent scroll-reveal for the "Platform Highlights" section.
  // Identical bulletproof pattern: isInitialLoading guard, currentRef capture,
  // unobserve-after-first-fire, [isInitialLoading] dep array.
  // ---------------------------------------------------------------------------
  const highlightsRef = useRef(null);
  const [isHighlightsVisible, setIsHighlightsVisible] = useState(false);

  useEffect(() => {
    if (isInitialLoading) return; // wait for splash to finish

    const currentRef = highlightsRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsHighlightsVisible(true);
          observer.unobserve(currentRef); // stop after first intersection
        }
      },
      { root: null, rootMargin: '0px', threshold: 0.1 }
    );

    observer.observe(currentRef);
    return () => observer.disconnect();
  }, [isInitialLoading]); // re-runs when splash finishes → highlightsRef is now valid

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    // Cleanup: prevent memory leaks on unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (isInitialLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-900 z-50 fixed top-0 left-0">
        <img src="/main_logo.png" alt="FarmTrust Logo" className="w-32 h-32 mb-4 animate-pulse" />
        <h1 className="text-3xl font-display font-bold text-primary-900 dark:text-primary-400">FarmTrust</h1>
        <div className="mt-6 w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">

      {/* Hero Section — sliding image background */}
      <section className="hero-slideshow-section">

        {/* ── Overflow-hidden viewport (clips the sliding track) ────────── */}
        <div className="absolute inset-0 overflow-hidden">

          {/* ── Sliding track: w-full keeps width = 1 viewport; each slide
               is min-w-full so translateX(-N*100%) shifts exactly N slides */}
          <div
            className="flex w-full h-full transition-transform duration-1000 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {HERO_SLIDES.map((slide, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-full h-full"
                style={{
                  backgroundImage: `url('${slide.url}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
                role="img"
                aria-label={slide.alt}
              />
            ))}
          </div>

        </div>{/* end viewport */}

        {/* ── Dark scrim: bg-black/40 = 40% opacity, z-10 above the images ─ */}
        <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />

        {/* ── Content — z-20 sits above both the images and the scrim ─────── */}
        <div className="max-w-7xl mx-auto px-6 text-center relative z-20 text-white">
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-4">Empower Your Agricultural Business</h2>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-10">FarmTrust connects farmers and buyers with transparency, trust, and fair pricing. Grow your business with our intelligent marketplace.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="cta-button text-lg">Get Started Free</Link>
            <Link to="/login" className="btn-outline text-lg">Explore Platform</Link>
          </div>
        </div>

      </section>

      {/* ── Featured Products ─────────────────────────────────────────────────
           Sits between Hero and "Why Choose FarmTrust". Same bg/padding as
           the Why Choose section for a seamless visual transition.          */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">

          {/* Section header */}
          <div className="mb-12 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-3">
              🛒 Live on FarmTrust
            </span>
            <h3 className="section-header dark:text-slate-100">Featured Products</h3>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg max-w-xl mx-auto">
              Hand-picked fresh produce from verified farmers — straight to you.
            </p>
          </div>

          {/* Desktop: cards + explore button in a single row
               Mobile : cards stacked, button at the bottom              */}
          <div className="flex flex-col lg:flex-row lg:items-stretch gap-6">

            {/* 3 product cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1">
              {FEATURED_PRODUCTS.map(product => {
                const emoji = getCropEmoji(product.name);
                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Image / Emoji area */}
                    <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <span className="text-7xl select-none group-hover:scale-110 transition-transform duration-300">
                          {emoji}
                        </span>
                      )}

                      {/* Discount badge — top-left */}
                      <span className="absolute top-3 left-3 bg-violet-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                        {product.discount}% Off
                      </span>

                      {/* Produce tag — bottom-left */}
                      <span className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-700 dark:text-slate-200 text-xs font-semibold px-2.5 py-1 rounded-full border border-white/60 dark:border-slate-600 shadow">
                        🌱 Fresh Produce
                      </span>
                    </div>

                    {/* Details area */}
                    <div className="flex flex-col flex-1 p-4 gap-3">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                        {product.name}
                      </h3>

                      <p className="text-sm text-slate-500 dark:text-slate-400 -mt-1">
                        Available: {product.quantity} kg
                      </p>

                      {/* Pricing row */}
                      <div className="flex items-baseline gap-2 mt-auto">
                        <span className="text-xl font-extrabold text-primary-700 dark:text-primary-400">
                          ${product.price.toFixed(2)}
                          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">/kg</span>
                        </span>
                        <span className="text-sm text-slate-400 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <Link
                          to="/buyer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400 text-sm font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
                        >
                          🛒 Add to Cart
                        </Link>
                        <Link
                          to="/buyer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold hover:from-primary-700 hover:to-primary-800 shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          ⚡ Buy Now
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* "Explore for more" CTA — right column on desktop, bottom on mobile */}
            <div className="flex lg:flex-col items-center justify-center lg:justify-center lg:w-48 shrink-0">
              <Link
                to="/buyer"
                className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 text-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 w-full text-center"
              >
                {/* Animated arrow circle */}
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/30 group-hover:bg-white/30 transition-colors duration-300">
                  <svg
                    className="w-8 h-8 text-white transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
                <span className="text-base font-bold leading-tight">
                  Explore<br />for more
                </span>
                <span className="text-xs text-white/70 font-medium">
                  View all listings →
                </span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* sectionRef on the outermost wrapper — py-24 padding + heading give it
          guaranteed intrinsic height so the observer fires early & reliably. */}
      <section ref={sectionRef} className="py-24 bg-slate-50 dark:bg-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="section-header dark:text-slate-100">Why Choose FarmTrust?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">

            {/* ── Card 1 — Transparent Pricing
                 Mobile : opacity-0 translate-y-10  →  opacity-100 translate-y-0
                 Desktop: md:-translate-x-20        →  translate-x-0
                 Delay  : none (fires first) */}
            <div
              className={`feature-card text-left dark:bg-slate-700/60 dark:border dark:border-slate-600
                transition-all duration-1000 ease-out
                ${isVisible
                  ? 'opacity-100 translate-x-0 translate-y-0'
                  : 'opacity-0 translate-y-10 md:translate-y-0 md:-translate-x-20'
                }`}
            >
              <div className="feature-icon mb-4">⚖️</div>
              <h4 className="dark:text-slate-100">Transparent Pricing</h4>
              <p className="dark:text-slate-300">Automated market analysis delivers fair quotes for farmers and buyers, eliminating middleman markup.</p>
            </div>

            {/* ── Card 2 — Secure Payments
                 Mobile & Desktop: opacity-0 translate-y-10/20  →  opacity-100 translate-y-0
                 Delay: 200ms */}
            <div
              className={`feature-card text-left dark:bg-slate-700/60 dark:border dark:border-slate-600
                transition-all duration-1000 ease-out delay-200
                ${isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10 md:translate-y-20'
                }`}
            >
              <div className="feature-icon mb-4">🔒</div>
              <h4 className="dark:text-slate-100">Secure Payments</h4>
              <p className="dark:text-slate-300">Protected escrow workflows and encrypted transfers give both parties confidence and contract safety.</p>
            </div>

            {/* ── Card 3 — Verified Trust
                 Mobile : opacity-0 translate-y-10  →  opacity-100 translate-y-0
                 Desktop: md:translate-x-20         →  translate-x-0
                 Delay  : 400ms */}
            <div
              className={`feature-card text-left dark:bg-slate-700/60 dark:border dark:border-slate-600
                transition-all duration-1000 ease-out delay-400
                ${isVisible
                  ? 'opacity-100 translate-x-0 translate-y-0'
                  : 'opacity-0 translate-y-10 md:translate-y-0 md:translate-x-20'
                }`}
            >
              <div className="feature-icon mb-4">✔️</div>
              <h4 className="dark:text-slate-100">Verified Trust</h4>
              <p className="dark:text-slate-300">Blockchain-anchored verification badges and quality ratings make trust decisions instant and audit-ready.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Platform Highlights — highlightsRef on the outermost <section> guarantees
          intrinsic height (py-24 + heading), so the observer fires reliably. */}
      <section ref={highlightsRef} className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="section-header dark:text-slate-100">Platform Highlights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">

            {/* Card 1 — Fair Pricing
                 Mobile : opacity-0 translate-y-10  →  opacity-100 translate-y-0
                 Desktop: md:-translate-x-20        →  translate-x-0
                 Delay  : 100ms */}
            <div
              className={`glass-card text-center dark:bg-slate-800 dark:border dark:border-slate-700
                transition-all duration-1000 ease-out delay-100
                ${isHighlightsVisible
                  ? 'opacity-100 translate-x-0 translate-y-0'
                  : 'opacity-0 translate-y-10 md:translate-y-0 md:-translate-x-20'
                }`}
            >
              <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/40 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Fair Pricing</h4>
              <p className="text-slate-600 dark:text-slate-300">AI-powered market intelligence ensures transparent and fair pricing for all transactions.</p>
            </div>

            {/* Card 2 — Secure Payments
                 Mobile & Desktop: opacity-0 translate-y-10/20  →  opacity-100 translate-y-0
                 Delay: 200ms */}
            <div
              className={`card-lg text-center hover:shadow-lg dark:bg-slate-800 dark:border dark:border-slate-700
                transition-all duration-1000 ease-out delay-200
                ${isHighlightsVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10 md:translate-y-20'
                }`}
            >
              <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/40 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Secure Payments</h4>
              <p className="text-slate-600 dark:text-slate-300">Safe, encrypted transactions with escrow and multiple payment options for peace of mind.</p>
            </div>

            {/* Card 3 — Trust Marks
                 Mobile : opacity-0 translate-y-10  →  opacity-100 translate-y-0
                 Desktop: md:translate-x-20         →  translate-x-0
                 Delay  : 400ms */}
            <div
              className={`card-lg text-center hover:shadow-lg dark:bg-slate-800 dark:border dark:border-slate-700
                transition-all duration-1000 ease-out delay-400
                ${isHighlightsVisible
                  ? 'opacity-100 translate-x-0 translate-y-0'
                  : 'opacity-0 translate-y-10 md:translate-y-0 md:translate-x-20'
                }`}
            >
              <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/40 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Trust Marks</h4>
              <p className="text-slate-600 dark:text-slate-300">Blockchain-based verification system for authenticity, reliability, and seller reputation.</p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h3 className="text-3xl font-display font-bold mb-4">Ready to Transform Your Agricultural Business?</h3>
          <p className="text-lg mb-8 text-primary-100">Join thousands of farmers and buyers on FarmTrust today.</p>
          <Link to="/register" className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-white text-primary-600 font-semibold hover:bg-primary-50 transition-colors">
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h5 className="text-white font-bold mb-4">FarmTrust</h5>
              <p className="text-sm text-slate-400 dark:text-slate-400">Connecting farmers and buyers with trust and transparency.</p>
            </div>
            <div>
              <h6 className="text-white font-semibold mb-4">Product</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="text-slate-400 hover:text-white transition">Features</a></li>
                <li><a href="/" className="text-slate-400 hover:text-white transition">Pricing</a></li>
                <li><a href="/" className="text-slate-400 hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h6 className="text-white font-semibold mb-4">Company</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="text-slate-400 hover:text-white transition">About</a></li>
                <li><a href="/" className="text-slate-400 hover:text-white transition">Blog</a></li>
                <li><a href="/" className="text-slate-400 hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h6 className="text-white font-semibold mb-4">Legal</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="text-slate-400 hover:text-white transition">Privacy</a></li>
                <li><a href="/" className="text-slate-400 hover:text-white transition">Terms</a></li>
                <li><a href="/" className="text-slate-400 hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 dark:border-slate-800 pt-8 text-sm text-center text-slate-400">
            <p>&copy; 2026 FarmTrust. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;