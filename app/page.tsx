'use client';
import Button from "./components/Button";
import Card from "./components/Card";
import WalletButton from "./components/WalletButton";
import { useRouter } from "next/navigation";
import { useAccount, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export default function Home() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  const [featuredCreators, setFeaturedCreators] = require('react').useState([]);
  const [isSearchOpen, setIsSearchOpen] = require('react').useState(false);
  const [searchQuery, setSearchQuery] = require('react').useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = require('react').useState(false);

  require('react').useEffect(() => {
    // Fetch top 3 featured creators
    fetch('/api/creators')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFeaturedCreators(data.slice(0, 3));
        }
      })
      .catch(err => console.error("Failed to fetch featured creators", err));
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-geist-sans)', overflowX: 'hidden', background: '#0f1115', color: '#fff' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        :root { --padding-x: 24px; }
        @media (min-width: 1024px) { :root { --padding-x: 64px; } }
        
        .nav-container { padding: 16px var(--padding-x); }
        
        /* Hero Grid */
        .hero-section {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
          padding: 60px var(--padding-x);
          max-width: 1400px;
          margin: 0 auto;
          align-items: center;
        }
        
        @media (min-width: 960px) {
          .hero-section { grid-template-columns: 1fr 1fr; padding: 100px var(--padding-x); }
        }

        .hero-title {
          font-size: clamp(3rem, 5vw, 4.5rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 24px;
        }

        /* Pills */
        .category-pills {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 8px var(--padding-x);
          scrollbar-width: none;
          margin-bottom: 60px;
          justify-content: flex-start;
        }
        .category-pills::-webkit-scrollbar { display: none; }
        
        @media (min-width: 768px) {
            .category-pills { justify-content: center; }
        }

        .pill {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 10px 24px;
          border-radius: 9999px;
          font-size: 0.95rem;
          font-weight: 600;
          color: #a1a1aa;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pill:hover { background: #fff; color: #000; border-color: #fff; }

        /* Value Props */
        .value-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          padding: 80px var(--padding-x);
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (min-width: 768px) { .value-grid { grid-template-columns: repeat(3, 1fr); } }

        .desktop-only { display: none; }
        @media (min-width: 768px) { .desktop-only { display: block; } }
      `}} />

      {/* Navbar (Patreon Style) */}
      <nav className="nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, background: '#0f1115', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #22d3ee, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em', cursor: 'pointer' }} onClick={() => router.push('/')}>Backr</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Search Pill */}
          <div className="desktop-only" style={{ position: 'relative' }}>
            <div style={{ background: '#1a1d24', borderRadius: '24px', padding: '8px 16px', display: 'flex', alignItems: 'center', width: '240px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ marginRight: '8px', opacity: 0.5 }}>🔍</span>
              <input
                placeholder="Find a creator"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && router.push(`/explore?q=${searchQuery}`)}
                style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <Button variant="secondary" onClick={() => router.push('/dashboard')} className="desktop-only" style={{ borderRadius: '24px', padding: '10px 24px', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.1)' }}>Create on Backr</Button>
          <WalletButton />
        </div>
      </nav>

      <main style={{ flex: 1 }}>

        {/* Hero Section (Split) */}
        <div className="hero-section">
          {/* Left Content */}
          <div style={{ textAlign: 'left' }}>
            <h2 className="hero-title">
              Creativity powered by <br />
              <span style={{ color: '#22d3ee' }}>ownership.</span>
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#a1a1aa', maxWidth: '500px', lineHeight: '1.6', marginBottom: '40px' }}>
              The membership platform for the new creative economy. Direct relationships, zero censorship, and instant on-chain payouts.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Button variant="primary" onClick={() => router.push('/dashboard')} style={{ padding: '16px 40px', borderRadius: '32px', fontSize: '1.1rem', fontWeight: 'bold' }}>Get Started</Button>
              <Button variant="secondary" onClick={() => router.push('/explore')} style={{ padding: '16px 32px', borderRadius: '32px', fontSize: '1.1rem' }}>Find Creators</Button>
            </div>
          </div>

          {/* Right Visual (Mock Phone/Card) */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            {/* Abstract Bloom */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }}></div>

            {/* Card UI */}
            <Card variant="glass" style={{ width: '100%', maxWidth: '380px', padding: '0', borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', zIndex: 1, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
              <div style={{ height: '140px', background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)' }}></div>
              <div style={{ padding: '24px', marginTop: '-40px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#000', border: '4px solid #1a1d24', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🎨</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '4px' }}>Digital Art Collective</h3>
                <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '24px' }}>Creating next-gen assets for the metaverse.</p>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>1.2k</div>
                    <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Backrs</div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>$45k</div>
                    <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Earnings</div>
                  </div>
                </div>

                <Button style={{ width: '100%', borderRadius: '16px', background: '#fff', color: '#000' }}>Join for 5 MNT/mo</Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Category Pills */}
        <div className="category-pills">
          {['Podcasters', 'Video Creators', 'Musicians', 'Visual Artists', 'Writers', 'Gaming', 'Education', 'Non-profits'].map(cat => (
            <button key={cat} className="pill" onClick={() => router.push(`/explore?cat=${cat}`)}>{cat}</button>
          ))}
        </div>

        {/* Value Props Section (Patreon Mimic) */}
        <div style={{ background: '#1a1d24', padding: '100px 0' }}>
          <div className="value-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(34,211,238,0.1)', color: '#22d3ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>💸</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Predictable revenue</h3>
              <p style={{ color: '#a1a1aa', lineHeight: '1.6' }}>Unlock a stable income stream directly from your biggest fans. No algorithm changes, no demonetization scares.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🔗</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Direct connection</h3>
              <p style={{ color: '#a1a1aa', lineHeight: '1.6' }}>You own the relationship. Communicate directly with your community via encrypted messaging and token-gated posts.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(45,212,191,0.1)', color: '#2dd4bf', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🛡️</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Censorship resistance</h3>
              <p style={{ color: '#a1a1aa', lineHeight: '1.6' }}>Your content, your rules. Built on Mantle Network, ensuring your platform can never be taken down by a centralized authority.</p>
            </div>
          </div>
        </div>

        {/* Featured Section */}
        <div style={{ padding: '100px var(--padding-x)', maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '48px' }}>Featured on Backr</h2>

          {featuredCreators.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
              {featuredCreators.map((creator: any) => (
                <div key={creator.id} onClick={() => router.push(`/${creator.address}`)} style={{ cursor: 'pointer' }}>
                  <div style={{ position: 'relative', height: '240px', borderRadius: '24px', overflow: 'hidden', marginBottom: '16px' }}>
                    {/* Cover mock */}
                    <div style={{ width: '100%', height: '100%', background: creator.avatarUrl ? `url(${creator.avatarUrl}) center/cover` : 'linear-gradient(45deg, #1a1d24, #2e333d)' }}></div>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{creator.name || 'Unnamed'}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#52525b', border: '1px dashed #27272a', borderRadius: '24px' }}>No featured creators yet.</div>
          )}
        </div>

      </main>

      <footer style={{ padding: '64px var(--padding-x)', background: '#000', borderTop: '1px solid #1a1d24' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '48px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>Backr</h2>
            <p style={{ color: '#a1a1aa', maxWidth: '300px' }}>The Web3 standard for creative membership.</p>
          </div>
          <div style={{ display: 'flex', gap: '64px', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ fontWeight: 'bold', marginBottom: '16px' }}>Product</h4>
              <p style={{ color: '#a1a1aa', marginBottom: '8px', cursor: 'pointer' }}>Pricing</p>
              <p style={{ color: '#a1a1aa', marginBottom: '8px', cursor: 'pointer' }}>Features</p>
            </div>
            <div>
              <h4 style={{ fontWeight: 'bold', marginBottom: '16px' }}>Company</h4>
              <p style={{ color: '#a1a1aa', marginBottom: '8px', cursor: 'pointer' }}>About</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
