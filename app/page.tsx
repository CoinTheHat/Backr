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
      <nav
        className={scrolled ? 'nav-scrolled' : ''}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 100,
          padding: '20px clamp(24px, 5vw, 64px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.3s ease',
          background: 'transparent'
        }}>
        <div
          onClick={() => router.push('/')}
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            color: '#000'
          }}
        >
          Backr
        </div>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <span className="mobile-hide" onClick={() => router.push('/explore')} style={{ cursor: 'pointer', fontWeight: '500', fontSize: '0.95rem' }}>Find Creators</span>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '12px 24px',
              borderRadius: '99px',
              background: '#000',
              color: '#fff',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}>
            Get Started
          </button>
        </div>
      </nav>

      <main style={{ paddingTop: '0px' }}>

        {/* ---------------------------------------------------------------------------
            SECTION 1: HERO - "Creativity powered by fandom"
            Ref: Image 4 (Asymmetric grid with massive text)
            --------------------------------------------------------------------------- */}
        <section style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #dbeafe 0%, #eff6ff 100%)',
          padding: '140px clamp(24px, 5vw, 64px) 80px',
          position: 'relative',
          overflow: 'hidden'
        }}>

          <div style={{ maxWidth: '1600px', margin: '0 auto', position: 'relative', height: '100%' }}>

            {/* Top Text */}
            <h1 className="headline-huge" style={{ fontSize: 'clamp(5rem, 11vw, 13rem)', color: '#4b3f35', marginBottom: '0' }}>
              Creativity
            </h1>

            <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '-20px' }}>
              {/* Middle Text - "powered" */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h1 className="headline-huge" style={{
                  fontSize: 'clamp(5rem, 11vw, 13rem)',
                  color: '#4b3f35',
                  marginLeft: 'clamp(0px, 10vw, 150px)',
                  fontStyle: 'italic',
                  fontFamily: 'var(--font-sans)', /* Mixing sans for "powered" per ref? Or keep serif */
                  fontWeight: '300'
                }}>
                  powered
                </h1>
              </div>

              {/* Creator Image 1 (Right side floating) */}
              <div className="creator-card-hover float-slow" style={{
                width: 'clamp(200px, 25vw, 350px)',
                aspectRatio: '3/4',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                transform: 'rotate(2deg)',
                marginTop: '40px'
              }}>
                <img src="/images/home_visuals/creator2.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Musician" />
              </div>
            </div>

            <div className="mobile-stack" style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
              {/* Creator Image 2 (Left side) */}
              <div className="creator-card-hover float-medium mobile-hide" style={{
                width: 'clamp(180px, 20vw, 280px)',
                aspectRatio: '4/5',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                transform: 'rotate(-3deg)',
                marginTop: '-100px',
                marginLeft: '50px'
              }}>
                <img src="/images/home_visuals/creator1.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Artist" />
              </div>

              {/* Bottom Text - "by fandom" */}
              <h1 className="headline-huge" style={{
                fontSize: 'clamp(5rem, 11vw, 13rem)',
                color: '#9ca3af', /* Lighter grey for 'by fandom' per ref style */
                textAlign: 'right',
                width: '100%',
                marginTop: '20px'
              }}>
                by fandom
              </h1>
            </div>

            {/* Main CTA positioned absolutely or in flow depending on mobile */}
            <div style={{ marginTop: '60px', textAlign: 'center' }}>
              <p style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 32px', fontFamily: 'var(--font-sans)', lineHeight: '1.6' }}>
                Patreon is the best place to build community with your biggest fans, share exclusive work, and turn your passion into a lasting creative business.
              </p>
              <button onClick={() => router.push('/dashboard')} style={{
                padding: '24px 64px',
                fontSize: '1.25rem',
                background: '#000',
                color: '#fff',
                borderRadius: '99px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
              }}>
                Get Started
              </button>
            </div>

          </div>
        </section>


        {/* ---------------------------------------------------------------------------
            SECTION 2: "Complete Creative Control"
            Ref: Image 2 (Centered text + orbiting cards)
            --------------------------------------------------------------------------- */}
        <section style={{ padding: '160px 20px', background: '#fff', position: 'relative', overflow: 'hidden', minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          {/* Centered Massive Text */}
          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
            <h2 className="headline-huge" style={{ fontSize: 'clamp(4rem, 9vw, 8rem)', color: '#000' }}>
              Complete<br />
              creative<br />
              control
            </h2>
          </div>

          {/* Orbiting Cards - Absolute Positioned */}
          {/* Card 1: Video Thumb */}
          <div className="float-fast mobile-hide" style={{ position: 'absolute', top: '15%', left: '10%', width: '300px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', transform: 'rotate(-5deg)' }}>
            <div style={{ background: '#000', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <span style={{ fontSize: '3rem' }}>▶</span>
            </div>
            <div style={{ padding: '16px', background: '#fff' }}>
              <div style={{ fontWeight: 'bold' }}>Exclusive: Behind the scenes</div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>Video • 12 mins</div>
            </div>
          </div>

          {/* Card 2: Audio/Podcast */}
          <div className="float-slow mobile-hide" style={{ position: 'absolute', bottom: '20%', right: '8%', width: '280px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', transform: 'rotate(3deg)' }}>
            <img src="/images/home_visuals/creator2.png" style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', background: 'rgba(255,255,255,0.9)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>New Track Demo</div>
              <div style={{ width: '100%', height: '4px', background: '#ddd', marginTop: '8px', borderRadius: '2px' }}>
                <div style={{ width: '40%', height: '100%', background: '#000' }}></div>
              </div>
            </div>
          </div>

          {/* Card 3: Post/Article */}
          <div className="float-medium mobile-hide" style={{ position: 'absolute', top: '10%', right: '15%', width: '240px', background: '#fdfbf7', padding: '24px', borderRadius: '2px', boxShadow: '0 10px 20px rgba(0,0,0,0.08)', transform: 'rotate(2deg)' }}>
            <div style={{ fontFamily: 'serif', fontSize: '1.5rem', lineHeight: '1.2', marginBottom: '12px' }}>
              "My Gold Tier members just unlocked this exclusive demo."
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Membership Perks →</div>
          </div>

        </section>


        {/* ---------------------------------------------------------------------------
            SECTION 3: "Creators. Fans. Nothing in between."
            Ref: Image 1 (Blue layout, chat mockup)
            --------------------------------------------------------------------------- */}
        <section style={{ background: '#5865F2', padding: '140px clamp(24px, 5vw, 80px)', color: '#fff' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '80px', alignItems: 'center' }}>

            {/* Text Content */}
            <div>
              <h2 className="headline-huge" style={{ fontSize: 'clamp(3.5rem, 8vw, 7rem)', marginBottom: '40px' }}>
                Creators.<br />
                Fans.<br />
                Nothing in<br />
                between.
              </h2>
              <p style={{ fontSize: '1.5rem', lineHeight: '1.5', opacity: '0.9', maxWidth: '600px' }}>
                Patreon gives you a direct line of access to your fan community, with no ads or gatekeepers in the way.
              </p>
            </div>

            {/* Visual: Exclusive Content Mockup */}
            <div style={{ transform: 'scale(1.1) rotate(-2deg)' }}>
              <ExclusiveContentMockup />
            </div>

          </div>
        </section>


        {/* ---------------------------------------------------------------------------
            SECTION 4: "Turning passions into business" (Phone Mockup)
            Ref: Image 3
            --------------------------------------------------------------------------- */}
        <section style={{ background: '#000', padding: '140px clamp(24px, 5vw, 80px)', color: '#fff', position: 'relative' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center' }}>

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
                {/* Phone Screen Mockup */}
                <div style={{ padding: '24px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '20px' }}>Dashboard</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>$16,414</div>
                  <div style={{ color: '#4ade80', fontSize: '0.9rem', marginBottom: '40px' }}>▲ 12% from last month</div>

                  {/* Fake Chart */}
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
              <h2 className="headline-huge" style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', marginBottom: '32px' }}>
                Turning<br /> passions into<br /> <span style={{ color: '#5865F2' }}>businesses</span>
              </h2>
              <div style={{ display: 'grid', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Unlock growth</h3>
                  <p style={{ color: '#aaa', lineHeight: '1.6' }}>Get deep insights into who your fans are and what they love.</p>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>More ways to earn</h3>
                  <p style={{ color: '#aaa', lineHeight: '1.6' }}>From memberships to one-off shops, you set the rules.</p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ---------------------------------------------------------------------------
            SECTION 5: Halftone / Newsletter "Your Rules"
            Ref: Image 5
            --------------------------------------------------------------------------- */}
        <section style={{ position: 'relative', padding: '160px 20px', background: '#f3f4f6', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }} className="halftone-bg"></div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto' }}>
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


        {/* ---------------------------------------------------------------------------
            FOOTER
            --------------------------------------------------------------------------- */}
        <footer style={{ background: '#000', color: '#fff', padding: '80px clamp(24px, 5vw, 64px)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
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
        </footer>

      </main>
    </div>
  );
}
