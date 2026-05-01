import React, { useState, useEffect } from 'react';
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

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    // Cleanup: prevent memory leaks on unmount
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="min-h-screen bg-slate-50">

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

      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="section-header">Why Choose FarmTrust?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="feature-card text-left">
              <div className="feature-icon mb-4">⚖️</div>
              <h4>Transparent Pricing</h4>
              <p>Automated market analysis delivers fair quotes for farmers and buyers, eliminating middleman markup.</p>
            </div>
            <div className="feature-card text-left">
              <div className="feature-icon mb-4">🔒</div>
              <h4>Secure Payments</h4>
              <p>Protected escrow workflows and encrypted transfers give both parties confidence and contract safety.</p>
            </div>
            <div className="feature-card text-left">
              <div className="feature-icon mb-4">✔️</div>
              <h4>Verified Trust</h4>
              <p>Blockchain-anchored verification badges and quality ratings make trust decisions instant and audit-ready.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="section-header">Platform Highlights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="glass-card text-center">
              <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Fair Pricing</h4>
              <p className="text-slate-600">AI-powered market intelligence ensures transparent and fair pricing for all transactions.</p>
            </div>
            <div className="card-lg text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Secure Payments</h4>
              <p className="text-slate-600">Safe, encrypted transactions with escrow and multiple payment options for peace of mind.</p>
            </div>
            <div className="card-lg text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Trust Marks</h4>
              <p className="text-slate-600">Blockchain-based verification system for authenticity, reliability, and seller reputation.</p>
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
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h5 className="text-white font-bold mb-4">FarmTrust</h5>
              <p className="text-sm">Connecting farmers and buyers with trust and transparency.</p>
            </div>
            <div>
              <h6 className="text-white font-semibold mb-4">Product</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="hover:text-white transition">Features</a></li>
                <li><a href="/" className="hover:text-white transition">Pricing</a></li>
                <li><a href="/" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h6 className="text-white font-semibold mb-4">Company</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h6 className="text-white font-semibold mb-4">Legal</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-sm text-center">
            <p>&copy; 2026 FarmTrust. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;