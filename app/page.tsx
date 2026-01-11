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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-geist-sans)' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @media (max-width: 768px) {
          .nav-container { 
            padding: 16px !important; 
            flex-direction: column; 
            gap: 20px; 
            align-items: center !important;
          }
          .nav-container > div {
             width: 100%;
             justify-content: center;
          }
          .hero-title { 
            fontSize: 3rem !important; 
            line-height: 1.1 !important;
            word-wrap: break-word;
          }
          .hero-desc { 
            fontSize: 1rem !important; 
            padding: 0 16px;
          }
          .steps-container { 
            flex-direction: column; 
            align-items: center; 
            gap: 40px !important; 
          }
          .desktop-only { display: none !important; }
          .hide-mobile { display: none !important; }
          .nav-links { display: none !important; }
          
          /* Force centering and width constraints on mobile */
          main { padding: 0 16px !important; overflow-x: hidden; }
          main > div { max-width: 100% !important; }
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}} />

      {/* Navbar - Reference Match */}
      <nav className="nav-container" style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #22d3ee, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em', textShadow: '0 0 10px rgba(34, 211, 238, 0.5)' }}>Kinship</h1>
          <div className="nav-links" style={{ display: 'flex', gap: '32px', fontSize: '0.95rem', color: '#a1a1aa', fontWeight: '500' }}>
            <span onClick={() => router.push('/explore')} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}>Explore</span>
            <span onClick={() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}>Featured</span>
            <span onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}>How it Works</span>
            <span onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}>Pricing</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Search Component */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            {isSearchOpen && (
              <input
                autoFocus
                type="text"
                placeholder="Search creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
                  }
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
                if (isSearchOpen && searchQuery) {
                  router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
                } else {
                  setIsSearchOpen(!isSearchOpen);
                }
              }}
              style={{ background: 'transparent', border: 'none', color: '#a1a1aa', fontSize: '1.25rem', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}
              aria-label="Search"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          <WalletButton />
        </div>
      </nav>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '60px', padding: '0 24px', position: 'relative' }}>

        {/* Hero Section */}
        <div style={{ maxWidth: '1000px', textAlign: 'center', marginBottom: '120px', position: 'relative', zIndex: 2 }}>
          {/* Glow behind text */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: '800px', height: '400px', background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: -1 }}></div>

          <h2 className="hero-title" style={{ fontSize: '6rem', fontWeight: '900', lineHeight: '1', marginBottom: '40px', letterSpacing: '-0.04em', color: '#fff', textShadow: '0 0 40px rgba(139,92,246,0.3)' }}>
            Support Creators.<br />
            <span style={{
              background: 'linear-gradient(to right, #c084fc, #6366f1, #2dd4bf)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% 200%',
              animation: 'gradientMove 5s ease infinite'
            }}>Directly. On-Chain.</span>
          </h2>

          <p className="hero-desc" style={{ fontSize: '1.5rem', color: '#cbd5e1', marginBottom: '56px', maxWidth: '750px', margin: '0 auto 56px', lineHeight: '1.6', fontWeight: '400' }}>
            The Web3 membership platform for communities that value <strong style={{ color: '#fff' }}>transparency</strong>, <strong style={{ color: '#fff' }}>ownership</strong>, and <strong style={{ color: '#fff' }}>culture</strong> over speculation. <span style={{ opacity: 0.8 }}>Built on Mantle.</span>
          </p>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <Button onClick={() => router.push('/explore')} variant="primary" style={{ padding: '16px 40px', fontSize: '1.1rem', borderRadius: '24px' }}>
              Explore Creators
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="secondary" style={{ padding: '16px 40px', fontSize: '1.1rem', borderRadius: '24px' }}>
              Start Creating
            </Button>
          </div>
          <p style={{ marginTop: '24px', fontSize: '0.875rem', color: '#64748b' }}>Payments settle on Mantle • Withdraw anytime • No platform lock-in</p>
        </div>

        {/* How It Works - Visual Reference Match (Moved Up) */}
        <div id="how-it-works" style={{ width: '100%', maxWidth: '1400px', marginBottom: '140px', position: 'relative' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', color: '#fff' }}>How it Works</h2>
          <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '80px' }}>Join these top creators building communities on Mantle.</p>

          <div className="steps-container" style={{ display: 'flex', justifyContent: 'center', gap: '48px', alignItems: 'flex-start', position: 'relative', paddingTop: '40px', flexWrap: 'wrap' }}>
            {/* Connecting Line (Hidden on mobile) */}
            <div className="desktop-only" style={{ position: 'absolute', top: '75px', left: '20%', right: '20%', height: '2px', background: 'linear-gradient(90deg, rgba(139,92,246,0.5), rgba(45,212,191,0.5))', zIndex: 0 }}></div>

            {/* Step 1 */}
            <div style={{ width: '280px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '70px', height: '70px', margin: '0 auto 24px', background: '#1e293b', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 0 20px rgba(139,92,246,0.2)' }}>
                🛠️
              </div>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>Create Tier</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Set prices & perks in minutes.</p>
            </div>

            {/* Step 2 */}
            <div style={{ width: '280px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '70px', height: '70px', margin: '0 auto 24px', background: '#1e293b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 0 30px rgba(255,255,255,0.1)' }}>
                ⛓️
              </div>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>Fans Join on Mantle</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Approve + Pay (MNT or USDC)</p>
            </div>

            {/* Step 3 */}
            <div style={{ width: '280px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '70px', height: '70px', margin: '0 auto 24px', background: '#1e293b', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', border: '1px solid rgba(45,212,191,0.3)', boxShadow: '0 0 20px rgba(45,212,191,0.2)' }}>
                🔓
              </div>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>Exclusive Content Unlocks</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Instant access verified on-chain.</p>
            </div>
          </div>
        </div>

        {/* Featured Section (With Real Data) */}
        <div id="featured" style={{ width: '100%', maxWidth: '1400px', marginBottom: '140px', position: 'relative' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '48px', color: '#fff' }}>Featured Creators</h2>

          {featuredCreators.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
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
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '24px', color: '#fff' }}>Simple, Transparent Pricing</h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '56px', maxWidth: '600px', margin: '0 auto 56px' }}>
            We believe creators should keep what they earn. Kinship takes 0% platform fees during our beta.
          </p>

          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Card variant="glass" style={{ flex: 1, maxWidth: '350px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px', color: '#94a3b8' }}>Platform Fee</h3>
              <p style={{ fontSize: '4rem', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>0%</p>
              <p style={{ color: '#94a3b8' }}>We only make money if you do.<br />(Future protocol fee: 2%)</p>
            </Card>
            <Card variant="neon-blue" style={{ flex: 1, maxWidth: '350px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px', color: '#fff' }}>Gas Fees</h3>
              <p style={{ fontSize: '4rem', fontWeight: '800', color: '#fff', marginBottom: '16px', textShadow: '0 0 20px rgba(76,201,240,0.5)' }}>~$0.01</p>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Powered by Mantle Network's<br />ultra-low transaction costs.</p>
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
