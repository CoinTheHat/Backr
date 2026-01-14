'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Palette, Lock, Zap, ShieldCheck, DollarSign, Wallet } from 'lucide-react';
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
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden font-sans selection:bg-teal-100">

      {/* Background Decor (Persistent) */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-dot-pattern opacity-40 mix-blend-multiply" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-motif-light opacity-60" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-motif-grain opacity-40 mix-blend-overlay" />

      {/* ---------------------------------------------------------------------------
         NAVIGATION
         --------------------------------------------------------------------------- */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 h-[72px] flex items-center transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm' : 'bg-transparent'
          }`}>
        <div className="page-container flex justify-between items-center w-full">
          {/* Logo */}
          <div onClick={() => router.push('/')} className="font-serif text-2xl font-bold cursor-pointer tracking-tight hover:opacity-80 transition-opacity">
            Backr
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-8 items-center">
            <span onClick={() => router.push('/explore')} className="cursor-pointer font-medium text-gray-600 hover:text-black transition-colors">Find Creators</span>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }} className="cursor-pointer font-medium text-gray-600 hover:text-black transition-colors">How it Works</a>
            <button className="btn-primary" onClick={() => router.push('/dashboard')}>Get Started</button>
          </div>

          {/* Mobile Hamburger */}
          <button className="md:hidden p-2 text-2xl focus:outline-none" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
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
        {/* Adjusted padding to reduce bottom gap */}
        <section className="relative min-h-[80vh] flex items-center pt-8 pb-12 lg:pb-0 overflow-hidden">
          <div className="page-container grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* LEFT COLUMN: Editorial Copy */}
            <div className="flex flex-col items-start z-10 text-center lg:text-left mx-auto lg:mx-0 max-w-xl lg:max-w-none">

              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50/80 rounded-full mb-8 self-center lg:self-start border border-blue-100 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow cursor-default">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Built on Mantle</span>
              </div>

              <h1 className="text-display mb-6 text-gray-900 leading-[1.1] tracking-tight">
                Unlock your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 font-serif italic pr-2">creative potential</span>
              </h1>

              <p className="text-xl text-gray-600 mb-10 leading-relaxed font-light">
                The all-in-one platform for creators to build community, share exclusive content, and earn directly from fans without the middleman.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-12">
                <button className="btn-primary px-8 py-4 text-lg w-full sm:w-auto justify-center shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all" onClick={() => router.push('/dashboard')}>
                  Create on Backr
                </button>
                <button className="btn-secondary px-8 py-4 text-lg w-full sm:w-auto justify-center" onClick={() => router.push('/explore')}>
                  Find Creators
                </button>
              </div>

              <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-gray-500 font-medium justify-center lg:justify-start w-full opacity-80">
                <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-gray-400" /> Data Ownership</span>
                <span className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="flex items-center gap-2"><Zap size={16} className="text-gray-400" /> Instant Payouts</span>
                <span className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="flex items-center gap-2"><DollarSign size={16} className="text-gray-400" /> 5% Flat Fee</span>
              </div>
            </div>

            {/* RIGHT COLUMN: Creator Collage (Desktop Only) */}
            <div className="hidden lg:block relative h-[650px] w-full">
              <CreatorCollage />
            </div>

            {/* Mobile Visual Fallback */}
            <div className="lg:hidden w-full relative h-[400px] mt-4 bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 shadow-inner">
              <img src="/images/home_visuals/creator1.png" className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Mobile Hero" />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-white via-white/40 to-transparent" />
            </div>

          </div>

          {/* Scroll Cue */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce opacity-30 text-gray-400 pointer-events-none">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 13l5 5 5-5M7 6l5 5 5-5" /></svg>
          </div>
        </section>


        {/* SECTION 2: HOW IT WORKS (Refined) */}
        {/* Adjusted padding to reduce gap from Hero */}
        <section id="how-it-works" className="py-16 md:py-24 relative">
          <div className="page-container">
            <Reveal>
              <div className="text-center mb-16">
                <h2 className="text-h2 font-serif mb-4">How it works</h2>
                <p className="text-body text-gray-500 max-w-lg mx-auto">
                  Start building your membership business in three simple steps.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
              {[
                { icon: <Palette size={32} className="text-indigo-600" />, title: 'Create your page', desc: 'Customize your creator profile, set up membership tiers, and define your brand.' },
                { icon: <Lock size={32} className="text-pink-600" />, title: 'Share content', desc: 'Post behind-the-scenes updates, early access work, and member-only media.' },
                { icon: <Wallet size={32} className="text-emerald-600" />, title: 'Get paid instantly', desc: 'Receive support directly in crypto with low fees and instant settlements.' }
              ].map((step, i) => (
                <Reveal key={i} delay={(i + 1) * 100}>
                  <div className="group p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-start relative overflow-hidden">
                    {/* Subtle inner grain */}
                    <div className="absolute inset-0 bg-motif-grain opacity-[0.03] pointer-events-none" />

                    <div className="absolute top-0 right-0 p-32 bg-gray-50 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-0 md:opacity-0" />

                    <div className="mb-6 bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 group-hover:scale-110 transition-all duration-300 relative z-10">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 z-10">{step.title}</h3>
                    <p className="text-gray-500 leading-relaxed z-10">{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-16 text-center">
              <button className="btn-secondary px-8 py-3 rounded-full hover:bg-gray-50 border-gray-200" onClick={() => router.push('/dashboard')}>
                Start your page now
              </button>
            </div>
          </div>
        </section>


        {/* BRIDGE SECTION: Visual Connector (Ownership -> Fees) */}
        {/* Reduced top padding to pull it closer to 'How it works' if needed, mostly handled by flow */}
        <section className="pt-24 pb-0 overflow-hidden relative">
          <div className="page-container flex flex-col items-center relative z-10">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8">Trusted by creators</p>

            {/* Creator Avatars Strip */}
            <div className="flex -space-x-4 mb-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={`w-14 h-14 rounded-full border-4 border-white bg-gray-200 bg-cover bg-center shadow-lg transition-transform hover:scale-110 hover:z-20`} style={{ backgroundImage: `url(https://i.pravatar.cc/150?u=${i + 30})` }} />
              ))}
              <div className="w-14 h-14 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shadow-md">
                +2k
              </div>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-12">Join thousands growing on Backr</p>
          </div>

          {/* Soft Fade to Dark Divider */}
          <div className="separator-fade-to-dark w-full" />
        </section>


        {/* SECTION 3: FEES & FEATURES (Dark Mode) */}
        {/* Adjusted padding: reduced top to merge with fade, standard desktop padding */}
        <section className="bg-[#111827] text-white relative overflow-hidden pb-16 pt-0">

          <div className="page-container relative z-10 pt-16">
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

          </div>
        </section>

        {/* Soft Fade to Light Divider (Fees -> Comparison/FAQ) */}
        <div className="separator-fade-to-light w-full bg-white" />


        {/* COMPARISON & FAQ SECTION (Light Mode) */}
        {/* Replaced standalone Comparison table with this integrated section to use the fade */}
        <section className="pv-24 bg-white relative -mt-20 pt-20">
          <div className="page-container">

            {/* Comparison Table */}
            <div className="max-w-3xl mx-auto rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm bg-white relative z-10 mb-24">
              <h3 className="text-center font-serif text-2xl mb-8">Compare to Traditional Platforms</h3>
              <div className="grid grid-cols-3 gap-4 text-sm md:text-base border-b border-gray-100 pb-4 mb-4 text-gray-400 font-medium">
                <div></div>
                <div className="text-center text-black font-bold">Backr</div>
                <div className="text-center opacity-50">Others</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center py-3 border-b border-gray-50">
                <div className="text-gray-500">Total Fee</div>
                <div className="text-center text-emerald-600 font-bold bg-emerald-50 rounded-full py-1">5%</div>
                <div className="text-center text-gray-400">8% - 12% +</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center py-3 border-b border-gray-50">
                <div className="text-gray-500">Payouts</div>
                <div className="text-center text-black font-bold">Instant</div>
                <div className="text-center text-gray-400">Monthly</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center py-3">
                <div className="text-gray-500">Censorship</div>
                <div className="text-center text-black font-bold">Resistant</div>
                <div className="text-center text-gray-400">Risky</div>
              </div>
              <div className="text-center text-xs text-gray-400 mt-6 italic">
                * Fees and policies may vary by region and legacy platforms.
              </div>
            </div>


            {/* FAQ (Simplified) */}
            <div className="max-w-2xl mx-auto text-center mb-12">
              <h2 className="text-h2 font-serif mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4 text-left">
                <div className="p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                  <h4 className="font-bold mb-1">Do I need crypto to start?</h4>
                  <p className="text-sm text-gray-500">You need a wallet (like MetaMask) to receive funds. Your supporters can pay easily on the Mantle network.</p>
                </div>
                <div className="p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                  <h4 className="font-bold mb-1">Is there a monthly fee?</h4>
                  <p className="text-sm text-gray-500">No. We only make money when you do. Usage is free forever.</p>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* FOOTER (Integrated Newsletter - Option 1) */}
        <footer className="bg-white border-t border-gray-100 pt-16 pb-10 relative">
          <div className="page-container">

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

              {/* Brand & Newsletter Column (Merged) */}
              <div className="md:col-span-5 flex flex-col items-start">
                <div className="font-serif text-3xl font-bold mb-4">Backr</div>
                <p className="text-gray-500 mb-8 max-w-sm text-sm leading-relaxed">
                  Empowering creators with true ownership and decentralized monetization on Mantle Network.
                </p>

                {/* Inline Newsletter - Elegant Compact Style */}
                <div className="w-full max-w-sm">
                  <h4 className="font-bold text-gray-900 mb-2 text-sm">Subscribe to updates</h4>
                  <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed!'); }} className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Email address"
                      className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 text-sm transition-all"
                      required
                    />
                    <button type="submit" className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition-all hover:shadow-lg">
                      Join
                    </button>
                  </form>
                  <p className="text-xs text-gray-400 mt-2">No spam, unsubscribe anytime.</p>
                </div>
              </div>

              {/* Links Columns */}
              <div className="md:col-span-7 flex flex-wrap gap-12 md:justify-end">
                <div className="flex flex-col gap-4">
                  <strong className="text-gray-900 text-sm uppercase tracking-wider">Product</strong>
                  <a href="#" className="text-gray-500 hover:text-black transition-colors text-sm">Features</a>
                  <a href="#" className="text-gray-500 hover:text-black transition-colors text-sm">Pricing</a>
                  <a href="#" className="text-gray-500 hover:text-black transition-colors text-sm">Showcase</a>
                </div>
                <div className="flex flex-col gap-4">
                  <strong className="text-gray-900 text-sm uppercase tracking-wider">Resources</strong>
                  <a href="#" className="text-gray-500 hover:text-black transition-colors text-sm">Documentation</a>
                  <a href="#" className="text-gray-500 hover:text-black transition-colors text-sm">Help Center</a>
                  <a href="#" className="text-gray-500 hover:text-black transition-colors text-sm">Brand Assets</a>
                </div>
                <div className="flex flex-col gap-4">
                  <strong className="text-gray-900 text-sm uppercase tracking-wider">Legal</strong>
                  <a href="#" className="text-gray-500 hover:text-black transition-colors text-sm">Privacy</a>
                  <a href="#" className="text-gray-500 hover:text-black transition-colors text-sm">Terms</a>
                </div>
              </div>

            </div>

            <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
              <p>© 2024 Backr. All rights reserved.</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-mono text-xs">SYSTEMS NORMAL</span>
              </div>
            </div>

          </div>
        </footer>

      </main>
    </div>
  );
}
