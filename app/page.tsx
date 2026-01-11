'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from "./components/Button";
import Card from "./components/Card";

export default function Home() {
  const router = useRouter();

  // Generated Visuals from Artifacts (Mocked paths that would be replaced by real URLs in prod)
  // For this environment, we use the local artifact paths if browser supported, but typically we need public URLs.
  // I will use some high quality placeholders that match the vibe since we can't serve local artifacts easily in nextjs dev server without setup.
  // Actually, I will use CSS rich backgrounds and emoji icons which are safer and performant, 
  // but I will STRUCTURE it exactly like the images I generated.

  const [activeTab, setActiveTab] = useState('Podcasters');

  const tabContent: any = {
    'Podcasters': {
      headline: "Episodes that pay.",
      text: "Give your listeners a backstage pass. Offer ad-free episodes, bonus content, and community access directly to your biggest fans.",
      image: "linear-gradient(135deg, #FF6B6B 0%, #C44569 100%)",
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
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'var(--font-geist-sans)', overflowX: 'hidden' }}>
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

        /* Hero Visuals (Floating Cards) */
        .hero-visual {
            position: absolute;
            z-index: 0;
            transition: transform 0.3s ease-out;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 20px;
            overflow: hidden;
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
            background: #fff; color: #000; 
        }
        .btn-primary:hover { transform: scale(1.05); }
        .btn-secondary { background: transparent; color: #fff; }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); }

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
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            color: #a1a1aa;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
        }
        .tab-pill:hover, .tab-pill.active {
            background: #fff;
            color: #000;
            border-color: #fff;
        }
      `}} />

      {/* Navigation (Strict Center Logo) */}
      <nav className="nav-container" style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="header-grid">
          {/* Left: Links */}
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" className="desktop-only" style={{ color: '#fff', fontWeight: '600', textDecoration: 'none' }}>Creators</a>
            <a href="#" className="desktop-only" style={{ color: '#fff', fontWeight: '600', textDecoration: 'none' }}>Pricing</a>
            <a href="#" className="desktop-only" style={{ color: '#fff', fontWeight: '600', textDecoration: 'none' }}>Resources</a>
          </div>

          {/* Center: Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }} onClick={() => router.push('/')}>
            <div style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '20px', height: '20px', background: '#000', borderRadius: '2px' }}></div>
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', alignItems: 'center' }}>
            <span onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer', fontWeight: 'bold' }}>Log In</span>
            <button
              onClick={() => router.push('/dashboard')}
              className="pill-btn btn-primary"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* CENTERED HERO SECTION */}
        <section className="hero-section">

          {/* Background Atmosphere */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '80%', height: '80%',
            background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 60%)',
            filter: 'blur(100px)', zIndex: 0
          }}></div>

          {/* Floating Visuals (Mocking the generated images) */}
          <div className="hero-visual visual-left" style={{ background: '#111' }}>
            <div style={{ height: '180px', background: 'linear-gradient(45deg, #FF0080, #7928CA)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '3rem' }}>🎙️</span>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Future Talk</div>
              <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Podcast • 12k Members</div>
            </div>
          </div>

          <div className="hero-visual visual-right" style={{ background: '#111' }}>
            <div style={{ height: '200px', background: 'url(https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=260&auto=format&fit=crop) center/cover' }}></div>
            <div style={{ padding: '16px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Neon City</div>
              <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Digital Art • 8.5k Members</div>
            </div>
          </div>

          <div className="hero-visual visual-bottom-left" style={{ background: '#111' }}>
            <div style={{ height: '140px', background: 'linear-gradient(to right, #00C9FF, #92FE9D)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '3rem' }}>🎮</span>
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Pro Gamer Tips</div>
            </div>
          </div>

          {/* Central Content */}
          <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px' }}>
            <h1 className="hero-headline">
              Complete creative <br />
              <span style={{ color: '#22d3ee' }}>control.</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#a1a1aa', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
              Join the thousands of creators on Backr who are building communities, sharing exclusive work, and getting paid directly.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button className="pill-btn btn-primary" style={{ fontSize: '1.1rem', padding: '16px 48px' }} onClick={() => router.push('/dashboard')}>
                Create on Backr
              </button>
            </div>
          </div>
        </section>

        {/* Tabbed Interactive Section */}
        <section style={{ padding: '80px var(--padding-x)', background: '#111' }}>
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
            background: '#1a1a1a', borderRadius: '32px', overflow: 'hidden',
            display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <style dangerouslySetInnerHTML={{
              __html: `
                    @media (max-width: 768px) { .content-display { grid-template-columns: 1fr !important; } }
                 `}} />

            {/* Image Side */}
            <div style={{ minHeight: '400px', background: tabContent[activeTab].image, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '8rem', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}>{tabContent[activeTab].icon}</span>
            </div>

            {/* Text Side */}
            <div style={{ padding: '64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '24px', lineHeight: 1.1 }}>{tabContent[activeTab].headline}</h3>
              <p style={{ fontSize: '1.1rem', color: '#a1a1aa', lineHeight: '1.6', marginBottom: '32px' }}>{tabContent[activeTab].text}</p>
              <div style={{ fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                See Example Page <span>→</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer style={{ padding: '80px var(--padding-x)', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px' }}>Backr</h2>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', color: '#a1a1aa', marginBottom: '48px' }}>
          <span>Terms</span>
          <span>Privacy</span>
          <span>Community Guidelines</span>
        </div>
        <p style={{ color: '#555', fontSize: '0.9rem' }}>© 2024 Backr Platform. Built on Mantle.</p>
      </footer>
    </div>
  );
}
