'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAccount } from 'wagmi';

export default function Home() {
  const router = useRouter();
  const { isConnected } = useAccount();

  const [activeTab, setActiveTab] = useState('Podcasters');

  const tabContent: any = {
    'Podcasters': {
      headline: "Episodes that pay.",
      text: "Give your listeners a backstage pass. Offer ad-free episodes, bonus content, and community access directly to your biggest fans.",
      image: "url(/images/home_visuals/podcast.png)",
    },
    'Video Creators': {
      headline: "Stream on your own terms.",
      text: "Share exclusive cuts, behind-the-scenes vlogs, and early access premieres without worrying about algorithms.",
      image: "url(/images/home_visuals/video.png)",
    },
    'Musicians': {
      headline: "Connect beyond the track.",
      text: "Ticket presales, unreleased demos, and VIP experiences. Turn casual listeners into a dedicated street team.",
      image: "url(/images/home_visuals/music.png)",
    },
    'Visual Artists': {
      headline: "Art that sustains you.",
      text: "High-res downloads, tutorials, and print shops. Build a gallery that pays the rent and fuels your next masterpiece.",
      image: "url(/images/home_visuals/art.png)",
    },
    'Writers': {
      headline: "Serialized success.",
      text: "Serialize your novel, publish exclusive essays, or start a paid newsletter. Your words are worth more than likes.",
      image: "url(/images/home_visuals/writing.png)",
    },
    'Gamers': {
      headline: "Level up your community.",
      text: "Offer exclusive coaching, private lobbies, and custom mods. Monetize your skills and build a dedicated squad.",
      image: "url(/images/home_visuals/gaming.png)",
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#000', fontFamily: 'var(--font-geist-sans)', overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        :root { --padding-x: 24px; }
        @media (min-width: 1024px) { :root { --padding-x: 64px; } }
        
        .nav-container { padding: 16px var(--padding-x); }

        /* HEADER - 3 Column Layout */
        .header-grid {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: center;
            max-width: 1600px;
            margin: 0 auto;
        }
        
        /* Hero */
        .hero-section {
          padding: 120px var(--padding-x) 180px;
          max-width: 1600px;
          margin: 0 auto;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          overflow: hidden;
        }

        .hero-headline {
            font-size: clamp(3.5rem, 7vw, 6rem);
            font-weight: 800;
            line-height: 1.05;
            letter-spacing: -0.03em;
            margin-bottom: 24px;
            position: relative;
            z-index: 10;
        }

        /* Hero Visuals (Floating Cards) - Light Mode */
        .hero-visual {
            position: absolute;
            z-index: 0;
            transition: transform 0.3s ease-out;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
            border: 1px solid rgba(0,0,0,0.05);
            border-radius: 20px;
            overflow: hidden;
            background: #fff;
        }
        .visual-left { 
            left: 5%; top: 20%; 
            transform: rotate(-6deg);
            width: 240px;
        }
        .visual-right { 
            right: 5%; top: 30%; 
            transform: rotate(6deg); 
            width: 260px;
        }
        .visual-bottom-left {
             bottom: 10%; left: 15%;
             transform: rotate(3deg);
             width: 220px;
             display: none;
        }
        @media(min-width: 1024px) {
            .visual-bottom-left { display: block; }
        }

        /* Pill Buttons */
        .pill-btn {
            border-radius: 9999px;
            padding: 12px 32px;
            font-weight: 700;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            text-decoration: none;
        }
        .btn-primary { 
            background: #000; color: #fff; 
        }
        .btn-primary:hover { transform: scale(1.05); background: #333; }
        .btn-secondary { background: transparent; color: #000; }
        .btn-secondary:hover { background: rgba(0,0,0,0.05); }

        /* Tabs */
        .tabs-wrapper {
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 64px;
        }
        .tab-pill {
            padding: 10px 24px;
            border-radius: 9999px;
            background: #f3f4f6;
            border: 1px solid transparent;
            color: #52525b;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
        }
        .tab-pill:hover, .tab-pill.active {
            background: #e0f2fe;
            color: #0284c7;
            border-color: #0284c7;
        }
        
        .desktop-only { display: none; }
        @media (min-width: 768px) { .desktop-only { display: block !important; } }

        /* Animations */
        @keyframes float {
          0% { transform: translateY(0px) rotate(-6deg); }
          50% { transform: translateY(-20px) rotate(-6deg); }
          100% { transform: translateY(0px) rotate(-6deg); }
        }
        @keyframes float-right {
          0% { transform: translateY(0px) rotate(6deg); }
          50% { transform: translateY(-25px) rotate(6deg); }
          100% { transform: translateY(0px) rotate(6deg); }
        }
        @keyframes float-slow {
          0% { transform: translateY(0px) rotate(3deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
          100% { transform: translateY(0px) rotate(3deg); }
        }
        
        .visual-left { animation: float 6s ease-in-out infinite; }
        .visual-right { animation: float-right 7s ease-in-out infinite; }
        .visual-bottom-left { animation: float-slow 8s ease-in-out infinite; }

      `}} />

      {/* Navigation (Strict Center Logo) - Light Mode */}
      <nav className="nav-container" style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="header-grid">
          {/* Left: Links - FIXED */}
          <div style={{ display: 'flex', gap: '24px' }}>
            <span onClick={() => router.push('/explore')} className="desktop-only" style={{ color: '#000', fontWeight: '600', cursor: 'pointer' }}>Creators</span>
            <span onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="desktop-only" style={{ color: '#000', fontWeight: '600', cursor: 'pointer' }}>Pricing</span>
            <span className="desktop-only" style={{ color: '#000', fontWeight: '600', cursor: 'pointer' }}>Resources</span>
          </div>

          {/* Center: Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }} onClick={() => router.push('/')}>
            <div style={{ width: '40px', height: '40px', background: '#000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '20px', height: '20px', background: '#fff', borderRadius: '2px' }}></div>
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', alignItems: 'center' }}>
            {isConnected ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="pill-btn btn-primary"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <span onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer', fontWeight: 'bold' }}>Log In</span>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="pill-btn btn-primary"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav >

      <main>
        {/* CENTERED HERO SECTION - Light */}
        <section className="hero-section">

          {/* Background Atmosphere - Light */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '80%', height: '80%',
            background: 'radial-gradient(circle, rgba(2, 132, 199, 0.08) 0%, transparent 60%)',
            filter: 'blur(100px)', zIndex: 0
          }}></div>

          {/* Floating Visuals - Denser & Richer */}

          {/* Top Left - Podcast */}
          <div className="hero-visual visual-left" style={{ top: '15%', left: '5%', width: '220px', animationDelay: '0s' }}>
            <div style={{ height: '160px', background: 'url(/images/home_visuals/podcast.png) center/cover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Future Talk</div>
              <div style={{ fontSize: '0.8rem', color: '#52525b' }}>Podcast • 12k</div>
            </div>
          </div>

          {/* Middle Right - Art */}
          <div className="hero-visual visual-right" style={{ top: '25%', right: '5%', width: '240px', animationDelay: '1s' }}>
            <div style={{ height: '180px', background: 'url(/images/home_visuals/art.png) center/cover' }}></div>
            <div style={{ padding: '16px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Neon City</div>
              <div style={{ fontSize: '0.8rem', color: '#52525b' }}>Digital Art • 8.5k</div>
            </div>
          </div>

          {/* Bottom Left - Gaming */}
          <div className="hero-visual visual-bottom-left" style={{ bottom: '15%', left: '12%', width: '200px', animationDelay: '2s' }}>
            <div style={{ height: '130px', background: 'url(/images/home_visuals/gaming.png) center/cover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Pro Gamer Tips</div>
            </div>
          </div>

          {/* NEW: Top Right - Writing */}
          <div className="hero-visual visual-top-right desktop-only" style={{ top: '12%', right: '18%', width: '180px', animation: 'float-slow 9s ease-in-out infinite', animationDelay: '1.5s' }}>
            <div style={{ height: '120px', background: 'url(/images/home_visuals/writing.png) center/cover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Daily Essays</div>
            </div>
          </div>

          {/* NEW: Bottom Right - Music */}
          <div className="hero-visual visual-bottom-right desktop-only" style={{ bottom: '20%', right: '15%', width: '210px', animation: 'float 7s ease-in-out infinite', animationDelay: '0.5s' }}>
            <div style={{ height: '140px', background: 'url(/images/home_visuals/music.png) center/cover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Indie Vibes</div>
              <div style={{ fontSize: '0.75rem', color: '#52525b' }}>Early Access</div>
            </div>
          </div>

          {/* NEW: Extreme Left Bottom - Video */}
          <div className="hero-visual visual-ex-left desktop-only" style={{ bottom: '35%', left: '2%', width: '160px', animation: 'float-right 8s ease-in-out infinite', animationDelay: '3s' }}>
            <div style={{ height: '100px', background: 'url(/images/home_visuals/video.png) center/cover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            </div>
            <div style={{ padding: '10px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Behind Scenes</div>
            </div>
          </div>

          {/* Central Content */}
          <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px' }}>
            <h1 className="hero-headline">
              Complete creative <br />
              <span style={{ color: '#000' }}>control.</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#52525b', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
              Join the thousands of creators on Backr who are building communities, sharing exclusive work, and getting paid directly.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button className="pill-btn btn-primary" style={{ fontSize: '1.1rem', padding: '16px 48px' }} onClick={() => router.push('/dashboard')}>
                Create on Backr
              </button>
              <button className="pill-btn btn-secondary" style={{ fontSize: '1.1rem', padding: '16px 48px', border: '1px solid #e5e7eb' }} onClick={() => router.push('/explore')}>
                Find Creators
              </button>
            </div>
          </div>
        </section>

        {/* Tabbed Interactive Section - Light */}
        <section style={{ padding: '80px var(--padding-x)', background: '#f8fafc' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '48px' }}>Who uses Backr?</h2>

          <div className="tabs-wrapper">
            {Object.keys(tabContent).map(tab => (
              <button
                key={tab}
                className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="content-display" style={{
            maxWidth: '1200px', margin: '0 auto',
            background: '#fff', borderRadius: '32px', overflow: 'hidden',
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            boxShadow: '0 20px 40px -4px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <style dangerouslySetInnerHTML={{
              __html: `
                    @media (max-width: 768px) { .content-display { grid-template-columns: 1fr !important; } }
                 `}} />

            {/* Image Side */}
            <div style={{ minHeight: '400px', background: `${tabContent[activeTab].image} center/cover no-repeat`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            </div>

            {/* Text Side */}
            <div style={{ padding: '64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '24px', lineHeight: 1.1, color: '#000' }}>{tabContent[activeTab].headline}</h3>
              <p style={{ fontSize: '1.1rem', color: '#52525b', lineHeight: '1.6', marginBottom: '32px' }}>{tabContent[activeTab].text}</p>
              <div style={{ fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#000' }} onClick={() => router.push('/explore')}>
                See Example {activeTab} <span>→</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section (Restored) */}
        <section id="pricing" style={{ padding: '120px var(--padding-x)', background: '#fff' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '64px' }}>Simple, transparent pricing.</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px', alignItems: 'center' }}>
              <div style={{ padding: '48px', background: '#f8fafc', borderRadius: '32px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '4rem', fontWeight: '800', marginBottom: '16px', color: '#000' }}>5%</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>Platform Flat Fee</h3>
                <p style={{ color: '#52525b', lineHeight: '1.6', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                  We take a <b>flat 5%</b> fee from earnings. No hidden charges, no tiered plans. You keep 95% of what you make, plus direct control over your payouts via the Mantle blockchain.
                </p>
              </div>
            </div>

            <div style={{ marginTop: '64px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', textAlign: 'left' }}>
              <div>
                <h4 style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '8px' }}>Why 5%?</h4>
                <p style={{ color: '#52525b' }}>Most platforms take 10-30%. We use efficient smart contracts to keep costs minimal.</p>
              </div>
              <div>
                <h4 style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '8px' }}>Withdrawals</h4>
                <p style={{ color: '#52525b' }}>Instant withdrawals to your wallet. You don't have to wait for "payout day".</p>
              </div>
              <div>
                <h4 style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '8px' }}>Supporter Fees</h4>
                <p style={{ color: '#52525b' }}>Supporters pay minimal gas fees (cents) for transactions on Mantle.</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer style={{ padding: '80px var(--padding-x)', borderTop: '1px solid #e5e7eb', textAlign: 'center', background: '#fff', color: '#000' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px' }}>Backr</h2>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', color: '#52525b', marginBottom: '48px' }}>
          <span style={{ cursor: 'pointer' }}>Terms</span>
          <span style={{ cursor: 'pointer' }}>Privacy</span>
          <span style={{ cursor: 'pointer' }}>Community Guidelines</span>
        </div>
        <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>© 2024 Backr Platform. Built on Mantle.</p>
      </footer>
    </div>
  );
}
