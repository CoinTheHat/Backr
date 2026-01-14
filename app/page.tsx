'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import {
    Palette, Lock, Zap, ShieldCheck, DollarSign, Wallet,
    ChevronDown, CheckCircle, ArrowRight
} from 'lucide-react';
import CreatorCollage from './components/CreatorCollage';
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
        <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden font-sans selection:bg-indigo-100">

            {/* Background Decor */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-motif-light opacity-60" />
            <div className="fixed inset-0 z-0 pointer-events-none bg-motif-grain opacity-40 mix-blend-overlay" />

            {/* ---------------------------------------------------------------------------
         NAVIGATION
         --------------------------------------------------------------------------- */}
            <nav
                className={`fixed top-0 inset-x-0 z-50 h-[72px] flex items-center transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-100' : 'bg-transparent'
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
                    <div className="flex flex-col gap-6 text-xl font-semibold">
                        <div onClick={() => router.push('/explore')}>Find Creators</div>
                        <div onClick={() => { setMobileMenuOpen(false); document.getElementById('how-it-works')?.scrollIntoView(); }}>How it Works</div>
                        <div className="pt-4 border-t border-gray-100">
                            <button className="btn-primary w-full justify-center py-3" onClick={() => router.push('/dashboard')}>Get Started</button>
                        </div>
                    </div>
                </div>
            )}

            <main className="relative pt-[72px]">

                {/* SECTION 1: HERO EDITORIAL */}
                <section className="relative min-h-[90vh] flex items-center pt-8 pb-16 lg:pb-0 overflow-hidden">
                    <div className="page-container grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                        {/* LEFT COLUMN: Editorial & Value Prop */}
                        <div className="flex flex-col items-start z-10 text-center lg:text-left mx-auto lg:mx-0 max-w-xl lg:max-w-none">

                            {/* Trust Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50/50 rounded-full mb-8 self-center lg:self-start border border-blue-100/50 backdrop-blur-sm">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Built on Mantle Network</span>
                            </div>

                            <h1 className="text-display mb-6 text-gray-900 leading-[1.05] tracking-tight">
                                Empower <br />
                                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 font-serif italic pr-2">Creativity</span>
                            </h1>

                            <p className="text-xl text-gray-600 mb-10 leading-relaxed font-light max-w-lg mx-auto lg:mx-0">
                                Build a thriving community and earn directly from your fans. All on Mantle, with no middleman.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-16">
                                <button className="btn-primary px-8 py-4 text-lg w-full sm:w-auto justify-center shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-1 transition-all" onClick={() => router.push('/dashboard')}>
                                    Create your page
                                </button>
                                <button className="btn-secondary px-8 py-4 text-lg w-full sm:w-auto justify-center bg-white border-gray-200 hover:border-gray-300" onClick={() => router.push('/explore')}>
                                    Discover creators
                                </button>
                            </div>

                            {/* Social Stats */}
                            <div className="flex flex-wrap gap-8 text-sm font-medium justify-center lg:justify-start w-full opacity-70">
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => <div key={i} className={`w-6 h-6 rounded-full bg-gray-200 border-2 border-white bg-cover`} style={{ backgroundImage: `url(https://i.pravatar.cc/100?u=${i + 10})` }} />)}
                                    </div>
                                    <span>1,200+ Creators</span>
                                </div>
                                <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
                                <div>$500k+ Paid Out</div>
                                <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
                                <div>Instant Settlement</div>
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
                <section id="how-it-works" className="py-24 bg-white relative border-b border-gray-50">
                    <div className="page-container">
                        <Reveal>
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold mb-4 font-serif">How Backr Works</h2>
                                <p className="text-body text-gray-500">Simple, transparent, and built for you.</p>
                            </div>
                        </Reveal>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { icon: <Palette size={28} className="text-indigo-600" />, title: 'Create your page', desc: 'Customize your creator page, set your tier prices, and start creating.' },
                                { icon: <Lock size={28} className="text-pink-600" />, title: 'Share exclusive content', desc: 'Your members only content and connect with your biggest fans.' },
                                { icon: <Wallet size={28} className="text-emerald-600" />, title: 'Get paid instantly', desc: 'Earn crypto payouts in seconds & settle, directly on Mantle.' }
                            ].map((step, i) => (
                                <Reveal key={i} delay={(i + 1) * 100}>
                                    <div className="flex flex-col items-start p-8 rounded-2xl glass-card hover:bg-white hover:shadow-lg transition-all duration-300">
                                        <div className="mb-4 bg-indigo-50 p-3 rounded-full shadow-sm">{step.icon}</div>
                                        <h3 className="text-lg font-bold mb-2 text-gray-900">{step.title}</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>


                {/* SECTION 3: OWNERSHIP PROPOSITION */}
                <section className="py-24 relative overflow-hidden">
                    <div className="page-container grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        {/* Product Visual */}
                        <Reveal>
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gray-900 aspect-video lg:aspect-square">
                                {/* Simulated Video/Dashboard UI */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500 border-2 border-white"></div>
                                        <div>
                                            <div className="font-bold text-sm">Sarah Artist</div>
                                            <div className="text-xs text-gray-300">Studio Tour & Gear Setup</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                        {/* Copy */}
                        <div className="lg:pl-8">
                            <Reveal delay={100}>
                                <h2 className="text-4xl md:text-5xl font-serif font-medium mb-6 text-gray-900 leading-tight">
                                    Complete creative control. <br />
                                    <span className="text-indigo-600">Own your content, your list, and your revenue.</span>
                                </h2>
                                <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                                    No algorithms dictating between you and your biggest fans.
                                </p>

                                <ul className="space-y-6">
                                    {[
                                        "Decentralized settlements on Mantle",
                                        "Own your email list & data",
                                        "Consistent, sustainable payments"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-4">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                                <CheckCircle size={14} strokeWidth={3} />
                                            </div>
                                            <span className="text-lg text-gray-700 font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Reveal>
                        </div>

                    </div>
                </section>


                {/* SECTION 4: FEES & FEATURES (Cosmic Dark) */}
                <section className="py-32 bg-cosmic text-white relative">
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
                                        <DollarSign className="text-amber-300" size={28} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">You set your prices</h3>
                                    <p className="text-gray-400 mb-8 flex-1">Set any price, anytime. Create membership tiers that work for your audience.</p>
                                    <div className="flex gap-2 opacity-80">
                                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">Bronze 0.05 MNT</span>
                                        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">Silver 0.1 MNT</span>
                                    </div>
                                </div>
                            </Reveal>

                            {/* Value Card B (Highlight) */}
                            <Reveal delay={200}>
                                <div className="bg-gradient-to-b from-indigo-500 to-indigo-700 rounded-3xl p-10 h-full transform lg:-translate-y-4 shadow-2xl relative border border-white/20 flex flex-col">
                                    <div className="absolute top-0 right-0 p-6">
                                        <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Simple</span>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Platform Fee</h3>
                                    <div className="text-7xl font-bold mb-4 tracking-tighter">5%</div>
                                    <p className="text-indigo-100 mb-8 flex-1 text-lg">Only on successful payments.</p>

                                    <div className="border-t border-white/20 pt-6 space-y-3">
                                        <div className="flex items-center gap-3 text-sm font-medium">
                                            <CheckCircle size={16} className="text-indigo-200" /> No monthly subscription
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-medium">
                                            <CheckCircle size={16} className="text-indigo-200" /> Includes all features
                                        </div>
                                    </div>
                                </div>
                            </Reveal>

                            {/* Value Card C */}
                            <Reveal delay={300}>
                                <div className="glass-card-dark rounded-3xl p-10 h-full hover:bg-white/10 transition-colors flex flex-col">
                                    <div className="mb-6 bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center">
                                        <Zap className="text-emerald-400" size={28} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">Instant Payouts</h3>
                                    <p className="text-gray-400 mb-8 flex-1">Funds are settled directly to your wallet on the Mantle Network.</p>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <CheckCircle size={14} className="text-emerald-500" /> Creator wallet payouts
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <CheckCircle size={14} className="text-emerald-500" /> Earn friendly crypto payments
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <CheckCircle size={14} className="text-emerald-500" /> Predictable fees
                                        </div>
                                    </div>
                                </div>
                            </Reveal>

                        </div>

                        <div className="mt-20 text-center">
                            <button className="bg-white text-indigo-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-900/20" onClick={() => router.push('/dashboard')}>
                                Create your page
                            </button>
                        </div>

                    </div>
                </section>



                {/* SECTION 5: COMPETITOR COMPARISON */}
                <section className="py-24 bg-white">
                    <div className="page-container">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-3xl font-serif font-bold text-center mb-16">Backr vs. The Old Way</h2>

                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                                <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-500 uppercase tracking-wider">
                                    <div className="p-6">Feature</div>
                                    <div className="p-6 text-center text-indigo-600 bg-indigo-50/50">Backr</div>
                                    <div className="p-6 text-center">Patreon</div>
                                </div>

                                {[
                                    { feature: 'Platform Fee', backr: '5% Flat', patreon: '8% - 12% (+ payment fees)' },
                                    { feature: 'Payout Speed', backr: 'Instant', patreon: 'Monthly / Daily (Delayed)' },
                                    { feature: 'Crypto Support', backr: 'Native (Mantle)', patreon: 'None' },
                                    { feature: 'Censorship', backr: 'Resistant', patreon: 'Risk of de-platforming' },
                                    { feature: 'Audience Data', backr: 'Owned by You', patreon: 'Owned by Platform' },
                                ].map((row, i) => (
                                    <div key={i} className="grid grid-cols-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors text-sm md:text-base">
                                        <div className="p-6 font-medium text-gray-900">{row.feature}</div>
                                        <div className="p-6 text-center font-bold text-indigo-700 bg-indigo-50/30">{row.backr}</div>
                                        <div className="p-6 text-center text-gray-500">{row.patreon}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 6: FAQ */}
                <section className="py-24 bg-gray-50 border-t border-gray-200">
                    <div className="page-container max-w-3xl">
                        <h2 className="text-3xl font-serif font-bold text-center mb-12">Frequently Asked Questions</h2>

                        <div className="space-y-4">
                            {[
                                { q: "Do I need to know crypto to use Backr?", a: "Not necessarily! While Backr runs on blockchain technology for payments, we designed the experience to be simple. You just need a wallet like MetaMask to receive funds." },
                                { q: "Are there really no monthly fees?", a: "Correct. We believe you should only pay when you're succeeding. We take a flat 5% fee from income generated on the platform." },
                                { q: "Can I migrate my Patreon subscribers?", a: "We provide tools to help you import your email list, but your subscribers will need to set up a new payment method on Backr." },
                                { q: "What is Mantle Network?", a: "Mantle is a high-performance Ethereum Layer 2 network that enables fast, cheap transactions while maintaining security." }
                            ].map((item, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                    <button
                                        className="w-full flex justify-between items-center p-6 text-left font-bold text-gray-900 focus:outline-none"
                                        onClick={() => toggleFaq(i)}
                                    >
                                        {item.q}
                                        <ChevronDown className={`transform transition-transform duration-300 text-gray-400 ${openFaq === i ? 'rotate-180' : ''}`} />
                                    </button>
                                    <div className={`px-6 text-gray-600 overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40 pb-6' : 'max-h-0'}`}>
                                        {item.a}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* SECTION 7: FOOTER */}
                <footer className="bg-white border-t border-gray-100 pt-20 pb-12">
                    <div className="page-container">

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">

                            {/* Newsletter & Brand */}
                            <div className="md:col-span-4">
                                <div className="font-serif text-3xl font-bold mb-4">Backr</div>
                                <p className="text-gray-500 mb-8 max-w-sm text-sm leading-relaxed">
                                    The future of creator monetization. Built on Mantle. Owned by you.
                                </p>

                                <h4 className="font-bold text-gray-900 mb-2 text-sm">Join our newsletter</h4>
                                <form onSubmit={(e) => { e.preventDefault(); }} className="flex gap-2 max-w-sm">
                                    <input type="email" placeholder="Email address" className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                    <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold">Subscribe</button>
                                </form>
                            </div>

                            {/* Links */}
                            <div className="md:col-span-8 flex flex-wrap gap-12 md:justify-end">
                                <div className="flex flex-col gap-4">
                                    <strong className="text-gray-900 text-sm uppercase tracking-wider">Platform</strong>
                                    <a href="#" className="text-gray-500 hover:text-black transition-colors text-sm">Features</a>
                                    <a href="#" className="text-gray-500 hover:text-black transition-colors text-sm">Pricing</a>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <strong className="text-gray-900 text-sm uppercase tracking-wider">Support</strong>
                                    <a href="#" className="text-gray-500 hover:text-black transition-colors text-sm">Help Center</a>
                                    <a href="#" className="text-gray-500 hover:text-black transition-colors text-sm">Community</a>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <strong className="text-gray-900 text-sm uppercase tracking-wider">Company</strong>
                                    <a href="#" className="text-gray-500 hover:text-black transition-colors text-sm">About</a>
                                    <a href="#" className="text-gray-500 hover:text-black transition-colors text-sm">Careers</a>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                            <div>© 2024 Backr Inc. All rights reserved.</div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="font-medium text-gray-600 text-xs">Powered by Mantle</span>
                            </div>
                        </div>

                    </div>
                </footer>

            </main>
        </div>
    );
}
