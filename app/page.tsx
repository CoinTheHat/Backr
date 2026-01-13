'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import ChatMockup from './components/ChatMockup';
import ExclusiveContentMockup from './components/ExclusiveContentMockup';

export default function Home() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111827', fontFamily: 'var(--font-family)', overflowX: 'hidden' }}>

      {/* Global Styles & Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        :root {
            --brand-blue: #5865F2;
            --brand-text: #1a1a1a;
            --section-padding-desktop: 96px 0;
            --section-padding-mobile: 64px 0;
        }
        
        /* Animations */
        @keyframes float { 
          0%, 100% { transform: translateY(0) rotate(0deg); } 
          50% { transform: translateY(-15px) rotate(1deg); } 
        }
        @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .float-slow { animation: float 8s ease-in-out infinite; }
        .float-medium { animation: float 6s ease-in-out infinite 1s; }
        .float-fast { animation: float 5s ease-in-out infinite 0.5s; }
        
        .headline-huge {
            font-family: var(--font-serif);
            font-weight: 500;
            line-height: 1.1;
            letter-spacing: -0.03em;
        }

        /* Navbar */
        .nav-scrolled {
            background: rgba(255, 255, 255, 0.9) !important;
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .nav-mobile-menu {
            position: fixed; top: 70px; left: 0; right: 0;
            background: #fff; padding: 24px;
            border-bottom: 1px solid var(--color-border);
            animation: slideDown 0.3s ease-out;
            z-index: 99;
        }

        /* Utilities */
        .btn-primary {
            padding: 14px 28px;
            border-radius: 99px;
            background: #111827;
            color: #fff;
            border: none;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.15); }
        
        .btn-secondary {
            padding: 14px 28px;
            border-radius: 99px;
            background: #fff;
            color: #111827;
            border: 1px solid var(--color-border);
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-secondary:hover { border-color: var(--color-brand-blue); color: var(--color-brand-blue); }

        .stat-chip {
            padding: 12px 20px;
            background: #f9fafb;
            border-radius: 12px;
            border: 1px solid rgba(0,0,0,0.05);
            display: flex; flex-direction: column; align-items: flex-start;
            min-width: 120px;
        }

        /* Responsive Breakpoints */
        .desktop-only { display: flex; }
        .mobile-only { display: none; }
        
        @media (max-width: 768px) {
            .desktop-only { display: none !important; }
            .mobile-only { display: flex !important; }
            .hero-grid { grid-template-columns: 1fr !important; text-align: center; gap: 40px !important; }
            .hero-left { margin: 0 auto; align-items: center !important; }
            .hero-collage { display: none !important; } /* Hide complex collage on mobile */
            .headline-huge { font-size: 3rem !important; }
            .hero-kpi { justify-content: center; flex-wrap: wrap; gap: 12px !important; }
            .btn-mobile-full { width: 100%; justify-content: center; }
        }
      `}} />

      {/* ---------------------------------------------------------------------------
         NAVIGATION
         --------------------------------------------------------------------------- */}
      <nav
        className={scrolled ? 'nav-scrolled' : ''}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: '72px',
          display: 'flex', alignItems: 'center', transition: 'all 0.3s ease',
          background: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
        }}>
        <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          {/* Logo */}
          <div onClick={() => router.push('/')} style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.02em' }}>
            Backr
          </div>

          {/* Desktop Links */}
          <div className="desktop-only" style={{ gap: '32px', alignItems: 'center' }}>
            <span onClick={() => router.push('/explore')} style={{ cursor: 'pointer', fontWeight: 500, color: '#4b5563', transition: 'color 0.2s' }}>Find Creators</span>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ cursor: 'pointer', fontWeight: 500, color: '#4b5563', transition: 'color 0.2s' }}>How it Works</a>
            <button className="btn-primary" onClick={() => router.push('/dashboard')}>Get Started</button>
          </div>

          {/* Mobile Hamburger */}
          <div className="mobile-only" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ cursor: 'pointer', fontSize: '1.5rem', padding: '8px' }}>
            {mobileMenuOpen ? '✕' : '☰'}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Slide-down */}
      {mobileMenuOpen && (
        <div className="nav-mobile-menu">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '1.1rem', fontWeight: 600 }}>
            <div onClick={() => router.push('/explore')}>Find Creators</div>
            <div onClick={() => { setMobileMenuOpen(false); document.getElementById('how-it-works')?.scrollIntoView(); }}>How it Works</div>
            <div style={{ padding: '12px 0', borderTop: '1px solid #eee' }}>
              <button className="btn-primary" style={{ width: '100%' }} onClick={() => router.push('/dashboard')}>Get Started</button>
            </div>
          </div>
        </div>
      )}

      <main style={{ paddingTop: '0px' }}>

        {/* SECTION 1: HERO */}
        <section style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
          paddingTop: '140px',
          paddingBottom: '80px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div className="page-container hero-grid" style={{
            display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '80px', alignItems: 'center', width: '100%'
          }}>

            {/* LEFT COLUMN */}
            <div className="hero-left" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', zIndex: 10 }}>

              {/* Trust Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 12px', background: 'rgba(88, 101, 242, 0.1)',
                borderRadius: '100px', marginBottom: '32px',
                fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-brand-blue)'
              }}>
                <span style={{ width: '8px', height: '8px', background: 'var(--color-brand-blue)', borderRadius: '50%' }}></span>
                Built on Mantle Network
              </div>

              {/* Headline */}
              <h1 className="headline-huge" style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', marginBottom: '24px', color: '#111827' }}>
                Unlock your <br />
                <span style={{ color: 'var(--color-brand-blue)', fontStyle: 'italic' }}>creative potential</span>
              </h1>

              {/* Subheadline */}
              <p style={{ fontSize: '1.25rem', color: '#4b5563', marginBottom: '40px', maxWidth: '540px', lineHeight: 1.6 }}>
                The all-in-one platform for creators to build community, share exclusive content, and earn directly from fans without the middleman.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '48px', width: '100%' }}>
                <button className="btn-primary btn-mobile-full" onClick={() => router.push('/dashboard')}>Create on Backr</button>
                <button className="btn-secondary btn-mobile-full" onClick={() => router.push('/explore')}>Find Creators</button>
              </div>

              {/* Trust Row */}
              <div style={{ display: 'flex', gap: '24px', fontSize: '0.85rem', color: '#6b7280', marginBottom: '40px', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🛡️ Cancel anytime</span>
                <span style={{ height: '4px', width: '4px', background: '#d1d5db', borderRadius: '50%' }}></span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>⚡ Instant payouts</span>
                <span style={{ height: '4px', width: '4px', background: '#d1d5db', borderRadius: '50%' }}></span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>💎 Low fees</span>
              </div>

              {/* KPI Stat Chips */}
              <div className="hero-kpi" style={{ display: 'flex', gap: '16px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '32px', width: '100%' }}>
                {[
                  { label: 'Active Creators', value: '10k+' },
                  { label: 'Total Supporters', value: '250k+' },
                  { label: 'Paid to Creators', value: '$5M+' }
                ].map((stat, i) => (
                  <div key={i} className="stat-chip hover-lift">
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#111827' }}>{stat.value}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN (Collage) */}
            <div className="hero-collage" style={{ position: 'relative', height: '650px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Background Orbit */}
              <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', border: '1px dashed rgba(88, 101, 242, 0.2)', animation: 'spin 60s linear infinite' }}></div>

              {/* Card 1: Creator Preview (Main) */}
              <div className="card-surface float-slow" style={{
                position: 'absolute', top: '5%', right: '5%', width: '340px', padding: '0', overflow: 'hidden', zIndex: 2,
                boxShadow: '0 30px 60px -10px rgba(0,0,0,0.15)'
              }}>
                <div style={{ height: '380px', width: '100%', position: 'relative' }}>
                  <img src="/images/home_visuals/creator1.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Creator" />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ fontWeight: 700, fontSize: '1.4rem', color: '#fff' }}>Sarah Artist</div>
                      <span style={{ background: '#5865F2', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', color: '#fff', fontWeight: 700 }}>PRO</span>
                    </div>
                    <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>creating digital illustrations & tutorials</div>
                  </div>
                </div>
              </div>

              {/* Card 2: Earnings */}
              <div className="card-surface float-medium" style={{
                position: 'absolute', bottom: '15%', left: '0%', width: '260px', padding: '24px', zIndex: 3
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ width: '32px', height: '32px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💰</div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Monthly Revenue</div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', marginBottom: '8px', letterSpacing: '-0.03em' }}>$4,250.00</div>
                <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>+12% this month</div>
              </div>

              {/* Card 3: New Member */}
              <div className="card-surface float-fast" style={{
                position: 'absolute', top: '25%', left: '-5%', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '16px', zIndex: 1, borderRadius: '100px',
                background: '#fff', border: '1px solid rgba(0,0,0,0.05)'
              }}>
                <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)', borderRadius: '50%', border: '2px solid #fff' }}></div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>Alex B.</div>
                  <div style={{ fontSize: '0.8rem', color: '#5865F2' }}>Just pledged $10/mo</div>
                </div>
              </div>
            </div>

          </div>

          {/* Scroll Cue */}
          <div style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', opacity: 0.5, animation: 'bounce 2s infinite' }}>
            ⬇
          </div>
        </section>


        {/* SECTION 2: HOW IT WORKS */}
        <section id="how-it-works" style={{ padding: 'var(--section-padding-desktop)', background: '#fff' }}>
          <div className="page-container">
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2 className="text-h2" style={{ marginBottom: '16px', fontFamily: 'var(--font-serif)' }}>How it works</h2>
              <p className="text-body" style={{ color: '#4b5563', maxWidth: '600px', margin: '0 auto' }}>
                Start building your membership business in three simple steps.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
              {[
                { icon: '🎨', title: 'Create your page', desc: 'Customize your creator profile, set up membership tiers, and define your brand.' },
                { icon: '🔒', title: 'Share exclusive content', desc: 'Post behind-the-scenes updates, early access work, and member-only media.' },
                { icon: '💸', title: 'Get paid instantly', desc: 'Receive support directly in crypto with low fees and instant settlements on Mantle.' }
              ].map((step, i) => (
                <div key={i} className="card-surface hover-lift" style={{
                  padding: '32px', textAlign: 'left', border: '1px solid var(--color-border)',
                  background: '#fff', borderRadius: '24px', display: 'flex', flexDirection: 'column'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '24px', background: '#f9fafb', width: '80px', height: '80px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{step.icon}</div>
                  <h3 className="text-h3" style={{ marginBottom: '12px', fontSize: '1.5rem' }}>{step.title}</h3>
                  <p className="text-body-sm" style={{ color: '#6b7280', lineHeight: 1.6, flex: 1 }}>{step.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <button className="btn-secondary" onClick={() => router.push('/dashboard')} style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
                Start your page now
              </button>
              <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Takes ~2 minutes to set up</span>
            </div>
          </div>
        </section>

        {/* SECTION 3: FEATURES (Creative Control) */}
        <section style={{ padding: 'var(--section-padding-desktop)', background: '#f9fafb', borderTop: '1px solid var(--color-border)' }}>
          <div className="page-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '80px', alignItems: 'center' }}>
            <div style={{ order: 1 }}> {/* Content first on desktop, handled by grid flow usually but ensuring text is prominent */}
              <div style={{
                textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, fontSize: '0.875rem',
                color: 'var(--color-brand-blue)', marginBottom: '16px', display: 'inline-block',
                background: 'rgba(88, 101, 242, 0.1)', padding: '4px 12px', borderRadius: '4px'
              }}>
                Ownership
              </div>
              <h2 className="headline-huge" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '24px', color: '#111827' }}>
                Complete<br />creative control
              </h2>
              <p className="text-body" style={{ fontSize: '1.25rem', marginBottom: '32px', color: '#4b5563', lineHeight: 1.6 }}>
                You own your content, your list, and your payments. No algorithms standing between you and your biggest fans.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                {['Direct audience relationships', 'Own your email list', 'Censorship-resistant payments'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem' }}>✓</div>
                    <span style={{ fontWeight: 500, fontSize: '1.1rem', color: '#374151' }}>{item}</span>
                  </div>
                ))}
              </div>

              <button className="btn-secondary" onClick={() => router.push('/explore')}>
                See membership perks example
              </button>
            </div>

            <div style={{ position: 'relative', order: 2 }}>
              {/* Abstract Visual */}
              <div style={{
                background: '#fff', borderRadius: 'var(--radius-xl)', padding: '8px',
                boxShadow: 'var(--shadow-xl)', transform: 'rotate(2deg)',
                border: '1px solid var(--color-border)'
              }}>
                <ExclusiveContentMockup />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: FEES & FEATURES */}
        <section style={{ padding: 'var(--section-padding-desktop)', background: '#111827', color: '#fff', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 50% 0%, #1f2937 0%, #111827 50%)' }}></div>

          <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
              <h2 className="headline-huge" style={{ color: '#fff', marginBottom: '24px', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}>Creators set the price.<br />We take a simple fee.</h2>
              <p style={{ fontSize: '1.25rem', color: '#9ca3af', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
                You choose your tier prices. Backr only charges a transparent platform fee per successful transaction. No monthly subscription. No hidden fees.
              </p>
            </div>

            {/* Value Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', marginBottom: '80px' }}>

              {/* Card A: Creator Control */}
              <div className="card-surface hover-lift" style={{
                padding: '32px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease-out'
              }}>
                <div style={{ marginBottom: '24px', flex: 1 }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>You set your prices</h3>
                  <p style={{ color: '#d1d5db', lineHeight: 1.6, marginBottom: '24px', fontSize: '0.95rem' }}>
                    Set any price, anytime. Create tiers that work for your community, from free to VIP.
                  </p>
                  {/* Illustrative Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ padding: '6px 12px', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '20px', color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>Bronze: 5 MNT</span>
                    <span style={{ padding: '6px 12px', background: 'rgba(96, 165, 250, 0.15)', border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: '20px', color: '#60a5fa', fontSize: '0.85rem', fontWeight: 600 }}>Silver: 15 MNT</span>
                    <span style={{ padding: '6px 12px', background: 'rgba(251, 191, 36, 0.15)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '20px', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600 }}>Gold: 50 MNT</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
                    Illustrative examples — creators choose their own pricing.
                  </p>
                </div>
              </div>

              {/* Card B: Platform Fee (Highlight) */}
              <div className="card-surface hover-lift" style={{
                padding: '40px 32px',
                background: 'var(--brand-blue)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.2)',
                transform: 'scale(1.05)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
                position: 'relative',
                zIndex: 10,
                transition: 'all 0.3s ease-out'
              }}>
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>TRANSPARENT</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px', color: '#fff' }}>Platform Fee</h3>
                <div style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1 }}>5%</div>
                <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', marginBottom: '24px', lineHeight: 1.5 }}>
                  Only on successful payments.<br />No monthly subscription.
                </p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>What's included:</div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#fff', fontSize: '0.9rem' }}><span style={{ color: '#a7f3d0', fontSize: '1.1rem' }}>✓</span> Access control & token-gating</div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#fff', fontSize: '0.9rem' }}><span style={{ color: '#a7f3d0', fontSize: '1.1rem' }}>✓</span> Creator page + memberships</div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#fff', fontSize: '0.9rem' }}><span style={{ color: '#a7f3d0', fontSize: '1.1rem' }}>✓</span> Payout dashboard</div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#fff', fontSize: '0.9rem' }}><span style={{ color: '#a7f3d0', fontSize: '1.1rem' }}>✓</span> Audience management</div>
                </div>
              </div>

              {/* Card C: Instant Payouts */}
              <div className="card-surface hover-lift" style={{
                padding: '32px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease-out'
              }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>Instant Payouts</h3>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚡</div>
                <p style={{ color: '#d1d5db', lineHeight: 1.6, marginBottom: '24px', fontSize: '0.95rem' }}>
                  Settlements designed for instant processing on Mantle Network.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#d1d5db', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                  <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#4ade80' }}>✓</span> Funds to your wallet</li>
                  <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#4ade80' }}>✓</span> Crypto-native payments</li>
                  <li style={{ display: 'flex', gap: '8px' }}><span style={{ color: '#4ade80' }}>✓</span> Low gas fees on Mantle</li>
                </ul>
              </div>
            </div>

            {/* Comparison Table */}
            <div style={{ maxWidth: '900px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', padding: '40px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, marginBottom: '32px', color: '#fff' }}>Backr vs. Patreon</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '16px', fontSize: '0.95rem' }}>
                {/* Header */}
                <div style={{ color: '#9ca3af', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Feature</div>
                <div style={{ fontWeight: 700, color: '#fff', textAlign: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Backr</div>
                <div style={{ color: '#9ca3af', textAlign: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Patreon</div>

                {/* Rows */}
                <div style={{ color: '#d1d5db', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Platform Fee</div>
                <div style={{ color: '#4ade80', fontWeight: 700, textAlign: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>5% Flat</div>
                <div style={{ color: '#9ca3af', textAlign: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>8% - 12%</div>

                <div style={{ color: '#d1d5db', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Payout Speed</div>
                <div style={{ color: '#fff', fontWeight: 700, textAlign: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Instant / Real-time</div>
                <div style={{ color: '#9ca3af', textAlign: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Monthly</div>

                <div style={{ color: '#d1d5db', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Pricing Control</div>
                <div style={{ color: '#fff', fontWeight: 700, textAlign: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>You set the price</div>
                <div style={{ color: '#9ca3af', textAlign: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>You set the price</div>

                <div style={{ color: '#d1d5db', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Payment Rails</div>
                <div style={{ color: '#fff', fontWeight: 700, textAlign: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Crypto (Mantle)</div>
                <div style={{ color: '#9ca3af', textAlign: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Cards / PayPal</div>

                <div style={{ color: '#d1d5db', padding: '16px 0' }}>Data Ownership</div>
                <div style={{ color: '#fff', fontWeight: 700, textAlign: 'center', padding: '16px 0' }}>100% You</div>
                <div style={{ color: '#9ca3af', textAlign: 'center', padding: '16px 0' }}>Platform Mediated</div>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ textAlign: 'center', marginTop: '64px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <button className="btn-primary hover-lift" onClick={() => router.push('/dashboard')} style={{ background: '#fff', color: '#111827', minWidth: '200px', transition: 'all 0.2s ease-out' }}>Create your page</button>
                <button className="btn-secondary hover-lift" onClick={() => router.push('/explore')} style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,0.3)', minWidth: '200px', transition: 'all 0.2s ease-out' }}>See example setups</button>
              </div>
              <p style={{ marginTop: '16px', fontSize: '0.875rem', color: '#6b7280' }}>
                Set your tier prices in minutes.
              </p>
            </div>

          </div>
        </section>

        {/* SECTION 5: FAQ */}
        <section style={{ padding: 'var(--section-padding-desktop)', background: '#fff' }}>
          <div className="page-container" style={{ maxWidth: '800px' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2 className="text-h2" style={{ fontFamily: 'var(--font-serif)' }}>Frequently Asked Questions</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
              {[
                { q: 'What do I need to get started?', a: 'Just a crypto wallet (like MetaMask) and your creativity. No credit card required.' },
                { q: 'How do I get paid?', a: 'Payments are streamed directly to your wallet in real-time. You can withdraw instantly.' },
                { q: 'Can I offer free memberships?', a: 'Yes! You can create a free tier to build your mailing list and community.' },
                { q: 'Is it secure?', a: 'We use audited smart contracts on the Mantle network. You own your data and funds at all times.' },
                { q: 'What are the platform fees?', a: 'We charge a flat 5% fee on earnings. No hidden costs, no monthly subscriptions for creators.' },
                { q: 'Can I export my supporter data?', a: 'Absolutely. You own your relationship with your fans. Export your data anytime.' }
              ].map((item, i) => (
                <details key={i} style={{
                  padding: '24px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  background: 'var(--color-bg-surface)',
                  transition: 'background 0.2s'
                }} className="hover:bg-gray-50">
                  <summary style={{ fontSize: '1.1rem', fontWeight: 600, listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {item.q}
                    <span style={{ fontSize: '1.5rem', fontWeight: 300, color: 'var(--color-text-secondary)' }}>+</span>
                  </summary>
                  <p style={{ marginTop: '16px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{item.a}</p>
                </details>
              ))}
            </div>

            <div style={{ textAlign: 'center', padding: '32px', background: '#f9fafb', borderRadius: '16px' }}>
              <p style={{ fontWeight: 600, marginBottom: '8px' }}>Still have questions?</p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <a href="#" style={{ color: 'var(--color-brand-blue)', textDecoration: 'underline' }}>Read the docs</a>
                <span style={{ color: '#d1d5db' }}>|</span>
                <a href="#" style={{ color: 'var(--color-brand-blue)', textDecoration: 'underline' }}>Join Discord Support</a>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: NEWSLETTER */}
        <section style={{ padding: '120px 0', background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)', textAlign: 'center' }}>
          <div className="page-container" style={{ maxWidth: '600px' }}>
            <h2 className="headline-huge" style={{ fontSize: '3rem', marginBottom: '16px', color: '#000' }}>Stay in the loop</h2>
            <p style={{ fontSize: '1.125rem', marginBottom: '32px', color: 'rgba(0,0,0,0.7)' }}>
              Get the latest updates on creator economy features and Mantle ecosystem growth.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed!'); }} style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
              <div className="mobile-stack" style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    borderRadius: 'var(--radius-full)',
                    border: '2px solid rgba(255,255,255,0.5)',
                    fontSize: '1rem',
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(4px)'
                  }}
                />
                <button type="submit" style={{
                  padding: '16px 32px',
                  borderRadius: 'var(--radius-full)',
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                  minWidth: '140px',
                  transition: 'transform 0.2s'
                }} className="hover-lift">
                  Subscribe
                </button>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(0,0,0,0.6)', marginTop: '8px' }}>
                We respect your privacy. No spam. Unsubscribe at any time.
              </p>
            </form>
          </div>
        </section>


        {/* FOOTER */}
        <footer style={{ background: '#000', color: '#fff', padding: '80px 0' }}>
          <div className="page-container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '64px' }}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="headline-huge" style={{ fontSize: '2.5rem' }}>Backr</div>
                <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>Empowering creators with true ownership and decentralized monetization on Mantle.</p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {/* Social Icons Placeholder */}
                  <div style={{ width: '32px', height: '32px', background: '#333', borderRadius: '50%' }}></div>
                  <div style={{ width: '32px', height: '32px', background: '#333', borderRadius: '50%' }}></div>
                  <div style={{ width: '32px', height: '32px', background: '#333', borderRadius: '50%' }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <strong style={{ marginBottom: '8px', color: '#fff' }}>Product</strong>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Pricing</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Success Stories</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Roadmap</a>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <strong style={{ marginBottom: '8px', color: '#fff' }}>Resources</strong>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Help Center</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Creator Handbook</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Mantle Network</a>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <strong style={{ marginBottom: '8px', color: '#fff' }}>Legal</strong>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy</a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms</a>
              </div>
            </div>

            <div style={{ marginTop: '80px', paddingTop: '32px', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>© 2024 Backr. All rights reserved.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.9rem' }}>
                <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }}></span>
                All systems operational
              </div>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
