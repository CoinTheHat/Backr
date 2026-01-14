'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import {
    Palette, Lock, Zap, ShieldCheck, DollarSign, Wallet,
    ChevronDown, CheckCircle, ArrowRight
} from 'lucide-react';
import CreatorCollage from './components/CreatorCollage';
import BrandLogo from './components/BrandLogo';
import CategoryShowcase from './components/CategoryShowcase';
import WalletButton from './components/WalletButton';
import { Reveal } from './hooks/useScrollReveal';

export default function Home() {
    const router = useRouter();
    const { isConnected } = useAccount();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="min-h-screen home-page-bg home-page-overlay text-brand-dark overflow-x-hidden font-sans selection:bg-brand-primary-light">

            {/* NAVIGATION */}
            <nav
                className={`fixed top-0 inset-x-0 z-50 h-[72px] flex items-center transition-all duration-300 ${scrolled ? 'bg-black/40 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
                    }`}>
                <div className="page-container flex justify-between items-center w-full">
                    {/* Logo - Text Only */}
                    <div onClick={() => router.push('/')} className="cursor-pointer hover:opacity-80 transition-opacity">
                        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: '700', color: 'white', letterSpacing: '-0.03em', margin: 0 }}>Backr</h1>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex gap-8 items-center">
                        <span onClick={() => router.push('/explore')} className="cursor-pointer font-medium text-gray-200 hover:text-white transition-colors">Explore</span>
                        <a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }} className="cursor-pointer font-medium text-gray-200 hover:text-white transition-colors">How it Works</a>
                        <a href="#fees-and-features" onClick={(e) => { e.preventDefault(); document.getElementById('fees-and-features')?.scrollIntoView({ behavior: 'smooth' }); }} className="cursor-pointer font-medium text-gray-200 hover:text-white transition-colors">Fees</a>
                        <a href="#faq" onClick={(e) => { e.preventDefault(); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); }} className="cursor-pointer font-medium text-gray-200 hover:text-white transition-colors">FAQ</a>
                        <span onClick={() => router.push('/dashboard')} className="cursor-pointer font-medium text-gray-200 hover:text-white transition-colors">For Creators</span>
                    </div>

                    {/* Right Action */}
                    <div className="hidden md:block">
                        <WalletButton />
                    </div>

                    {/* Mobile Hamburger */}
                    <button className="md:hidden p-2 text-2xl focus:outline-none text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
                        {mobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[60] flex flex-col pt-24 px-6 animate-fade-in">
                    <button className="absolute top-6 right-6 p-2 text-white/50 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                        <div style={{ fontSize: '1.5rem' }}>✕</div>
                    </button>

                    <div className="flex flex-col gap-6 text-xl font-semibold text-white">
                        <div onClick={() => router.push('/explore')}>Explore</div>
                        <div onClick={() => { setMobileMenuOpen(false); document.getElementById('how-it-works')?.scrollIntoView(); }}>How it Works</div>
                        <div onClick={() => { setMobileMenuOpen(false); document.getElementById('fees-and-features')?.scrollIntoView(); }}>Fees</div>
                        <div onClick={() => { setMobileMenuOpen(false); document.getElementById('faq')?.scrollIntoView(); }}>FAQ</div>
                        <div className="pt-4 border-t border-white/10 flex justify-center">
                            <WalletButton />
                        </div>
                    </div>
                </div>
            )}

            <main className="relative pt-[72px]">

                {/* SECTION 1: HERO EDITORIAL */}
                <section className="relative z-10 min-h-[90vh] flex items-center pt-24 pb-12 lg:pt-32 lg:pb-0 overflow-hidden">

                    <div className="page-container grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                        {/* LEFT COLUMN: Editorial & Value Prop */}
                        <div className="flex flex-col items-start z-10 text-center lg:text-left mx-auto lg:mx-0 max-w-xl lg:max-w-none">

                            {/* Trust Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-8 self-center lg:self-start border border-white/20 backdrop-blur-sm">
                                <span className="w-2 h-2 bg-brand-accent rounded-full animate-pulse"></span>
                                <span className="text-xs font-bold text-white uppercase tracking-wide">Built on Mantle Network</span>
                            </div>

                            <h1 className="text-display mb-6 text-white leading-[1.05] tracking-tight">
                                Empower <br />
                                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-brand-primary font-serif italic pr-2">Creativity</span>
                            </h1>

                            <p className="text-xl text-gray-200 mb-10 leading-relaxed font-light max-w-lg mx-auto lg:mx-0 font-medium">
                                Build a thriving community and earn directly from your fans. All on Mantle, with no middleman.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-16 items-center lg:items-start justify-center lg:justify-start">
                                {/* Conditional Primary CTA */}
                                {!isConnected ? (
                                    <WalletButton
                                        className="btn-primary px-8 py-4 text-lg w-full sm:w-auto justify-center shadow-glow hover:-translate-y-1 transition-all"
                                        size="lg"
                                    />
                                ) : (
                                    <button
                                        className="btn-primary px-8 py-4 text-lg w-full sm:w-auto justify-center shadow-glow hover:-translate-y-1 transition-all"
                                        onClick={() => router.push('/dashboard')}
                                    >
                                        Go to Studio
                                    </button>
                                )}

                                <button className="btn-secondary px-8 py-4 text-lg w-full sm:w-auto justify-center bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40" onClick={() => router.push('/explore')}>
                                    Discover creators
                                </button>
                            </div>

                        </div>

                        {/* RIGHT COLUMN: Large Creator Collage */}
                        <div className="hidden lg:block relative h-[700px] w-full">
                            <CreatorCollage />
                        </div>

                        {/* Mobile Visual Fallback */}
                        <div className="lg:hidden w-full relative h-[450px] mt-4 bg-gray-100 rounded-3xl overflow-hidden shadow-lg transform rotate-1">
                            <img src="/images/home_visuals/creator1.png" className="absolute inset-0 w-full h-full object-cover" alt="Mobile Hero" />
                            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-white via-white/50 to-transparent" />
                        </div>

                    </div>
                </section>


                {/* SECTION 2: HOW IT WORKS */}
                <section id="how-it-works" className="relative z-10 py-24 border-b border-white/10">
                    <div className="page-container">
                        <Reveal>
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold mb-4 font-serif text-white">How Backr Works</h2>
                                <p className="text-body text-gray-300 font-medium">Simple, transparent, and built for you.</p>
                            </div>
                        </Reveal>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">

                            {[
                                { icon: <Palette size={28} className="text-brand-secondary" />, title: 'Create your page', desc: 'Customize your creator page, set your tier prices, and start creating.' },
                                { icon: <Lock size={28} className="text-brand-primary" />, title: 'Share exclusive content', desc: 'Your members only content and connect with your biggest fans.' },
                                { icon: <Wallet size={28} className="text-brand-accent" />, title: 'Get paid instantly', desc: 'Earn crypto payouts in seconds & settle, directly on Mantle.' }
                            ].map((step, i) => (
                                <Reveal key={i} delay={(i + 1) * 100}>
                                    <div className="flex flex-col items-start p-8 rounded-2xl glass-card bg-white/90 shadow-xl hover:bg-white hover:shadow-2xl transition-all duration-300">
                                        <div className="mb-4 bg-brand-light p-3 rounded-full shadow-sm">{step.icon}</div>
                                        <h3 className="text-lg font-bold mb-2 text-brand-dark">{step.title}</h3>
                                        <p className="text-sm text-gray-700 leading-relaxed font-medium">{step.desc}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>


                {/* SECTION 3: OWNERSHIP PROPOSITION */}
                <section className="py-24 relative overflow-hidden">
                    <div className="page-container grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <Reveal>
                            <CategoryShowcase />
                        </Reveal>

                        <Reveal delay={0.2}>
                            <div>
                                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white">
                                    Complete creative control. <br />
                                    <span className="text-brand-primary">Own your content, your list, and your revenue.</span>
                                </h2>
                                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                                    No algorithms dictating between you and your biggest fans.
                                </p>

                                <ul className="space-y-4">
                                    {[
                                        'Decentralized settlements on Mantle',
                                        'Own your email list & data',
                                        'Consistent, sustainable payments'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-200">
                                            <CheckCircle className="w-6 h-6 text-brand-secondary flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Reveal>
                    </div>
                </section>


                {/* SECTION 4: FEES & FEATURES */}
                <section id="fees-and-features" className="py-32 relative text-white">
                    <div className="page-container relative z-10">
                        <Reveal>
                            <div className="text-center mb-20 max-w-3xl mx-auto">
                                <h2 className="text-4xl md:text-5xl font-serif mb-6">Creators set the price. <br /> We take a simple fee.</h2>
                                <p className="text-xl text-gray-300 leading-relaxed">
                                    You choose your tier prices. Backr charges a transparent fee.
                                </p>
                            </div>
                        </Reveal>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

                            {/* Value Card A */}
                            <Reveal delay={100}>
                                <div className="glass-card-dark rounded-3xl p-10 h-full hover:bg-white/10 transition-colors flex flex-col">
                                    <div className="mb-6 bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center">
                                        <DollarSign className="text-white" size={28} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">You set your prices</h3>
                                    <p className="text-gray-400 mb-8 flex-1">Set any price, anytime. Create membership tiers that work for your audience.</p>
                                    <div className="flex gap-2 opacity-80">
                                        <span className="px-3 py-1 rounded-full bg-brand-secondary/20 text-brand-secondary text-xs font-bold border border-brand-secondary/30">Bronze 0.05 MNT</span>
                                        <span className="px-3 py-1 rounded-full bg-brand-primary/20 text-brand-primary text-xs font-bold border border-brand-primary/30">Silver 0.1 MNT</span>
                                    </div>
                                </div>
                            </Reveal>

                            {/* Value Card B (Highlight) */}
                            <Reveal delay={200}>
                                <div className="glass-card-dark bg-brand-secondary/10 rounded-3xl p-10 h-full transform lg:-translate-y-4 shadow-2xl relative border border-brand-secondary/30 flex flex-col">
                                    <div className="absolute top-0 right-0 p-6">
                                        <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Simple</span>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Platform Fee</h3>
                                    <div className="text-7xl font-bold mb-4 tracking-tighter">5%</div>
                                    <p className="text-indigo-100 mb-8 flex-1 text-lg">Only on successful payments.</p>

                                    <div className="border-t border-white/20 pt-6 space-y-3">
                                        <div className="flex items-center gap-3 text-sm font-medium">
                                            <CheckCircle size={16} className="text-brand-accent" /> No monthly subscription
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-medium">
                                            <CheckCircle size={16} className="text-brand-accent" /> Includes all features
                                        </div>
                                    </div>
                                </div>
                            </Reveal>

                            {/* Value Card C */}
                            <Reveal delay={300}>
                                <div className="glass-card-dark rounded-3xl p-10 h-full hover:bg-white/10 transition-colors flex flex-col">
                                    <div className="mb-6 bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center">
                                        <Zap className="text-brand-accent" size={28} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">Instant Payouts</h3>
                                    <p className="text-gray-400 mb-8 flex-1">Funds are settled directly to your wallet on the Mantle Network.</p>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <CheckCircle size={14} className="text-brand-accent" /> Creator wallet payouts
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <CheckCircle size={14} className="text-brand-accent" /> Earn friendly crypto payments
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <CheckCircle size={14} className="text-brand-accent" /> Predictable fees
                                        </div>
                                    </div>
                                </div>
                            </Reveal>

                        </div>

                        <div className="mt-20 text-center">
                            <button className="bg-white text-brand-dark px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg shadow-white/20" onClick={() => router.push('/dashboard')}>
                                Create your page
                            </button>
                        </div>

                    </div>
                </section>


                {/* SECTION 5: COMPETITOR COMPARISON */}
                <section id="compare" className="py-24 relative">
                    <div className="page-container">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-3xl font-serif font-bold text-center mb-16 text-white">Backr vs. The Old Way</h2>

                            <div className="scroll-x-container rounded-3xl overflow-hidden glass-card-dark shadow-xl border border-white/10">

                                <div className="grid grid-cols-3 bg-white/5 border-b border-white/10 text-sm font-bold text-gray-400 uppercase tracking-wider">
                                    <div className="p-6">Feature</div>
                                    <div className="p-6 text-center text-brand-secondary bg-brand-secondary/10">Backr</div>
                                    <div className="p-6 text-center">Patreon</div>
                                </div>

                                {[
                                    { feature: 'Platform Fee', backr: '5% Flat', patreon: '8% - 12% (+ payment fees)' },
                                    { feature: 'Payout Speed', backr: 'Instant', patreon: 'Monthly / Daily (Delayed)' },
                                    { feature: 'Crypto Support', backr: 'Native (Mantle)', patreon: 'None' },
                                    { feature: 'Censorship', backr: 'Resistant', patreon: 'Risk of de-platforming' },
                                    { feature: 'Audience Data', backr: 'Owned by You', patreon: 'Owned by Platform' },
                                ].map((row, i) => (
                                    <div key={i} className="grid grid-cols-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors text-sm md:text-base">
                                        <div className="p-6 font-medium text-white">{row.feature}</div>
                                        <div className="p-6 text-center font-bold text-brand-secondary bg-brand-secondary/10 shadow-[inset_0_0_20px_rgba(107,139,255,0.1)]">{row.backr}</div>
                                        <div className="p-6 text-center text-gray-400">{row.patreon}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 6: FAQ */}
                <section id="faq" className="py-24 relative border-t border-white/10">
                    <div className="page-container max-w-3xl">
                        <h2 className="text-3xl font-serif font-bold text-center mb-12 text-white">Frequently Asked Questions</h2>

                        <div className="space-y-4">
                            {[
                                { q: "Do I need to know crypto to use Backr?", a: "Not necessarily! While Backr runs on blockchain technology for payments, we designed the experience to be simple. You just need a wallet like MetaMask to receive funds." },
                                { q: "Are there really no monthly fees?", a: "Correct. We believe you should only pay when you're succeeding. We take a flat 5% fee from income generated on the platform." },
                                { q: "Can I migrate my Patreon subscribers?", a: "We provide tools to help you import your email list, but your subscribers will need to set up a new payment method on Backr." },
                                { q: "What is Mantle Network?", a: "Mantle is a high-performance Ethereum Layer 2 network that enables fast, cheap transactions while maintaining security." }
                            ].map((item, i) => (
                                <div key={i} className="glass-card-dark rounded-2xl border border-white/10 overflow-hidden">
                                    <button
                                        className="w-full flex justify-between items-center p-6 text-left font-bold text-white focus:outline-none hover:bg-white/5 transition-colors"
                                        onClick={() => toggleFaq(i)}
                                    >
                                        {item.q}
                                        <ChevronDown className={`transform transition-transform duration-300 text-gray-400 ${openFaq === i ? 'rotate-180' : ''}`} />
                                    </button>
                                    <div className={`px-6 text-gray-300 overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40 pb-6' : 'max-h-0'}`}>
                                        {item.a}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* SECTION 7: FOOTER */}
                <footer className="relative border-t border-white/10 pt-20 pb-12 bg-black/20 backdrop-blur-lg">
                    <div className="page-container">

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20 text-sm">

                            {/* Column 1: Brand */}
                            <div className="md:col-span-1">
                                <div className="font-serif text-2xl font-bold mb-4 flex items-center gap-2 text-white">
                                    <span>Backr</span>
                                </div>
                                <p className="text-gray-400 mb-6 leading-relaxed">
                                    The future of creator monetization. Built on Mantle. Owned by you.
                                </p>
                            </div>

                            {/* Column 2: Platform */}
                            <div className="flex flex-col gap-4">
                                <strong className="text-white font-bold uppercase tracking-wider text-xs">Platform</strong>
                                <a href="/explore" onClick={(e) => { e.preventDefault(); router.push('/explore') }} className="text-gray-400 hover:text-brand-secondary transition-colors">Explore Creators</a>
                                <a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-gray-400 hover:text-brand-secondary transition-colors">How it works</a>
                                <a href="#fees-and-features" onClick={(e) => { e.preventDefault(); document.getElementById('fees-and-features')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-gray-400 hover:text-brand-secondary transition-colors">Fees & Features</a>
                                <a href="#faq" onClick={(e) => { e.preventDefault(); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-gray-400 hover:text-brand-secondary transition-colors">FAQ</a>
                            </div>

                            {/* Column 3: Company & Community */}
                            <div className="flex flex-col gap-4">
                                <strong className="text-white font-bold uppercase tracking-wider text-xs">Company</strong>
                                <a href="/about" onClick={(e) => { e.preventDefault(); router.push('/about') }} className="text-gray-400 hover:text-brand-secondary transition-colors">About</a>
                                <a href="/community" onClick={(e) => { e.preventDefault(); router.push('/community') }} className="text-gray-400 hover:text-brand-secondary transition-colors">Community</a>
                                <a href="/terms" onClick={(e) => { e.preventDefault(); router.push('/terms') }} className="text-gray-400 hover:text-brand-secondary transition-colors">Terms of Service</a>
                                <a href="/privacy" onClick={(e) => { e.preventDefault(); router.push('/privacy') }} className="text-gray-400 hover:text-brand-secondary transition-colors">Privacy Policy</a>
                            </div>

                        </div>

                        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                            <div>© 2026 Backr Inc. All rights reserved.</div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
                                <span className="font-medium text-gray-400 text-xs">Powered by Mantle</span>
                            </div>
                        </div>

                    </div>
                </footer>

            </main>
        </div >
    );
}
