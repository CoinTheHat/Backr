'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Palette, Lock, Zap, ShieldCheck, DollarSign, Wallet, PlayCircle, BarChart3, Users } from 'lucide-react';
import CreatorCollage from './components/CreatorCollage';
import { Reveal } from './hooks/useScrollReveal';

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
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden font-sans selection:bg-purple-200">

      {/* Background Decor (Persistent) */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-dot-pattern opacity-30 mix-blend-multiply" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-motif-grain opacity-40 mix-blend-overlay" />

      {/* ---------------------------------------------------------------------------
         NAVIGATION
         --------------------------------------------------------------------------- */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 h-[72px] flex items-center transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-purple-100 shadow-sm' : 'bg-transparent'
          }`}>
        <div className="page-container flex justify-between items-center w-full">
          <div onClick={() => router.push('/')} className="font-serif text-2xl font-bold cursor-pointer tracking-tight text-gray-900">
            Backr
          </div>

          <div className="hidden md:flex gap-8 items-center">
            <span onClick={() => router.push('/explore')} className="cursor-pointer font-medium text-gray-600 hover:text-purple-600 transition-colors">Discover Creators</span>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }} className="cursor-pointer font-medium text-gray-600 hover:text-purple-600 transition-colors">How it Works</a>
            <button className="px-6 py-2.5 rounded-full bg-gray-900 text-white font-medium hover:bg-black transition-colors" onClick={() => router.push('/dashboard')}>
              Sign In
            </button>
          </div>

          <button className="md:hidden p-2 text-2xl focus:outline-none" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed top-[72px] inset-x-0 bg-white border-b border-gray-100 p-6 z-40 animate-slide-down shadow-lg md:hidden">
          <div className="flex flex-col gap-5 text-lg font-semibold">
            <div onClick={() => router.push('/explore')}>Discover Creators</div>
            <div onClick={() => { setMobileMenuOpen(false); document.getElementById('how-it-works')?.scrollIntoView(); }}>How it Works</div>
            <div className="pt-4 border-t border-gray-100">
              <button className="btn-primary w-full justify-center" onClick={() => router.push('/dashboard')}>Get Started</button>
            </div>
          </div>
        </div>
      )}

      <main className="relative pt-[72px]">

        {/* SECTION 1: HERO (Cosmic Light) */}
        <section className="relative min-h-[90vh] flex items-center pb-32 overflow-hidden">
          {/* Top Gradient Blur */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200 rounded-full blur-[100px] opacity-40 -z-10 translate-x-1/2 -translate-y-1/2" />

          <div className="page-container grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* LEFT COLUMN: 5 cols */}
            <div className="lg:col-span-5 flex flex-col items-start z-10 text-center lg:text-left mx-auto lg:mx-0">

              <h1 className="text-[3.5rem] lg:text-[4.5rem] font-bold text-gray-900 leading-[1.05] tracking-tight mb-6">
                Empower <br />
                Your <span className="text-gradient-cosmic">Creativity</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed font-medium max-w-md mx-auto lg:mx-0">
                Build a thriving community and earn directly from your fans. All on Mantle, with no middleman.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10">
                <button className="px-8 py-4 rounded-full bg-[#1e1b4b] text-white font-bold text-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all transform hover:-translate-y-1" onClick={() => router.push('/dashboard')}>
                  Create your page
                </button>
                <button className="px-8 py-4 rounded-full bg-white border border-gray-200 text-gray-900 font-bold text-lg hover:bg-gray-50 transition-all" onClick={() => router.push('/explore')}>
                  Discover creators
                </button>
              </div>

              {/* Stats Strip */}
              <div className="flex items-center gap-6 text-sm font-medium bg-white/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/50 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white" />)}
                  </div>
                  <span className="text-gray-700"><strong>180k+</strong> from creators</span>
                </div>
                <div className="w-px h-4 bg-gray-300" />
                <div className="flex items-center gap-1 text-purple-700">
                  <BarChart3 size={16} />
                  <span><strong>Earnings</strong></span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: 7 cols (Collage) */}
            <div className="hidden lg:block lg:col-span-7 relative h-[700px] w-full mt-10 lg:mt-0">
              <CreatorCollage />
            </div>

            {/* Mobile Fallback */}
            <div className="lg:hidden w-full h-[400px] bg-purple-50 rounded-3xl relative overflow-hidden border border-purple-100">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-100 to-white opacity-50" />
              <img src="/images/home_visuals/creator1.png" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 rounded-t-2xl shadow-2xl" alt="Creator" />
            </div>

          </div>
        </section>


        {/* CONTINUOUS COSMIC BACKGROUND CONTAINER */}
        <div className="bg-cosmic text-white relative">

          {/* SVG Wave Divider (Transition from White to Cosmic) */}
          <div className="wave-divider-top absolute top-0 transform -translate-y-[99%] w-full pointer-events-none">
            <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff"></path>
            </svg>
          </div>

          {/* SECTION 2: FEATURES (Glass Cards on Cosmic) */}
          <section id="how-it-works" className="py-32 relative z-10">
            <div className="page-container">
              <Reveal>
                <div className="text-center mb-20">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Complete creative control</h2>
                  <p className="text-xl text-purple-200/80 max-w-2xl mx-auto">
                    Own your content, your list, and your <span className="text-white font-bold border-b-2 border-purple-400">revenue</span>.
                  </p>
                </div>
              </Reveal>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: <Palette className="text-purple-600" size={32} />, title: 'Create your page', bg: 'bg-purple-100' },
                  { icon: <Lock className="text-amber-600" size={32} />, title: 'Share exclusive content', bg: 'bg-amber-100' },
                  { icon: <Zap className="text-emerald-600" size={32} />, title: 'Get paid instantly', bg: 'bg-emerald-100' }
                ].map((item, i) => (
                  <Reveal key={i} delay={i * 100}>
                    <div className="glass-panel-light p-8 rounded-[2rem] h-full hover:transform hover:-translate-y-2 transition-transform duration-300">
                      <div className={`w-14 h-14 ${item.bg} rounded-full flex items-center justify-center mb-6`}>
                        {item.icon}
                      </div>
                      <h3 className="text-gray-900 text-2xl font-bold mb-4">{item.title}</h3>
                      <p className="text-gray-500 leading-relaxed">
                        Build a space that truly represents you. No algorithms, just your community.
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className="text-center mt-16">
                <button className="px-8 py-3 rounded-full bg-white/10 text-white font-bold border border-white/20 hover:bg-white/20 backdrop-blur-sm transition-all" onClick={() => router.push('/dashboard')}>
                  Start your page now
                </button>
                <p className="text-purple-300/60 text-xs mt-4 uppercase tracking-widest">Creators keep 95% of earnings</p>
              </div>
            </div>
          </section>

          {/* SECTION 3: FEES (Dark Glass on Cosmic) */}
          <section className="py-24 relative z-10 border-t border-white/5">
            <div className="page-container">
              <Reveal>
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4">Creators set the price.</h2>
                  <h2 className="text-3xl md:text-4xl font-light text-purple-200">We take a simple fee.</h2>
                </div>
              </Reveal>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left: Pricing Config */}
                <div className="lg:col-span-4 glass-panel-dark p-8 rounded-3xl min-h-[400px] flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-2">You set your prices</h3>
                  <p className="text-gray-400 mb-8">Set any price, anytime. Recurring or one-time.</p>

                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                        <span className="font-mono text-sm">Bronze Tier</span>
                      </div>
                      <span className="font-bold">5 MNT</span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center opacity-60">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <span className="font-mono text-sm">Silver Tier</span>
                      </div>
                      <span className="font-bold">25 MNT</span>
                    </div>
                  </div>
                </div>

                {/* Middle: Platform Fee (Highlight) */}
                <div className="lg:col-span-4 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.4)] transform scale-105 relative z-20">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <img src="/logo-white.svg" className="w-16 h-16" alt="" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-100 mb-1">Platform Fee</h3>
                  <div className="text-[6rem] font-bold leading-none mb-2 tracking-tighter">5%</div>
                  <p className="text-blue-100 mb-8 font-medium">Only on successful payments.<br />No monthly subscription.</p>

                  <div className="border-t border-white/20 pt-6 space-y-3">
                    {['Access Control', 'Memberships', 'Analytics', 'Payouts'].map((item) => (
                      <div key={item} className="flex gap-2 items-center text-sm font-semibold">
                        <span className="text-blue-200">✓</span> {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Payouts */}
                <div className="lg:col-span-4 glass-panel-dark p-8 rounded-3xl min-h-[400px] flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-2">Instant Payouts</h3>
                  <div className="text-4xl mb-6">⚡</div>
                  <ul className="space-y-4 text-gray-300">
                    <li className="flex gap-3">
                      <span className="text-emerald-400">✓</span> Direct wallet transfers
                    </li>
                    <li className="flex gap-3">
                      <span className="text-emerald-400">✓</span> Earn crypto (MNT, INT)
                    </li>
                    <li className="flex gap-3">
                      <span className="text-emerald-400">✓</span> Predictable fees
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>


        {/* FOOTER (Integrated Newsletter) */}
        <footer className="bg-[#0f172a] text-white pt-24 pb-12 border-t border-white/5">
          <div className="page-container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
              <div className="lg:col-span-2">
                <h4 className="text-3xl font-serif font-bold mb-6">Backr</h4>
                <p className="text-gray-400 max-w-sm mb-8">
                  Reimagining the creator economy on Mantle Network. True ownership, fair fees, infinite possibilities.
                </p>
                <div className="flex gap-4">
                  {/* Social placeholders */}
                  <div className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer">𝕏</div>
                  <div className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer">Discord</div>
                </div>
              </div>

              <div>
                <h5 className="font-bold mb-6">Platform</h5>
                <ul className="space-y-4 text-gray-400 text-sm">
                  <li className="hover:text-white cursor-pointer transition-colors">Features</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Pricing</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Explore</li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold mb-6">Legal</h5>
                <ul className="space-y-4 text-gray-400 text-sm">
                  <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
                </ul>
              </div>
            </div>

            <div className="text-center text-gray-600 text-sm pt-8 border-t border-white/5">
              &copy; 2024 Backr Protocol. Built on Mantle.
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
