'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import CreatorCollage from './components/CreatorCollage';
import ExclusiveContentMockup from './components/ExclusiveContentMockup';
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
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden font-sans">

      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-dot-pattern opacity-50" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-motif-light opacity-60" />

      {/* ---------------------------------------------------------------------------
         NAVIGATION
         --------------------------------------------------------------------------- */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 h-[72px] flex items-center transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-100' : 'bg-transparent'
          }`}>
        <div className="page-container flex justify-between items-center w-full">
          {/* Logo */}
          <div onClick={() => router.push('/')} className="font-serif text-2xl font-bold cursor-pointer tracking-tight">
            Backr
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-8 items-center">
            <span onClick={() => router.push('/explore')} className="cursor-pointer font-medium text-gray-600 hover:text-black transition-colors">Find Creators</span>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }} className="cursor-pointer font-medium text-gray-600 hover:text-black transition-colors">How it Works</a>
            <button className="btn-primary" onClick={() => router.push('/dashboard')}>Get Started</button>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden p-2 text-2xl cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? '✕' : '☰'}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed top-[72px] inset-x-0 bg-white border-b border-gray-100 p-6 z-40 animate-slide-down shadow-lg md:hidden">
          <div className="flex flex-col gap-5 text-lg font-semibold">
            <div onClick={() => router.push('/explore')}>Find Creators</div>
            <div onClick={() => { setMobileMenuOpen(false); document.getElementById('how-it-works')?.scrollIntoView(); }}>How it Works</div>
            <div className="pt-4 border-t border-gray-100">
              <button className="btn-primary w-full justify-center" onClick={() => router.push('/dashboard')}>Get Started</button>
            </div>
          </div>
        </div>
      )}

      <main className="relative pt-[72px]">

        {/* SECTION 1: HERO (Bento Style) */}
        <section className="relative min-h-[85vh] flex items-center pt-10 pb-20 overflow-hidden">
          <div className="page-container grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* LEFT COLUMN: Editorial Copy */}
            <div className="flex flex-col items-start z-10 text-center lg:text-left mx-auto lg:mx-0 max-w-xl lg:max-w-none">

              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50/80 rounded-full mb-8 self-center lg:self-start border border-blue-100 backdrop-blur-sm">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Built on Mantle</span>
              </div>

              <h1 className="text-display mb-6 text-gray-900 leading-[1.1]">
                Unlock your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 font-serif italic pr-2">creative potential</span>
              </h1>

              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                The all-in-one platform for creators to build community, share exclusive content, and earn directly from fans without the middleman.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-12">
                <button className="btn-primary px-8 py-4 text-lg w-full sm:w-auto justify-center" onClick={() => router.push('/dashboard')}>
                  Create on Backr
                </button>
                <button className="btn-secondary px-8 py-4 text-lg w-full sm:w-auto justify-center" onClick={() => router.push('/explore')}>
                  Find Creators
                </button>
              </div>

              <div className="flex gap-6 text-sm text-gray-500 font-medium justify-center lg:justify-start w-full">
                <span className="flex items-center gap-2">🛡️ Data Ownership</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="flex items-center gap-2">⚡ Instant Payouts</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="flex items-center gap-2">💎 5% Flat Fee</span>
              </div>
            </div>

            {/* RIGHT COLUMN: Creator Collage (Desktop Only for Full Effect) */}
            <div className="hidden lg:block relative h-[650px] w-full">
              <CreatorCollage />
            </div>

            {/* Mobile Visual Fallback */}
            <div className="lg:hidden w-full relative h-[400px] mt-8 bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 shadow-inner">
              <img src="/images/home_visuals/creator1.png" className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Mobile Hero" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </div>

          </div>

          {/* Scroll Cue */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 13l5 5 5-5M7 6l5 5 5-5" /></svg>
          </div>
        </section>


        {/* SECTION 2: HOW IT WORKS (Refined) */}
        <section id="how-it-works" className="py-24 bg-white relative">
          <div className="page-container">
            <Reveal>
              <div className="text-center mb-16">
                <h2 className="text-h2 font-serif mb-4">How it works</h2>
                <p className="text-body text-gray-500 max-w-lg mx-auto">
                  Start building your membership business in three simple steps.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { icon: '🎨', title: 'Create your page', desc: 'Customize your creator profile, set up membership tiers, and define your brand.' },
                { icon: '🔒', title: 'Share content', desc: 'Post behind-the-scenes updates, early access work, and member-only media.' },
                { icon: '💸', title: 'Get paid instantly', desc: 'Receive support directly in crypto with low fees and instant settlements.' }
              ].map((step, i) => (
                <Reveal key={i} delay={(i + 1) * 100}>
                  <div className="group p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-start relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-gray-50 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-0 md:opacity-0" />

                    <div className="text-4xl mb-6 bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 group-hover:scale-110 transition-all duration-300">{step.icon}</div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 z-10">{step.title}</h3>
                    <p className="text-gray-500 leading-relaxed z-10">{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-16 text-center">
              <button className="btn-secondary px-8 py-3 rounded-full hover:bg-gray-50" onClick={() => router.push('/dashboard')}>
                Start your page now →
              </button>
            </div>
          </div>
        </section>


        {/* BRIDGE SECTION: Visual Connector */}
        <section className="py-16 bg-gradient-to-b from-white to-gray-50 overflow-hidden relative">
          <div className="page-container flex flex-col items-center">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8">Trusted by creators</p>

            {/* Creator Avatars Strip */}
            <div className="flex -space-x-4 mb-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={`w-12 h-12 rounded-full border-4 border-white bg-gray-200 bg-cover bg-center shadow-md`} style={{ backgroundImage: `url(https://i.pravatar.cc/150?u=${i + 20})` }} />
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shadow-md transform translate-x-1">
                +2k
              </div>
            </div>
            <p className="text-gray-500 text-sm">Join thousands growing on Backr</p>
          </div>
        </section>

        <div className="separator-fade-to-dark" />


        {/* SECTION 3: FEES & FEATURES (Dark Mode) */}
        <section className="py-32 bg-gray-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1f2937_0%,_#111827_60%)]" />

          <div className="page-container relative z-10">
            <Reveal>
              <div className="text-center mb-20">
                <h2 className="text-4xl md:text-6xl font-serif font-medium mb-6">
                  Creators set the price.<br />
                  <span className="text-blue-500">We take a simple fee.</span>
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                  You choose your tier prices. Backr only charges a transparent platform fee per successful transaction. No monthly subscription.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 max-w-5xl mx-auto">

              {/* Card 1 */}
              <Reveal delay={100}>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 h-full hover:bg-white/10 transition-colors">
                  <h3 className="text-2xl font-bold mb-4">You Control Pricing</h3>
                  <p className="text-gray-400 mb-6">Set tiers from free to VIP. Monthly or one-time.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">5 MNT</span>
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">20 MNT</span>
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">100 MNT</span>
                  </div>
                </div>
              </Reveal>

              {/* Card 2 (Highlight) */}
              <Reveal delay={200}>
                <div className="bg-blue-600 rounded-3xl p-8 h-full transform scale-105 shadow-2xl relative border border-white/20">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-bold shadow-lg">FAIR PLAY</div>
                  <h3 className="text-2xl font-bold mb-2">Platform Fee</h3>
                  <div className="text-6xl font-bold mb-4">5%</div>
                  <p className="text-blue-100 text-sm mb-6">Only when you get paid.</p>
                  <ul className="space-y-3 text-sm">
                    <li className="flex gap-2 items-center"><span className="text-blue-200">✓</span> No monthly costs</li>
                    <li className="flex gap-2 items-center"><span className="text-blue-200">✓</span> No hidden charges</li>
                    <li className="flex gap-2 items-center"><span className="text-blue-200">✓</span> Includes all features</li>
                  </ul>
                </div>
              </Reveal>

              {/* Card 3 */}
              <Reveal delay={300}>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 h-full hover:bg-white/10 transition-colors">
                  <h3 className="text-2xl font-bold mb-4">Instant Payouts</h3>
                  <p className="text-gray-400 mb-6">Funds settle directly to your wallet on Mantle Network.</p>
                  <div className="text-3xl mb-2">⚡</div>
                  <p className="text-xs text-gray-500">Processing time depends on network status.</p>
                </div>
              </Reveal>

            </div>

            {/* Comparison Table (Simplified) */}
            <div className="max-w-3xl mx-auto bg-white/5 border border-white/5 rounded-2xl p-8 md:p-12">
              <h3 className="text-center font-bold text-xl mb-8">Compare to Traditional Platforms</h3>
              <div className="grid grid-cols-3 gap-4 text-sm md:text-base border-b border-white/10 pb-4 mb-4 text-gray-400 font-medium">
                <div></div>
                <div className="text-center text-white">Backr</div>
                <div className="text-center opacity-50">Others</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center py-3 border-b border-white/5">
                <div className="text-gray-300">Total Fee</div>
                <div className="text-center text-emerald-400 font-bold">5%</div>
                <div className="text-center text-gray-500">8% - 12% +</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center py-3 border-b border-white/5">
                <div className="text-gray-300">Payouts</div>
                <div className="text-center text-white font-bold">Instant</div>
                <div className="text-center text-gray-500">Monthly</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center py-3">
                <div className="text-gray-300">Censorship</div>
                <div className="text-center text-white font-bold">Resistant</div>
                <div className="text-center text-gray-500">Risky</div>
              </div>
            </div>

          </div>
        </section>

        <div className="separator-fade-to-light" />


        {/* FOOTER (Integrated Newsletter) */}
        <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
          <div className="page-container">

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

              {/* Brand & Newsletter Column */}
              <div className="md:col-span-5">
                <div className="font-serif text-3xl font-bold mb-6">Backr</div>
                <p className="text-gray-500 mb-8 max-w-sm">
                  Empowering creators with true ownership and decentralized monetization on Mantle Network.
                </p>

                {/* Inline Newsletter */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 max-w-md">
                  <h4 className="font-bold text-gray-900 mb-2">Stay in the loop</h4>
                  <p className="text-sm text-gray-500 mb-4">Product updates and creator tips.</p>
                  <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed!'); }} className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter email"
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                    <button type="submit" className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                      Join
                    </button>
                  </form>
                </div>
              </div>

              {/* Links Columns */}
              <div className="md:col-span-7 flex flex-wrap gap-12 md:justify-end">
                <div className="flex flex-col gap-4">
                  <strong className="text-gray-900">Product</strong>
                  <a href="#" className="text-gray-500 hover:text-black transition-colors">Features</a>
                  <a href="#" className="text-gray-500 hover:text-black transition-colors">Pricing</a>
                  <a href="#" className="text-gray-500 hover:text-black transition-colors">Showcase</a>
                </div>
                <div className="flex flex-col gap-4">
                  <strong className="text-gray-900">Resources</strong>
                  <a href="#" className="text-gray-500 hover:text-black transition-colors">Documentation</a>
                  <a href="#" className="text-gray-500 hover:text-black transition-colors">Help Center</a>
                  <a href="#" className="text-gray-500 hover:text-black transition-colors">Brand Assets</a>
                </div>
                <div className="flex flex-col gap-4">
                  <strong className="text-gray-900">Legal</strong>
                  <a href="#" className="text-gray-500 hover:text-black transition-colors">Privacy</a>
                  <a href="#" className="text-gray-500 hover:text-black transition-colors">Terms</a>
                </div>
              </div>

            </div>

            <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
              <p>© 2024 Backr. All rights reserved.</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Systems Operational</span>
              </div>
            </div>

          </div>
        </footer>

      </main>
    </div>
  );
}
