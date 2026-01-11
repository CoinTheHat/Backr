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
        // For now just take first 3, or filter by some featured flag if we had one
        if (Array.isArray(data)) {
          setFeaturedCreators(data.slice(0, 3));
        }
      })
      .catch(err => console.error("Failed to fetch featured creators", err));
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-geist-sans)', overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        :root {
          --padding-x: 24px;
        }
        @media (min-width: 768px) {
          :root { --padding-x: 40px; }
        }
        
        .desktop-only { display: block; }
        .mobile-only { display: none; }
        .nav-links { display: flex; gap: 32px; }
        .hero-title { font-size: 6rem; line-height: 1.1; }
        .hero-cta { flex-direction: row; }
        .steps-container { flex-direction: row; gap: 48px; }
        .step-item { width: 280px; }
        .nav-container { padding: 24px var(--padding-x); }
        .feature-grid { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
        .w-full-mobile { width: auto; }
        
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: block !important; }
          .nav-links { display: none; }
          
          .nav-container { padding: 16px 20px; }
          
          /* Typography */
          .hero-title { 
            font-size: clamp(2.5rem, 12vw, 4rem) !important; 
            line-height: 1.2 !important;
            word-wrap: break-word;
          }
          
          /* Layouts */
          .hero-cta { flex-direction: column; width: 100%; gap: 16px; }
          .w-full-mobile { width: 100%; }
          
          .steps-container { flex-direction: column; align-items: center; gap: 48px !important; }
          .step-item { width: 100%; max-width: 320px; }
          
          /* Mobile Menu Overlay */
          .mobile-menu {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: #0f1115;
            z-index: 100;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 24px;
            overflow-y: auto;
            border-top: 1px solid rgba(255,255,255,0.1);
          }

          .feature-grid { grid-template-columns: 1fr; }
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}} />

      {/* Navbar */}
      <nav className="nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 50 }}>
        {/* Logo */}
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #22d3ee, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em', zIndex: 51, position: 'relative' }}>Kinship</h1>

        {/* Desktop Links */}
        <div className="nav-links desktop-only" style={{ fontSize: '0.95rem', color: '#a1a1aa', fontWeight: '500', alignItems: 'center' }}>
          <span onClick={() => router.push('/explore')} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}>Explore</span>
          <span onClick={() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}>Featured</span>
          <span onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}>How it Works</span>
          <span onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}>Pricing</span>
        </div>

        {/* Desktop Right: Search + Connect */}
        <div className="desktop-only" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Search Component (Desktop) */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            {isSearchOpen && (
              <input
                autoFocus
                type="text"
                placeholder="Search creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
                }}
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  color: '#fff',
                  outline: 'none',
                  marginRight: '8px',
                  width: '200px',
                  fontSize: '0.9rem'
                }}
              />
            )}
            <button
              onClick={() => {
                if (isSearchOpen && searchQuery) router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
                else setIsSearchOpen(!isSearchOpen);
              }}
              style={{ background: 'transparent', border: 'none', color: '#a1a1aa', fontSize: '1.25rem', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}
              aria-label="Search"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
          <WalletButton />
        </div>

        {/* Mobile Hamburger */}
        <div className="mobile-only" style={{ zIndex: 51 }}>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', padding: '8px' }}>
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <div style={{ marginTop: '60px' }}>
              <input
                type="text"
                placeholder="Search creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
                    setIsMobileMenuOpen(false); // Close menu after search
                  }
                }}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  marginBottom: '24px',
                  fontSize: '1rem'
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '1.25rem', fontWeight: 'bold', color: '#cbd5e1' }}>
                <span onClick={() => { setIsMobileMenuOpen(false); router.push('/explore'); }} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>Explore</span>
                <span onClick={() => { setIsMobileMenuOpen(false); document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>Featured</span>
                <span onClick={() => { setIsMobileMenuOpen(false); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>How it Works</span>
                <span onClick={() => { setIsMobileMenuOpen(false); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>Pricing</span>
              </div>

              <div style={{ marginTop: '48px' }}>
                <WalletButton />
              </div>
            </div>
          </div>
        )}
      </nav>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px', padding: '0 20px', position: 'relative' }}>

        {/* Hero Section */}
        <div style={{ maxWidth: '1000px', textAlign: 'center', marginBottom: '100px', position: 'relative', zIndex: 2, width: '100%' }}>
          {/* Glow */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: '800px', height: '400px', background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: -1 }}></div>

          <h2 className="hero-title" style={{ fontWeight: '900', marginBottom: '32px', letterSpacing: '-0.04em', color: '#fff', textShadow: '0 0 40px rgba(139,92,246,0.3)' }}>
            <span style={{ display: 'inline-block' }}>Support Creators.</span> <br className="desktop-only" />
            <span style={{
              background: 'linear-gradient(to right, #c084fc, #6366f1, #2dd4bf)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% 200%',
              animation: 'gradientMove 5s ease infinite',
              display: 'inline-block'
            }}>Directly. On-Chain.</span>
          </h2>

          <p className="hero-desc" style={{ fontSize: '1.25rem', color: '#cbd5e1', marginBottom: '48px', maxWidth: '750px', margin: '0 auto 48px', lineHeight: '1.6', fontWeight: '400' }}>
            The Web3 membership platform for communities that value <strong style={{ color: '#fff' }}>transparency</strong>, <strong style={{ color: '#fff' }}>ownership</strong>, and <strong style={{ color: '#fff' }}>culture</strong>.
          </p>

          <div className="hero-cta" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button onClick={() => router.push('/explore')} variant="primary" style={{ padding: '16px 40px', fontSize: '1.1rem', borderRadius: '24px', width: 'auto', textAlign: 'center' }} className="w-full-mobile">
              Explore Creators
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="secondary" style={{ padding: '16px 40px', fontSize: '1.1rem', borderRadius: '24px', width: 'auto', textAlign: 'center' }} className="w-full-mobile">
              Start Creating
            </Button>
          </div>
          <p style={{ marginTop: '24px', fontSize: '0.8rem', color: '#64748b' }}>Payments settle on Mantle • Withdraw anytime</p>
        </div>

        {/* How It Works */}
        <div id="how-it-works" style={{ width: '100%', maxWidth: '1400px', marginBottom: '120px', position: 'relative' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', color: '#fff' }}>How it Works</h2>
          <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '60px' }}>Join top creators on Mantle.</p>

          <div className="steps-container" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Connecting Line (Desktop) */}
            <div className="desktop-only" style={{ position: 'absolute', top: '75px', left: '20%', right: '20%', height: '2px', background: 'linear-gradient(90deg, rgba(139,92,246,0.5), rgba(45,212,191,0.5))', zIndex: 0 }}></div>

            {/* Step 1 */}
            <div className="step-item" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '70px', height: '70px', margin: '0 auto 24px', background: '#1e293b', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 0 20px rgba(139,92,246,0.2)' }}>🛠️</div>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>Create Tier</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Set prices & perks in minutes.</p>
            </div>

            {/* Step 2 */}
            <div className="step-item" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '70px', height: '70px', margin: '0 auto 24px', background: '#1e293b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 0 30px rgba(255,255,255,0.1)' }}>⛓️</div>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>Fans Join on Mantle</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Approve + Pay (MNT or USDC)</p>
            </div>

            {/* Step 3 */}
            <div className="step-item" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '70px', height: '70px', margin: '0 auto 24px', background: '#1e293b', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', border: '1px solid rgba(45,212,191,0.3)', boxShadow: '0 0 20px rgba(45,212,191,0.2)' }}>🔓</div>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>Exclusive Content</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Instant access verified on-chain.</p>
            </div>
          </div>
        </div>

        {/* Featured Section (With Real Data) */}
        <div id="featured" style={{ width: '100%', maxWidth: '1400px', marginBottom: '120px', position: 'relative' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '40px', color: '#fff' }}>Featured Creators</h2>

          {featuredCreators.length > 0 ? (
            <div className="feature-grid" style={{ display: 'grid', gap: '32px' }}>
              {featuredCreators.map((creator: any) => (
                <Card key={creator.id} variant="glass" style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '32px' }} onClick={() => router.push(`/${creator.address}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    {creator.avatarUrl ? (
                      <img src={creator.avatarUrl} alt={creator.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
                    ) : (
                      <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(45deg, #8b5cf6, #2dd4bf)' }}></div>
                    )}
                    <div>
                      <h4 style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fff' }}>{creator.name || 'Unnamed Creator'}</h4>
                      <p style={{ fontSize: '0.85rem', color: '#65b3ad', fontFamily: 'monospace' }}>{creator.address?.slice(0, 6)}...{creator.address?.slice(-4)}</p>
                    </div>
                  </div>
                  <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', flex: 1, marginBottom: '24px' }}>
                    {creator.description ? (creator.description.length > 100 ? creator.description.slice(0, 100) + '...' : creator.description) : 'Creating exclusive content for the Web3 community.'}
                  </p>
                  <Button variant="outline" style={{ width: '100%', justifyContent: 'center', borderRadius: '16px' }} onClick={(e: any) => {
                    e.stopPropagation();
                    router.push(`/${creator.address}`);
                  }}>View Profile</Button>
                </Card>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', background: 'rgba(255,255,255,0.02)', borderRadius: '32px' }}>
              Loading top creators...
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Button variant="secondary" onClick={() => router.push('/explore')} style={{ borderRadius: '24px' }}>View All Creators</Button>
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" style={{ width: '100%', maxWidth: '1000px', marginBottom: '100px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '24px', color: '#fff' }}>Pricing</h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
            Creator-first economics.
          </p>

          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap', flexDirection: 'row' }} className="hero-cta">
            <Card variant="glass" style={{ flex: 1, minWidth: '280px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px', color: '#94a3b8' }}>Platform Fee</h3>
              <p style={{ fontSize: '3.5rem', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>0%</p>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>We only make money if you do.</p>
            </Card>
            <Card variant="neon-blue" style={{ flex: 1, minWidth: '280px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px', color: '#fff' }}>Gas Fees</h3>
              <p style={{ fontSize: '3.5rem', fontWeight: '800', color: '#fff', marginBottom: '16px', textShadow: '0 0 20px rgba(76,201,240,0.5)' }}>~$0.01</p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Powered by Mantle Network.</p>
            </Card>
          </div>
        </div>

      </main>

      <footer style={{ padding: '60px', textAlign: 'center', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p>&copy; 2026 Kinship. Built on Mantle.</p>
      </footer>
    </div>
  );
}
