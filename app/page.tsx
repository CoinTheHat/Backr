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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#000', fontFamily: 'var(--font-family)', overflowX: 'hidden' }}>

      {/* Global Styles & Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        :root {
            --brand-blue: #5865F2;
            --brand-text: #1a1a1a;
        }
        
        @keyframes float { 
          0%, 100% { transform: translateY(0) rotate(0deg); } 
          50% { transform: translateY(-15px) rotate(1deg); } 
        }
        @keyframes drift {
            0% { transform: translate(0, 0); }
            50% { transform: translate(10px, -10px); }
            100% { transform: translate(0, 0); }
        }
        @keyframes pulse-soft {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }

        .float-slow { animation: float 8s ease-in-out infinite; }
        .float-medium { animation: float 6s ease-in-out infinite 1s; }
        .float-fast { animation: float 5s ease-in-out infinite 0.5s; }
        
        .headline-huge {
            font-family: var(--font-serif);
            font-weight: 400;
            line-height: 0.9;
            letter-spacing: -0.04em;
        }

        .nav-scrolled {
            background: rgba(255, 255, 255, 0.9) !important;
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .creator-card-hover:hover {
            transform: scale(1.03) translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.2) !important;
            z-index: 10;
        }
        
        .halftone-bg {
            background-image: radial-gradient(circle, #000 1px, transparent 1px);
            background-size: 20px 20px;
            opacity: 0.1;
        }

        /* Mobile specific adjustments */
        @media (max-width: 768px) {
            .mobile-stack { flex-direction: column !important; }
            .mobile-hide { display: none !important; }
            .mobile-padding { padding: 40px 20px !important; }
            .headline-huge { font-size: 15vw !important; }
        }
      `}} />

      {/* ---------------------------------------------------------------------------
         NAVIGATION - Transparent to Sticky
         --------------------------------------------------------------------------- */}
      {/* Navigation */}
      <nav
        className={scrolled ? 'nav-scrolled' : ''}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 100,
          padding: '20px 0',
          transition: 'all 0.3s ease',
          background: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--color-border)' : 'none'
        }}>
        <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            onClick={() => router.push('/')}
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              color: 'var(--color-text-primary)'
            }}
          >
            Backr
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
            <span
              className="mobile-hide"
              onClick={() => router.push('/explore')}
              style={{
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.95rem',
                color: 'var(--color-text-primary)'
              }}>
              Find Creators
            </span>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                padding: '12px 24px',
                borderRadius: 'var(--radius-full)',
                background: '#000',
                color: '#fff',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.95rem',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main style={{ paddingTop: '0px' }}>

        {/* SECTION 1: HERO */}
        <section style={{
          minHeight: '90vh',
          background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
          paddingTop: '120px',
          paddingBottom: '80px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center'
        }}>
          {/* Mobile Layout Fix */}
          <style dangerouslySetInnerHTML={{
            __html: `
             @media (max-width: 1024px) {
                 .hero-grid { grid-template-columns: 1fr !important; text-align: center; }
                 .hero-left { margin: 0 auto; alignItems: center !important; }
                 .hero-kpi { justify-content: center; }
                 .hero-collage { display: none !important; }
                 .mobile-cta-sticky { position: fixed; bottom: 20px; left: 20px; right: 20px; z-index: 1000; box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important; animation: slideUp 0.5s ease-out; }
             }
             @keyframes slideUp { from { transform: translateY(100px); } to { transform: translateY(0); } }
             `
          }} />

          <div className="page-container hero-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '64px',
            alignItems: 'center',
            width: '100%'
          }}>

            {/* LEFT COLUMN */}
            <div className="hero-left" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', zIndex: 10 }}>
              {/* Trust Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px',
                background: '#fff',
                border: '1px solid var(--color-border)',
                borderRadius: '100px',
                marginBottom: '32px',
                boxShadow: 'var(--shadow-sm)',
                fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)'
              }}>
                <span style={{ width: '8px', height: '8px', background: 'var(--color-brand-blue)', borderRadius: '50%' }}></span>
                Built on Mantle
              </div>

              {/* Headline */}
              <h1 className="headline-huge" style={{
                fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                lineHeight: 1.1,
                marginBottom: '24px',
                color: '#111827',
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-serif)'
              }}>
                Unlock your <br />
                <span style={{ color: 'var(--color-brand-blue)' }}>creative potential</span>
              </h1>

              {/* Subheadline value prop */}
              <p style={{
                fontSize: '1.25rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '40px',
                maxWidth: '540px',
                lineHeight: 1.6
              }}>
                The all-in-one platform for creators to build community, share exclusive content, and earn directly from fans.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '48px' }}>
                <button
                  className="mobile-cta-sticky"
                  onClick={() => router.push('/dashboard')}
                  style={{
                    padding: '16px 32px', borderRadius: 'var(--radius-full)', background: '#111827', color: '#fff',
                    fontSize: '1.05rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                    boxShadow: 'var(--shadow-lg)', transition: 'transform 0.2s'
                  }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  Create on Backr
                </button>
                <button onClick={() => router.push('/explore')} style={{
                  padding: '16px 32px', borderRadius: 'var(--radius-full)', background: '#fff', color: '#111827',
                  fontSize: '1.05rem', fontWeight: 600, border: '1px solid var(--color-border)', cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s'
                }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  Find Creators
                </button>
              </div>

              {/* KPIs (Chips) */}
              <div className="hero-kpi" style={{ display: 'flex', gap: '32px', borderTop: '1px solid var(--color-border)', paddingTop: '32px', width: '100%' }}>
                {[
                  { label: 'Creators', value: '10k+' },
                  { label: 'Supporters', value: '250k+' },
                  { label: 'Paid out', value: '$5M+' }
                ].map((stat, i) => (
                  <div key={i}>
                    <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--color-text-primary)' }}>{stat.value}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN (Collage) */}
            <div className="hero-collage" style={{ position: 'relative', height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Background Blob */}
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, #dbeafe 0%, transparent 70%)', opacity: 0.6, zIndex: 0 }}></div>

              {/* Card 1: Creator Preview (Main) */}
              <div className="card-surface float-slow" style={{
                position: 'absolute', top: '10%', right: '10%', width: '320px', padding: '0', overflow: 'hidden', zIndex: 2
              }}>
                <div style={{ height: '320px', width: '100%', position: 'relative' }}>
                  <img src="/images/home_visuals/creator1.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Creator" />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#fff' }}>Sarah Artist</div>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>Digital Illustrator</div>
                  </div>
                </div>
              </div>

              {/* Card 2: Earnings (Overlapping Bottom Left) */}
              <div className="card-surface float-medium" style={{
                position: 'absolute', bottom: '20%', left: '0%', width: '280px', padding: '24px', zIndex: 3
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Monthly Revenue</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-success)', marginBottom: '12px' }}>$4,250</div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '40px' }}>
                  {[40, 60, 35, 80, 55, 90, 70].map((h, i) => <div key={i} style={{ flex: 1, background: '#10b981', height: `${h}%`, borderRadius: '2px', opacity: 0.8 }}></div>)}
                </div>
              </div>

              {/* Card 3: Membership (Small Notification) */}
              <div className="card-surface float-fast" style={{
                position: 'absolute', top: '25%', left: '-10%', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1, borderRadius: '100px'
              }}>
                <div style={{ width: '32px', height: '32px', background: '#5865F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>✨</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>New <strong>Gold Member</strong></div>
              </div>
            </div>

          </div>
        </section>


        {/* SECTION 2: "Complete Creative Control" */}
        <section style={{ padding: 'var(--space-16) 0', background: '#fff', position: 'relative', overflow: 'hidden', minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          {/* Centered Massive Text */}
          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
            <h2 className="headline-huge" style={{ fontSize: 'clamp(4rem, 9vw, 8rem)', color: '#000' }}>
              Complete<br />
              creative<br />
              control
            </h2>
          </div>

          {/* Orbiting Cards */}
          <div className="float-fast mobile-hide" style={{ position: 'absolute', top: '15%', left: '10%', width: '300px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', transform: 'rotate(-5deg)' }}>
            <div style={{ background: '#000', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <span style={{ fontSize: '3rem' }}>▶</span>
            </div>
            <div style={{ padding: 'var(--space-md)', background: '#fff' }}>
              <div style={{ fontWeight: 'bold' }}>Exclusive: Behind the scenes</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Video • 12 mins</div>
            </div>
          </div>

          <div className="float-slow mobile-hide" style={{ position: 'absolute', bottom: '20%', right: '8%', width: '280px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', transform: 'rotate(3deg)' }}>
            <img src="/images/home_visuals/creator2.png" style={{ width: '100%', height: '280px', objectFit: 'cover' }} alt="Musician" />
            <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', background: 'rgba(255,255,255,0.9)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>New Track Demo</div>
              <div style={{ width: '100%', height: '4px', background: '#ddd', marginTop: '8px', borderRadius: '2px' }}>
                <div style={{ width: '40%', height: '100%', background: '#000' }}></div>
              </div>
            </div>
          </div>

          <div className="float-medium mobile-hide" style={{ position: 'absolute', top: '10%', right: '15%', width: '240px', background: '#fdfbf7', padding: 'var(--space-lg)', borderRadius: '2px', boxShadow: 'var(--shadow-md)', transform: 'rotate(2deg)' }}>
            <div style={{ fontFamily: 'serif', fontSize: '1.5rem', lineHeight: '1.2', marginBottom: 'var(--space-3)' }}>
              "My Gold Tier members just unlocked this exclusive demo."
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Membership Perks →</div>
          </div>

        </section>


        {/* SECTION 3: "Creators. Fans. Nothing in between." */}
        <section style={{ background: '#5865F2', padding: 'var(--space-16) 0', color: '#fff' }}>
          <div className="page-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-16)', alignItems: 'center' }}>

            {/* Text Content */}
            <div>
              <h2 className="headline-huge" style={{ fontSize: 'clamp(3.5rem, 8vw, 7rem)', marginBottom: 'var(--space-8)' }}>
                Creators.<br />
                Fans.<br />
                Nothing in<br />
                between.
              </h2>
              <p style={{ fontSize: '1.5rem', lineHeight: '1.5', opacity: '0.9', maxWidth: '600px' }}>
                Patreon gives you a direct line of access to your fan community, with no ads or gatekeepers in the way.
              </p>
            </div>

            {/* Visual */}
            <div style={{ transform: 'scale(1.1) rotate(-2deg)' }}>
              <ExclusiveContentMockup />
            </div>

          </div>
        </section>


        {/* SECTION 4: "Turning passions into business" */}
        <section style={{ background: '#000', padding: 'var(--space-16) 0', color: '#fff', position: 'relative' }}>
          <div className="page-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-12)', alignItems: 'center' }}>

            {/* Phone Visual */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '320px',
                height: '640px',
                background: '#1a1a1a',
                borderRadius: '40px',
                border: '8px solid #333',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '24px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '20px' }}>Dashboard</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>$16,414</div>
                  <div style={{ color: '#4ade80', fontSize: '0.9rem', marginBottom: '40px' }}>▲ 12% from last month</div>

                  <div style={{ display: 'flex', alignItems: 'flex-end', height: '150px', gap: '8px', marginBottom: '40px' }}>
                    {[40, 60, 45, 70, 55, 80, 65, 90].map((h, i) => (
                      <div key={i} style={{ flex: 1, background: i === 7 ? '#5865F2' : '#333', height: `${h}%`, borderRadius: '4px' }}></div>
                    ))}
                  </div>

                  <div style={{ background: '#333', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Active Members</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>1,240</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div>
              <h2 className="headline-huge" style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', marginBottom: 'var(--space-8)' }}>
                Turning<br /> passions into<br /> <span style={{ color: '#5865F2' }}>businesses</span>
              </h2>
              <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: 'var(--space-2)' }}>Unlock growth</h3>
                  <p style={{ color: '#aaa', lineHeight: '1.6' }}>Get deep insights into who your fans are and what they love.</p>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: 'var(--space-2)' }}>More ways to earn</h3>
                  <p style={{ color: '#aaa', lineHeight: '1.6' }}>From memberships to one-off shops, you set the rules.</p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* SECTION 5: "Your Rules" */}
        <section style={{ position: 'relative', padding: 'var(--space-16) 0', background: '#f3f4f6', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }} className="halftone-bg"></div>

          <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(4rem, 12vw, 15rem)',
              lineHeight: '0.85',
              color: '#000',
              textAlign: 'center'
            }}>
              Your<br />
              newsletter<br />
              <span style={{
                display: 'block',
                textAlign: 'right',
                fontStyle: 'italic',
                background: 'linear-gradient(45deg, #FF5E5E, #5865F2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Your rules
              </span>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, #ffaaaa 0%, transparent 70%)', opacity: 0.5, filter: 'blur(40px)' }}></div>
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '400px', height: '400px', background: 'radial-gradient(circle, #aaaaff 0%, transparent 70%)', opacity: 0.5, filter: 'blur(40px)' }}></div>
        </section>


        {/* FOOTER */}
        <footer style={{ background: '#000', color: '#fff', padding: '80px 0' }}>
          <div className="page-container">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <div className="headline-huge" style={{ fontSize: '3rem' }}>Backr</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', paddingTop: '40px', borderTop: '1px solid #333' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <strong style={{ marginBottom: '8px' }}>Product</strong>
                  <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Lite</a>
                  <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Pro</a>
                  <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Premium</a>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <strong style={{ marginBottom: '8px' }}>For Creators</strong>
                  <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Podcasters</a>
                  <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Video Creators</a>
                  <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Musicians</a>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <p style={{ color: '#666' }}>© 2024 Backr on Mantle.</p>
                </div>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
