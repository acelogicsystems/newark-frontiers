import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiArrowRight, FiShield, FiZap, FiChevronDown,
    FiCheckCircle, FiActivity, FiLock, FiGlobe, FiArrowUpRight, FiMenu, FiX
} from 'react-icons/fi';

/* ─── IMAGE CONSTANTS (Unsplash) ─────────────────────────────── */
const IMGS = {
    hero:      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80&fit=crop',   // person holding phone / fintech
    mpesa:     'https://images.unsplash.com/photo-1604580864964-0462f5d5b1a8?w=800&q=80&fit=crop', // phone with mobile payment
    cash:      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80&fit=crop',    // money / cash
    merchant:  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80&fit=crop', // shop / merchant
    nairobi:   'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=1400&q=80&fit=crop', // Nairobi skyline
    woman:     'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80&fit=crop',  // woman entrepreneur
};

/* ─── KENTE STRIP ─────────────────────────────────────────────── */
const KenteStrip = () => (
    <div style={{
        height: 6, width: '100%',
        background: 'repeating-linear-gradient(90deg,#042f2e 0 10px,#059669 10px 18px,#fbbf24 18px 24px,#f8fafc 24px 28px,#042f2e 28px 38px,#059669 38px 46px,#fbbf24 46px 52px)'
    }} />
);

/* ─── COUNTER ANIMATION ───────────────────────────────────────── */
const useCounter = (target, duration = 1800) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                let start = 0;
                const step = target / (duration / 16);
                const t = setInterval(() => {
                    start += step;
                    if (start >= target) { setCount(target); clearInterval(t); }
                    else setCount(Math.floor(start));
                }, 16);
                observer.disconnect();
            }
        }, { threshold: 0.4 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);
    return [count, ref];
};

/* ─── ANIMATED STAT ───────────────────────────────────────────── */
const AnimStat = ({ val, num, suffix = '', label }) => {
    const [count, ref] = useCounter(num, 1600);
    return (
        <div ref={ref} className="text-center">
            <h4 className="text-4xl md:text-5xl font-black tracking-tighter text-white italic">
                {val || (count + suffix)}
            </h4>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-2">{label}</p>
        </div>
    );
};

/* ─── HERO ACCORDION ──────────────────────────────────────────── */
const HeroAccordion = ({ id, label, content, active, setActive, action }) => {
    const isOpen = active === id;
    return (
        <div className="border-b border-white/10 overflow-hidden">
            <button onClick={() => setActive(isOpen ? null : id)}
                className="w-full py-4 flex justify-between items-center group text-left">
                <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${isOpen ? 'text-brand-primary' : 'text-white'}`}>
                    {label}
                </span>
                <FiChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-primary' : 'text-white/40'}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
                <p className="text-xs text-white/40 mb-4 leading-relaxed">{content}</p>
                {action && (
                    <button onClick={action}
                        className="text-[9px] font-black text-brand-accent uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                        Proceed <FiArrowRight />
                    </button>
                )}
            </div>
        </div>
    );
};

/* ─── FEATURE CARD ────────────────────────────────────────────── */
const FeatureCard = ({ icon, title, desc, accent }) => (
    <div className="group relative bg-white border border-slate-100 p-10 rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-dark/10 cursor-default">
        <div className={`absolute top-0 left-0 right-0 h-1 ${accent} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-8 transition-colors duration-300 bg-slate-50 group-hover:bg-opacity-100">
             {icon}
        </div>
        <h3 className="text-xl font-black text-brand-dark mb-3">{title}</h3>
        <p className="text-slate-400 font-medium text-sm leading-relaxed">{desc}</p>
        <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity text-brand-primary">
            Explore <FiArrowRight size={12} />
        </div>
    </div>
);

/* ─── STEP ────────────────────────────────────────────────────── */
const Step = ({ num, title, desc }) => (
    <div className="group space-y-5 text-center">
        <div className="w-14 h-14 rounded-full border-2 border-brand-primary/30 group-hover:border-brand-primary group-hover:bg-brand-primary/5 mx-auto flex items-center justify-center text-[11px] font-black text-brand-primary transition-all duration-300">
            {num}
        </div>
        <h4 className="text-lg font-black text-brand-dark">{title}</h4>
        <p className="text-slate-400 text-sm font-medium px-4 leading-relaxed">{desc}</p>
    </div>
);

/* ─── MAIN PAGE ───────────────────────────────────────────────── */
const LandingPage = () => {
    const navigate = useNavigate();
    const [activeAccordion, setActiveAccordion] = useState(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="min-h-screen bg-brand-surface font-sans text-brand-dark overflow-x-hidden selection:bg-brand-primary/20">

            <KenteStrip />

            {/* ── NAV ── */}
            <header className={`sticky top-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-brand-dark/98 py-3 shadow-2xl' : 'bg-brand-dark py-5'} border-b border-white/5`}>
                <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                            <div className="w-9 h-9 bg-brand-accent rounded-lg flex items-center justify-center font-black text-brand-dark text-lg" style={{ transform: 'rotate(-4deg)' }}>N</div>
                            <span className="font-black tracking-tight text-white text-xl uppercase">Newark</span>
                        </div>
                        <nav className="hidden lg:flex gap-8 text-[10px] font-black uppercase tracking-widest">
                            {['Solutions', 'Impact', 'Process', 'Contact'].map(l => (
                                <a key={l} href={`#${l.toLowerCase()}`} className="text-white/40 hover:text-brand-accent transition-colors">{l}</a>
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/login')} className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">
                            Sign In
                        </button>
                        <button onClick={() => navigate('/register')}
                            className="bg-brand-accent text-brand-dark px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-yellow-300 transition-all active:scale-95">
                            Apply Now →
                        </button>
                    </div>
                </div>
            </header>

            {/* ── HERO ── */}
            <section className="relative bg-brand-dark overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src={IMGS.nairobi} alt="" className="w-full h-full object-cover opacity-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand-dark/95 to-brand-dark/80" />
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                        backgroundImage: 'repeating-linear-gradient(45deg,#fbbf24 0,#fbbf24 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,#059669 0,#059669 1px,transparent 0,transparent 50%)',
                        backgroundSize: '36px 36px'
                    }} />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pt-20 pb-12 flex flex-col lg:flex-row gap-16 items-center lg:items-end">
                    <div className="flex-1 text-white lg:pb-24 space-y-8">
                        <div className="inline-flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 px-4 py-2 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Live across 47 counties</span>
                        </div>

                        <h1 className="text-6xl md:text-[5.5rem] font-black leading-[0.88] tracking-tighter">
                            Capital <br />
                            <span className="text-brand-primary">for the</span> <br />
                            <span className="text-brand-accent italic">Bold.</span>
                        </h1>

                        <p className="text-white/50 text-lg max-w-md font-light leading-relaxed">
                            Newark is Kenya's precision lending infrastructure — built for founders, traders, and enterprises that refuse to wait.
                        </p>

                        <div className="space-y-0 pt-4 max-w-sm border-t border-white/10">
                            <HeroAccordion id="apply" label="Apply for a Loan"
                                content="Access instant credit lines up to KES 50,000. Approval in under 60 seconds with M-Pesa disbursement."
                                active={activeAccordion} setActive={setActiveAccordion} action={() => navigate('/register')} />
                            <HeroAccordion id="account" label="Create an Account"
                                content="Join the Newark network in under 3 minutes. Requires valid national ID and business details."
                                active={activeAccordion} setActive={setActiveAccordion} action={() => navigate('/register')} />
                            <HeroAccordion id="how" label="Learn How it Works"
                                content="Fully digital. AI-powered risk assessment. M-Pesa integrated payouts. No branches, no paperwork."
                                active={activeAccordion} setActive={setActiveAccordion} />
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-5 w-full lg:w-auto">
                        <div className="relative rounded-3xl lg:rounded-t-[2.5rem] lg:rounded-b-none overflow-hidden h-[300px] lg:h-[420px]">
                            <img src={IMGS.hero} alt="Newark" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />
                            <div className="absolute top-6 left-6 bg-white/10 backdrop-blur border border-white/15 rounded-2xl px-5 py-3">
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-0.5">Portfolio Volume</p>
                                <p className="text-2xl font-black text-white italic tracking-tighter">KES 2.4B+</p>
                            </div>
                            <div className="absolute top-6 right-6 bg-brand-accent text-brand-dark px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">CBK ✓</div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {[ {img: IMGS.mpesa, l: 'Speed', v: '60s'}, {img: IMGS.cash, l: 'Users', v: '50K+'}, {img: IMGS.merchant, l: 'Rating', v: 'AAA+'} ].map((item, i) => (
                                <div key={i} className="relative rounded-2xl overflow-hidden h-24 lg:h-32">
                                    <img src={item.img} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-brand-dark/70 flex flex-col justify-end p-3">
                                        <p className="text-[8px] font-black uppercase text-white/50">{item.l}</p>
                                        <p className="text-xs lg:text-sm font-black text-white">{item.v}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <KenteStrip />

            {/* ── TRUST BAR ── */}
            <div className="border-b border-slate-100 py-10 bg-white">
                <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-10 opacity-40">
                    {['M-PESA Integrated', 'ISO 27001 Certified', 'CBK Licensed', 'KYC / AML Compliant'].map(t => (
                        <span key={t} className="text-xs font-black italic tracking-tighter uppercase text-brand-dark">{t}</span>
                    ))}
                </div>
            </div>

            {/* ── SOLUTIONS ── */}
            <section id="solutions" className="py-24 lg:py-32 px-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-8 mb-20">
                    <div>
                        <p className="text-brand-primary font-black uppercase tracking-[0.3em] text-[10px] mb-3 flex items-center gap-3">
                            The Newark Standard
                            <span className="block h-px bg-brand-primary/20 w-12" />
                        </p>
                        <h2 className="text-4xl lg:text-5xl font-black text-brand-dark tracking-tighter leading-tight">
                            Built for the <span className="text-brand-primary italic">frontier.</span>
                        </h2>
                    </div>
                    <p className="text-slate-400 text-sm font-medium max-w-xs leading-relaxed">
                        Traditional banks look at your past. We look at your potential to scale.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard icon={<FiZap className="text-emerald-600"/>} title="Hyper-Speed Funding" accent="bg-brand-primary"
                        desc="Submit your application and get approval in real-time. Capital is deployed in under 60 seconds directly to M-Pesa." />
                    <FeatureCard icon={<FiLock className="text-amber-500" />} title="Fortress Security" accent="bg-brand-accent"
                        desc="All KYC documents and financial history are protected by AES-256 encryption and zero-knowledge identity protocols." />
                    <FeatureCard icon={<FiActivity className="text-slate-800" />} title="Growth Intelligence" accent="bg-brand-dark"
                        desc="AI-powered credit scoring built for the Kenyan ecosystem — looking at 200+ signals beyond traditional credit history." />
                </div>
            </section>

            {/* ── TESTIMONIAL ── */}
            <section className="px-6 max-w-7xl mx-auto mb-24">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 rounded-[2.5rem] overflow-hidden lg:h-[480px]">
                    <div className="lg:col-span-3 relative h-[300px] lg:h-full">
                        <img src={IMGS.woman} alt="Success Story" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-dark/80" />
                        <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-12">
                            <div className="max-w-sm">
                                <div className="inline-block bg-brand-accent text-brand-dark px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mb-3">Success Story</div>
                                <p className="text-white font-medium leading-relaxed text-lg italic">
                                    "Newark approved my <span className="text-brand-accent font-black not-italic">KSH 50,000</span> loan in 45 seconds. My business hasn't stopped growing since."
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <div className="flex-1 relative h-40 lg:h-auto overflow-hidden bg-brand-dark">
                            <img src={IMGS.cash} alt="" className="w-full h-full object-cover opacity-40" />
                            <div className="absolute inset-0 flex flex-col justify-end p-6">
                                <p className="text-white/50 text-[9px] font-black uppercase">Capital Deployed</p>
                                <p className="text-white text-3xl font-black italic">KES 2.4B+</p>
                            </div>
                        </div>
                        <div className="flex-1 relative h-40 lg:h-auto overflow-hidden bg-brand-primary">
                            <img src={IMGS.mpesa} alt="" className="w-full h-full object-cover opacity-30" />
                            <div className="absolute inset-0 flex flex-col justify-end p-6">
                                <p className="text-white/70 text-[9px] font-black uppercase">Disbursement</p>
                                <p className="text-white text-3xl font-black italic">Under 60s</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── IMPACT ── */}
            <section id="impact" className="bg-brand-dark py-24 px-6 relative overflow-hidden">
                <div className="relative z-10 max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 border-y border-white/10 py-16">
                        <AnimStat val="KES 2.4B+" label="Total Volume" num={2400} />
                        <AnimStat num={50000} suffix="+" label="Active Users" />
                        <AnimStat num={98} suffix="%" label="Approval Rate" />
                        <AnimStat num={47} label="Counties" />
                    </div>
                </div>
            </section>

            {/* ── PROCESS ── */}
            <section id="process" className="py-24 lg:py-32 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <p className="text-brand-primary font-black uppercase tracking-[0.3em] text-[10px] mb-3">Simple by Design</p>
                    <h2 className="text-4xl lg:text-5xl font-black text-brand-dark tracking-tighter">Three steps to capital.</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                    <Step num="01" title="Create Profile" desc="Set up your Newark ID with your KYC documents in under 3 minutes." />
                    <Step num="02" title="Instant Scoring" desc="Our AI engine returns a credit decision in real time." />
                    <Step num="03" title="Get Funded" desc="Funds hit your M-Pesa or bank within 60 seconds." />
                </div>
            </section>

            {/* ── CONTACT ── */}
            <section id="contact" className="py-24 lg:py-32 px-6 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-5xl font-black text-brand-dark tracking-tighter mb-6">Have an inquiry?</h2>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-brand-dark rounded-xl flex items-center justify-center text-brand-accent"><FiGlobe /></div>
                            <p className="font-black text-brand-dark uppercase text-sm">hq@newarkfrontiers.com</p>
                        </div>
                        <img src={IMGS.merchant} alt="Merchant" className="rounded-3xl w-full h-48 object-cover grayscale opacity-80" />
                    </div>
                    <form className="bg-brand-surface p-8 lg:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input type="text" placeholder="Full Name" className="w-full p-4 rounded-2xl border border-slate-200 outline-none focus:border-brand-primary" />
                            <input type="email" placeholder="Email" className="w-full p-4 rounded-2xl border border-slate-200 outline-none focus:border-brand-primary" />
                        </div>
                        <textarea placeholder="Message" rows={4} className="w-full p-4 rounded-2xl border border-slate-200 outline-none focus:border-brand-primary" />
                        <button className="w-full bg-brand-dark text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-primary">Send Message</button>
                    </form>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="bg-brand-dark py-12 px-6 text-white/30">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <span className="text-sm font-black uppercase tracking-widest text-white">NEWARK</span>
                    <p className="text-[10px] uppercase text-center">© 2026 Newark Frontiers. All Rights Reserved.</p>
                    <div className="flex gap-6 text-[10px] font-bold uppercase">
                        <a href="#">Privacy</a><a href="#">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;