'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Building2, Brain, Shield, Zap, ChevronRight, ArrowUpRight, Globe, Layers, Activity, Lock, Cpu, Database, Network } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import dynamic from 'next/dynamic'

const LandingMap = dynamic(() => import('@/components/map/LandingMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-[#0A0E17] flex items-center justify-center rounded-[3rem]">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
    ),
})

const features = [
    { icon: Building2, title: 'Asset Tokenization', desc: 'Convert physical real estate into institutional-grade ERC-721 digital assets.' },
    { icon: Brain, title: 'Neural Forecast', desc: 'Predictive urban growth modeling powered by multi-dimensional spatial data.' },
    { icon: Lock, title: 'On-Chain Ledger', desc: 'Immutable property history and title verification secured by Ethereum security.' },
    { icon: Activity, title: 'Real-Time Yield', desc: 'Interactive marketplace for automated liquidity and spatial efficiency.' },
]

/* ──────────────────────── COMPONENTS ──────────────────────── */

const SectionLabel = ({ text }: { text: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md"
    >
        <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{text}</span>
    </motion.div>
)

const GlassCard = ({ icon: Icon, title, desc, delay = 0 }: { icon: any, title: string, desc: string, delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay }}
        viewport={{ once: true }}
        className="group relative p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-700 overflow-hidden"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-500 group-hover:scale-110">
                <Icon size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">{desc}</p>
        </div>
    </motion.div>
)

export default function LandingPage() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const router = useRouter()
    const { user } = useAuthStore()

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    const opacityHero = useTransform(scrollYProgress, [0, 0.15], [1, 0])
    const scaleHero = useTransform(scrollYProgress, [0, 0.15], [1, 0.98])
    const yHero = useTransform(scrollYProgress, [0, 0.15], [0, -50])

    const springConfig = { damping: 25, stiffness: 150 }
    const mouseXSpring = useSpring(mousePos.x, springConfig)
    const mouseYSpring = useSpring(mousePos.y, springConfig)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e
            const { innerWidth, innerHeight } = window
            setMousePos({
                x: (clientX / innerWidth - 0.5) * 40,
                y: (clientY / innerHeight - 0.5) * 40
            })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    return (
        <div ref={containerRef} className="relative min-h-screen bg-[#07090F] text-white selection:bg-cyan-500/30 font-sans">

            {/* Cinematic Infrastructure Layers */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {/* Layer 1: Intelligence Grid */}
                <div className="absolute inset-0 bg-dot-grid-animated opacity-[0.15]" />

                {/* Layer 2: Moving Ambient Gradients */}
                <motion.div
                    animate={{
                        x: [0, 100, -100, 0],
                        y: [0, -50, 50, 0],
                        scale: [1, 1.2, 0.9, 1],
                        opacity: [0.05, 0.15, 0.05]
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-cyan-600/10 rounded-full blur-[160px]"
                />

                {/* Layer 3: Hero Core Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] hero-glow-radial opacity-40 mix-blend-screen" />

                {/* Parallax Depth Elements */}
                <motion.div
                    style={{ x: mouseXSpring, y: mouseYSpring }}
                    className="absolute inset-0 z-0"
                >
                    <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[20%] left-[5%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px]" />
                </motion.div>
            </div>

            {/* Navbar Refinement */}
            <nav className="fixed top-0 left-0 right-0 z-[100] h-20 flex items-center justify-between px-8 md:px-16 glass-navbar border-b border-white/5 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 cursor-pointer group relative z-10"
                >
                    <Image
                        src="/branding/logo-full.png"
                        alt="ArchNext"
                        width={140}
                        height={32}
                        className="object-contain hover:opacity-80 transition-opacity drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] mix-blend-lighten brightness-[1.2] contrast-[1.1]"
                        priority
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hidden lg:flex items-center gap-10 relative z-10"
                >
                    {[
                        { name: 'Intelligence Map', href: '/map' },
                        { name: 'Marketplace', href: '/marketplace' },
                        { name: 'Ecosystem', href: '/ecosystem' }
                    ].map((item, idx) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 hover:text-white transition-all relative group py-2"
                        >
                            <span className="relative z-10">{item.name}</span>
                            <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-cyan-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                        </Link>
                    ))}
                    <div className="w-[1px] h-4 bg-white/10 mx-2" />
                    <Link href="/docs" className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 hover:text-white flex items-center gap-2 group transition-all py-2">
                        Docs <ArrowUpRight size={14} className="text-cyan-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-6 relative z-10"
                >
                    <button onClick={() => router.push(user ? '/dashboard' : '/auth/signin')} className="text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-400 hover:text-cyan-300 transition-all">
                        {user ? 'DASHBOARD' : 'LOGIN'}
                    </button>
                    {!user && (
                        <button onClick={() => router.push('/auth/signin')} className="relative group px-8 py-2.5 rounded-full overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 bg-white text-black">
                            <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.3em]">DEPLOY PLATFORM</span>
                        </button>
                    )}
                </motion.div>
            </nav>

            <main className="relative z-10">

                {/* 1. HERO SECTION: CINEMATIC UPGRADE */}
                <section className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-20">
                    <motion.div
                        style={{ opacity: opacityHero, scale: scaleHero, y: yHero }}
                        className="max-w-7xl mx-auto text-center relative z-20"
                    >
                        <div className="relative mb-12">
                            <SectionLabel text="Spatial Protocol v1.0.2" />

                            <h1 className="text-[10vw] md:text-[9vw] lg:text-[8.5rem] font-black leading-[0.8] text-white flex flex-col items-center mt-6">
                                <motion.span
                                    initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                    className="block tracking-[-0.02em] md:tracking-[-0.03em] lg:tracking-[-0.04em]"
                                >
                                    The intelligent
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    transition={{ delay: 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                    className="premium-gradient-text block pb-6 tracking-[-0.04em] md:tracking-[-0.05em] lg:tracking-[-0.06em] drop-shadow-[0_0_50px_rgba(14,165,233,0.4)]"
                                >
                                    layer for cities.
                                </motion.span>
                            </h1>

                            {/* Refined Animated Radial Glow */}
                            <motion.div
                                animate={{
                                    opacity: [0.2, 0.4, 0.2],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[120%] h-[150%] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none"
                            />
                        </div>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 1 }}
                            className="text-lg md:text-xl lg:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 font-medium leading-relaxed tracking-tight"
                        >
                            Synthesizing real-time urban spatial data with blockchain transparency.
                            The <span className="text-white">new infrastructure</span> for institutional real estate liquidity.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 1 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-8"
                        >
                            <button onClick={() => router.push(user ? '/dashboard' : '/auth/signin')} className="group relative px-12 py-5 rounded-full bg-white text-black text-[11px] font-black uppercase tracking-[0.35em] overflow-hidden transition-all duration-700 hover:shadow-[0_0_60px_rgba(255,255,255,0.3)]">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                <span className="relative z-10 flex items-center gap-2 group-hover:gap-4 transition-all duration-500">
                                    Deploy Platform <ChevronRight size={18} />
                                </span>
                            </button>
                            <button onClick={() => router.push(user ? '/map' : '/auth/signin')} className="group relative px-12 py-5 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md text-white text-[11px] font-black uppercase tracking-[0.35em] transition-all duration-500 hover:bg-white/[0.08] hover:border-white/20">
                                <div className="absolute inset-0 rounded-full p-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <span className="relative z-10">Enter Smart Map</span>
                            </button>
                        </motion.div>
                    </motion.div>

                    {/* Intentional Floating Elements */}
                    <motion.div
                        animate={{ y: [0, -20, 0], rotate: [12, 15, 12] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-1/4 right-[10%] w-40 h-40 rounded-[2.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-2xl flex flex-col items-center justify-center hidden 2xl:flex shadow-2xl"
                    >
                        <Activity size={44} className="text-cyan-500/40 mb-3" />
                        <div className="w-16 h-1.5 bg-cyan-500/10 rounded-full overflow-hidden">
                            <motion.div
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="w-1/2 h-full bg-cyan-500/40"
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 20, 0], rotate: [-6, -10, -6] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute top-1/3 left-[8%] w-32 h-32 rounded-[2rem] border border-white/5 bg-white/[0.01] backdrop-blur-2xl flex items-center justify-center hidden 2xl:flex shadow-2xl"
                    >
                        <Shield size={36} className="text-purple-500/30" />
                    </motion.div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2, duration: 1 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
                    >
                        <motion.span
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-[10px] font-black text-slate-500 uppercase tracking-[0.8em]"
                        >
                            System_Scan
                        </motion.span>
                        <div className="w-[1.5px] h-20 relative overflow-hidden rounded-full">
                            <div className="absolute inset-0 bg-white/10" />
                            <motion.div
                                animate={{ y: ['-100%', '100%'] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee]"
                            />
                        </div>
                    </motion.div>
                </section>

                {/* 2. AI INTELLIGENCE VISUALIZATION */}
                <section className="relative min-h-screen py-32 px-8 flex flex-col items-center justify-center">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1 }}
                            viewport={{ once: true }}
                        >
                            <SectionLabel text="Cognitive Architecture" />
                            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-10">
                                Neural Forecast <br />
                                <span className="premium-gradient-text">Engine v4.</span>
                            </h2>
                            <p className="text-xl text-slate-400 mb-14 font-medium leading-relaxed max-w-xl">
                                Our platform ingests millions of urban data points—from infrastructure permits
                                to real-time traffic flux—to predict spatial efficiency and investment yield.
                            </p>

                            <div className="grid grid-cols-2 gap-12">
                                {[
                                    { label: 'Network Nodes', val: '14,209' },
                                    { label: 'Forecast Alpha', val: '+12.4%' }
                                ].map((stat) => (
                                    <div key={stat.label}>
                                        <div className="text-4xl font-black text-white mb-2 tracking-tighter">{stat.val}</div>
                                        <div className="text-[10px] font-bold text-cyan-500/80 uppercase tracking-[0.2em]">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 1.2 }}
                            viewport={{ once: true }}
                            className="relative group"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
                            <div className="glass-panel p-1 border-white/10 rounded-[3rem] overflow-hidden">
                                <div className="bg-[#07090F]/80 rounded-[2.9rem] p-12 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-scan z-20" />
                                    <div className="grid grid-cols-6 gap-3 h-64 items-end">
                                        {[60, 85, 45, 95, 70, 80, 55, 90, 65, 75, 50, 85].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                whileInView={{ height: `${h}%` }}
                                                transition={{ delay: i * 0.05, duration: 1 }}
                                                className="w-full bg-gradient-to-t from-cyan-500/20 to-cyan-500/60 rounded-t-lg relative group/bar"
                                            >
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-bold text-cyan-400 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                                    {h}%
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="mt-12 flex items-center justify-between">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                                <Cpu className="text-cyan-400" size={20} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Processor</div>
                                                <div className="text-xs font-bold text-white tracking-tight">X-Neural Core</div>
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-black text-cyan-500 animate-pulse tracking-widest">
                                            LIVE_CALCULATION...
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* 3. BLOCKCHAIN OWNERSHIP SYSTEM */}
                <section className="relative min-h-screen py-32 px-8 border-y border-white/[0.03]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                        <SectionLabel text="Settlement Architecture" />
                        <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] mb-12">
                            The Immutable <br /> <span className="premium-gradient-text">Ownership Ledger.</span>
                        </h2>
                        <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-24 font-medium leading-relaxed">
                            Every asset is tokenized as a unique institutional-grade NFT.
                            Ensuring sovereign title history, instant verification, and friction-less settlement.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                            {[
                                { icon: Database, title: 'Title Registry', desc: 'Secure blockchain verification for every property title.' },
                                { icon: Network, title: 'Fractional Pools', desc: 'Liquidity layers for institutional-grade asset distribution.' },
                                { icon: Shield, title: 'Smart Escrow', desc: 'Automated, trustless settlement for high-value transactions.' },
                                { icon: Zap, title: 'Instant Yield', desc: 'Real-time revenue distribution via programmed smart contracts.' },
                            ].map((f, i) => (
                                <GlassCard key={f.title} {...f} delay={i * 0.1} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. SMART CITY MAP PREVIEW */}
                <section className="relative min-h-screen py-32 px-8 bg-white/[0.01]">
                    <div className="max-w-7xl mx-auto flex flex-col items-center">
                        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1 }}
                                viewport={{ once: true }}
                                className="order-2 lg:order-1 relative group"
                            >
                                <div className="absolute -inset-4 bg-cyan-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition duration-1000" />
                                <div className="glass-panel p-2 rounded-[3.5rem] border-white/10 relative overflow-hidden">
                                    <div className="aspect-[4/3] rounded-[3rem] border border-white/5 relative overflow-hidden">
                                        <LandingMap />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1 }}
                                viewport={{ once: true }}
                                className="order-1 lg:order-2"
                            >
                                <SectionLabel text="Spatial Interface" />
                                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-10">
                                    The Multi-Scale <br />
                                    <span className="premium-gradient-text">City Explorer.</span>
                                </h2>
                                <p className="text-xl text-slate-400 mb-14 font-medium leading-relaxed">
                                    A real-time geospatial operating system. Visualize ownership layers,
                                    regulatory boundaries, and predicted growth vectors in a single unified canvas.
                                </p>
                                <Link href="/map">
                                    <button className="group flex items-center gap-4 text-sm font-black uppercase tracking-[0.3em] text-white hover:text-cyan-400 transition-colors">
                                        Launch Explorer <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </button>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* 5. ECOSYSTEM FINAL CTA */}
                <section className="relative py-48 px-8">
                    <div className="absolute inset-0 bg-circuit-grid opacity-[0.03] pointer-events-none" />
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="max-w-4xl mx-auto text-center relative z-10"
                    >
                        <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-16">
                            Construct the <br /> <span className="premium-gradient-text">future city.</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
                            <button
                                onClick={() => router.push(user ? '/dashboard' : '/auth/signin')}
                                className="px-14 py-6 rounded-full bg-white text-black text-xs font-black uppercase tracking-[0.4em] shadow-[0_0_80px_rgba(255,255,255,0.2)] hover:shadow-[0_0_100px_rgba(255,255,255,0.4)] transition-all duration-500 hover:scale-105 active:scale-95"
                            >
                                Access Protocol
                            </button>
                            <Link href="/ecosystem">
                                <button className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-colors">
                                    Explore Ecosystem
                                </button>
                            </Link>
                        </div>

                        <div className="mt-24 flex items-center justify-center gap-12 text-slate-600 font-bold uppercase tracking-[0.3em] text-[10px]">
                            <span className="flex items-center gap-2 transition-colors hover:text-slate-400 cursor-default"><Globe size={14} /> Global Node Network</span>
                            <span className="flex items-center gap-2 transition-colors hover:text-slate-400 cursor-default"><Layers size={14} /> Modular Architecture</span>
                        </div>
                    </motion.div>
                </section>

            </main>

            {/* Footer */}
            <footer className="relative py-24 px-16 border-t border-white/5 bg-[#05070A]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center gap-3 group cursor-pointer mb-2">
                            <Image
                                src="/branding/logo-full.png"
                                alt="ArchNext"
                                width={180}
                                height={40}
                                className="object-contain opacity-80 group-hover:opacity-100 transition-opacity mix-blend-lighten brightness-[1.2]"
                            />
                        </div>
                        <p className="text-sm text-slate-600 max-w-xs font-medium leading-relaxed">
                            Architecting the next generation of institutional urban intelligence and asset ownership.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
                        <div className="flex flex-col gap-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Platform</span>
                            <div className="flex flex-col gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                                <Link href="/map" className="hover:text-cyan-400 transition-colors">Intelligence Map</Link>
                                <Link href="/marketplace" className="hover:text-cyan-400 transition-colors">Marketplace</Link>
                                <Link href="/ecosystem" className="hover:text-cyan-400 transition-colors">Ecosystem</Link>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Resources</span>
                            <div className="flex flex-col gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                                <Link href="/docs" className="hover:text-cyan-400 transition-colors">Documentation</Link>
                                <a href="#" className="hover:text-cyan-400 transition-colors">API Reference</a>
                                <a href="#" className="hover:text-cyan-400 transition-colors">Audit Report</a>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Company</span>
                            <div className="flex flex-col gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                                <a href="#" className="hover:text-cyan-400 transition-colors">VPC Access</a>
                                <a href="#" className="hover:text-cyan-400 transition-colors">Contact</a>
                                <a href="#" className="hover:text-cyan-400 transition-colors">Legal</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/[0.03] flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-700">
                        © 2026 ArchNext Infrastructure Platform. All Rights Reserved.
                    </div>
                    <div className="flex gap-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-700">
                        <span className="text-cyan-500/50">v1.0.2-STABLE</span>
                        <span>Built for the Polygon Network</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
