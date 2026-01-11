'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useConnect } from 'wagmi';
import Button from "./components/Button";
import WalletButton from "./components/WalletButton";
import Card from "./components/Card";

export default function Home() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('Podcasters');

  // Interactive Tab Content Data
  const tabContent: any = {
    'Podcasters': {
      headline: "Episodes that pay.",
      text: "Give your listeners a backstage pass. Offer ad-free episodes, bonus content, and community access directly to your biggest fans.",
      image: "linear-gradient(135deg, #FF6B6B 0%, #C44569 100%)", // Mock image placeholder
      icon: "🎙️"
    },
    'Video Creators': {
      headline: "Stream on your own terms.",
      text: "Stop worrying about demonetization. Share exclusive cuts, behind-the-scenes vlogs, and early access premieres.",
      image: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      icon: "🎬"
    },
    'Musicians': {
      headline: "Connect beyond the track.",
      text: "Ticket presales, unreleased demos, and VIP experiences. Turn casual listeners into a dedicated street team.",
      image: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      icon: "🎵"
    },
    'Visual Artists': {
      headline: "Art that sustains you.",
      text: "High-res downloads, tutorials, and print shops. Build a gallery that pays the rent and fuels your next masterpiece.",
      image: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      icon: "🎨"
    },
    'Writers': {
      headline: "Serialized success.",
      text: "Serialize your novel, publish exclusive essays, or start a paid newsletter. Your words are worth more than likes.",
      image: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
      icon: "✍️"
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'var(--font-geist-sans)', overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        :root { --padding-x: 24px; }
        @media (min-width: 1024px) { :root { --padding-x: 96px; } } /* Wider padding for desktop like Patreon */
        
        .nav-container { padding: 20px var(--padding-x); }
        
        /* Hero */
        .hero-section {
          padding: 80px var(--padding-x);
          max-width: 1600px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 64px;
          align-items: center;
        }
        @media (min-width: 960px) {
          .hero-section { grid-template-columns: 1fr 1fr; padding: 120px var(--padding-x); }
        }

        .hero-headline {
            font-size: clamp(3.5rem, 6vw, 5.5rem);
            font-weight: 800;
            line-height: 1.05;
            letter-spacing: -0.03em;
            margin-bottom: 32px;
        }

        /* Tabs Section */
        .tabs-container {
            overflow-x: auto;
            display: flex;
            gap: 8px;
            padding-bottom: 16px;
            margin-bottom: 32px;
            scrollbar-width: none;
        }
        .tabs-container::-webkit-scrollbar { display: none; }
        
        .tab-btn {
            padding: 12px 24px;
            border-radius: 9999px;
            background: transparent;
            border: 1px solid rgba(255,255,255,0.2);
            color: #fff;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s;
        }
        .tab-btn.active {
            background: #fff;
            color: #000;
            border-color: #fff;
        }

        /* Content Card */
        .content-display {
            background: #111;
            border-radius: 32px;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
            display: grid;
            grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
            .content-display { grid-template-columns: 1.2fr 0.8fr; }
        }

        .cta-button {
            background: #22d3ee; /* Brand Cyan */
            color: #000;
            font-weight: 800;
            padding: 16px 32px;
            border-radius: 9999px;
            font-size: 1.1rem;
            border: none;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .cta-button:hover { transform: translateY(-2px); filter: brightness(1.1); }
        .desktop-only { display: none; }
        @media (min-width: 768px) { .desktop-only { display: block !important; } }
      `}} />

      {/* Navigation - Strict Patreon Layout */}
      <nav className="nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#000', zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => router.push('/')}>
          {/* Logo Mark */}
          <div style={{ width: '24px', height: '24px', background: '#22d3ee', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Backr</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Search removed as requested for homepage */}
          <div className="desktop-only" style={{ display: 'none' }}>
            <span onClick={() => router.push('/explore')} style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }}>Find Creators</span>
          </div>
          <span onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }}>Log In</span>
          <Button
            onClick={() => router.push('/dashboard')}
            style={{ borderRadius: '9999px', padding: '10px 24px', background: '#fff', color: '#000', fontWeight: 'bold', border: 'none' }}
          >
            Start Page
          </Button>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          {/* Left: Text */}
          <div>
            <h1 className="hero-headline">
              Creativity over <br />
              <span style={{ color: '#22d3ee' }}>algorithms.</span>
            </h1>
            <p style={{ fontSize: '1.25rem', lineHeight: '1.6', color: '#a1a1aa', maxWidth: '540px', marginBottom: '48px' }}>
              You don't need to go viral to make a living. Build a direct relationship with your biggest fans and get paid for your best work, on your own terms.
            </p>
            <button className="cta-button" onClick={() => router.push('/dashboard')}>
              Create on Backr
            </button>
          </div>

          {/* Right: Abstract Dynamic Visual */}
          <div style={{ position: 'relative', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              position: 'absolute', width: '100%', height: '100%',
              background: 'radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.2) 0%, transparent 70%)',
              filter: 'blur(80px)'
            }}></div>

            {/* Floating Mockups */}
            <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
              <Card style={{
                position: 'absolute', top: '10%', right: '10%', width: '260px',
                background: '#1a1a1a', border: '1px solid #333', padding: '20px',
                transform: 'rotate(6deg)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ff0055' }}></div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Sarah Draws</div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Visual Artist</div>
                  </div>
                </div>
                <div style={{ height: '120px', background: '#333', borderRadius: '12px', marginBottom: '12px' }}></div>
                <div style={{ fontSize: '0.9rem' }}>✨ New sketch pack active!</div>
              </Card>

              <Card style={{
                position: 'absolute', bottom: '10%', left: '5%', width: '280px',
                background: '#1a1a1a', border: '1px solid #333', padding: '20px',
                transform: 'rotate(-4deg)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 2
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#00ffaa' }}></div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Tech Talk</div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Podcaster</div>
                  </div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</div>
                  <span>Bonus Episode #42</span>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Who Uses Section - Interactive */}
        <section style={{ padding: '100px var(--padding-x)', background: '#0a0a0a', borderTop: '1px solid #222' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '48px', textAlign: 'center' }}>Who uses Backr?</h2>

          <div className="tabs-container" style={{ justifyContent: 'center' }}>
            {Object.keys(tabContent).map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="content-display" style={{ maxWidth: '1200px', margin: '0 auto', transition: 'all 0.3s ease' }}>
            {/* Visual Side */}
            <div style={{ background: tabContent[activeTab].image, minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '6rem' }}>{tabContent[activeTab].icon}</span>
            </div>

            {/* Text Side */}
            <div style={{ padding: '64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '24px', lineHeight: 1.1 }}>{tabContent[activeTab].headline}</h3>
              <p style={{ fontSize: '1.2rem', color: '#ccc', lineHeight: '1.6', marginBottom: '32px' }}>{tabContent[activeTab].text}</p>
              <div style={{ fontWeight: 'bold', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                See {activeTab} on Backr <span>→</span>
              </div>
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section style={{ padding: '120px var(--padding-x)', background: '#000' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#eb0000' }}>0%</span> Platform Fees needed?
              </h3>
              <p style={{ color: '#888', lineHeight: '1.6' }}>
                We only make money when you do, and even then, it's minimal. Keep up to 98% of your earnings with direct crypto payouts.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>Complete ownership</h3>
              <p style={{ color: '#888', lineHeight: '1.6' }}>
                Take your audience with you. Download your subscriber list at any time. You own the relationship, not us.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>Censorship resistant</h3>
              <p style={{ color: '#888', lineHeight: '1.6' }}>
                Built on the Mantle blockchain. No arbitrary bans, no shadowbanning. Your content stays up as long as you say so.
              </p>
            </div>
          </div>
        </section>

      </main>

      <footer style={{ padding: '64px var(--padding-x)', borderTop: '1px solid #222', background: '#0a0a0a' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px' }}>Ready to start?</h2>
          <button className="cta-button" onClick={() => router.push('/dashboard')}>
            Create your page
          </button>
        </div>
      </footer>

    </div>
  );
}
