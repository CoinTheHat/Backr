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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-geist-sans)' }}>
      {/* Navbar - Reference Match */}
      <nav style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', letterSpacing: '-0.02em' }}>Kinship</h1>
          <div style={{ display: 'flex', gap: '32px', fontSize: '0.95rem', color: '#a1a1aa', fontWeight: '500' }}>
            <span onClick={() => router.push('/explore')} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}>Explore</span>
            <span onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}>How it Works</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}>Featured</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}>Pricing</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Search Button */}
          <button style={{ background: 'transparent', border: 'none', color: '#a1a1aa', fontSize: '1.25rem', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <WalletButton />
        </div>
      </nav>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '60px', padding: '0 24px', position: 'relative' }}>

        {/* Hero Section */}
        <div style={{ maxWidth: '900px', textAlign: 'center', marginBottom: '120px', position: 'relative', zIndex: 2 }}>
          {/* Glow behind text */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '300px', background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: -1 }}></div>

          <h2 style={{ fontSize: '5.5rem', fontWeight: '800', lineHeight: '1.05', marginBottom: '32px', letterSpacing: '-0.04em', color: '#fff' }}>
            Support Creators.<br />
            <span style={{ background: 'linear-gradient(to right, #c084fc, #2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Directly. On-Chain.</span>
          </h2>
          <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '56px', maxWidth: '600px', margin: '0 auto 56px', lineHeight: '1.6' }}>
            The Web3 membership platform for communities that value transparency, ownership, and culture over speculation. Built on Mantle.
          </p>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
            <Button onClick={() => router.push('/explore')} variant="primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
              Explore Creators
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="secondary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
              Start Creating
            </Button>
          </div>
          <p style={{ marginTop: '24px', fontSize: '0.875rem', color: '#64748b' }}>Payments settle on Mantle • Withdraw anytime • No platform lock-in</p>
        </div>

        {/* How It Works - Visual Reference Match */}
        <div id="how-it-works" style={{ width: '100%', maxWidth: '1200px', marginBottom: '140px', position: 'relative' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', color: '#fff' }}>How it Works</h2>
          <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '80px' }}>Join these top creators building communities on Mantle.</p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', paddingTop: '40px' }}>
            {/* Connecting Line */}
            <div style={{ position: 'absolute', top: '75px', left: '150px', right: '150px', height: '2px', background: 'linear-gradient(90deg, rgba(139,92,246,0.5), rgba(45,212,191,0.5))', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', top: '75px', left: '150px', right: '150px', height: '2px', background: 'linear-gradient(90deg, #8b5cf6, #2dd4bf)', filter: 'blur(4px)', zIndex: 0, opacity: 0.6 }}></div>

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

        <footer style={{ padding: '60px', textAlign: 'center', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p>&copy; 2026 Kinship. Built on Mantle.</p>
        </footer>
    </div>
  );
}
