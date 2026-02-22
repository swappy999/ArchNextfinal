'use client'

import { motion } from 'framer-motion'
import { Cpu, Database, Network, Globe, Shield, Zap, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

const layers = [
    {
        icon: Cpu,
        title: 'AI Intelligence Layer',
        subtitle: 'The Neural Core',
        desc: 'Advanced predictive modeling using multi-dimensional spatial data. Our proprietary X-Neural engine forecasts urban growth vectors and property yield with institutional precision.',
        features: ['Real-time Urban Flux Analysis', 'Predictive Yield Modeling', 'Regulatory Boundary Forecasting'],
        color: 'cyan'
    },
    {
        icon: Network,
        title: 'Blockchain Layer',
        subtitle: 'The Trustless Settlement',
        desc: 'Immutable asset tokenization on the Polygon network. Secured by Ethereum security, our smart contracts manage fractional ownership, instant settlement, and automated revenue distribution.',
        features: ['ERC-721 Property Tokens', 'Modular Liquidity Pools', 'Programmable Smart Escrows'],
        color: 'purple'
    },
    {
        icon: Database,
        title: 'Urban Data Layer',
        subtitle: 'The Ground Truth',
        desc: 'Integrated geospatial data streams from municipal infrastructure, commercial zoning, and satellite telemetry. A unified data fabric for the modern smart city.',
        features: ['Infrastructure Telemetry', 'Zoning Change Monitoring', 'Satellite Land-Use Analysis'],
        color: 'blue'
    }
]

export default function EcosystemPage() {
    return (
        <div className="min-h-screen bg-[#07090F] text-white selection:bg-cyan-500/30 pt-32 pb-24 px-8 md:px-16 font-sans">
            {/* Background Layers */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-dot-grid-animated opacity-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-cyan-600/5 rounded-full blur-[160px]" />
            </div>

            <main className="max-w-7xl mx-auto relative z-10">
                {/* Hero */}
                <header className="mb-32 text-center md:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md"
                    >
                        <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Network Architecture</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] text-white mb-10">
                        The <span className="premium-gradient-text">Integrated</span> <br />
                        Infrastructure.
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl font-medium leading-relaxed">
                        ArchNext is a modular ecosystem synthesizing spatial intelligence with on-chain settlement.
                        A vertical stack built for the next century of institutional urban investment.
                    </p>
                </header>

                {/* Architecture Diagram Visualization */}
                <section className="mb-48 relative">
                    <div className="absolute -inset-20 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
                    <div className="glass-panel p-12 md:p-24 rounded-[4rem] border-white/5 relative overflow-hidden flex flex-col items-center">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

                        {/* Interactive Stack Visualization */}
                        <div className="space-y-4 w-full max-w-3xl">
                            {layers.map((layer, i) => (
                                <motion.div
                                    key={layer.title}
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.2, duration: 1 }}
                                    viewport={{ once: true }}
                                    className="group relative p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-700 flex flex-col md:flex-row items-center gap-8 text-center md:text-left"
                                >
                                    <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-110 transition-transform duration-500 ${layer.color === 'cyan' ? 'text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)]' : layer.color === 'purple' ? 'text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]'}`}>
                                        <layer.icon size={32} strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{layer.subtitle}</div>
                                        <h3 className="text-xl font-bold text-white mb-2">{layer.title}</h3>
                                        <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xl">{layer.desc}</p>
                                    </div>
                                    <div className="hidden lg:flex flex-col gap-2 items-end">
                                        {layer.features.map(f => (
                                            <div key={f} className="text-[9px] font-black text-slate-600 uppercase tracking-widest border border-white/5 px-3 py-1 rounded-md">{f}</div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Ecosystem Features Grid */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-48">
                    {[
                        { title: 'Global Node Network', icon: Globe, desc: 'Decentralized data verification across 40+ urban centers worldwide.' },
                        { title: 'Security Protocol', icon: Shield, desc: 'Multi-layer auditing and cryptographic proof for all on-chain assets.' },
                        { title: 'Liquidity Bridge', icon: Zap, desc: 'Seamless integration with DeFi protocols for automated secondary trading.' }
                    ].map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="text-center md:text-left"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 text-slate-400 mx-auto md:mx-0">
                                <f.icon size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-[0.2em] text-[12px]">{f.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed font-medium">{f.desc}</p>
                        </motion.div>
                    ))}
                </section>

                {/* CTA */}
                <section className="text-center py-24 border-t border-white/5">
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-12">Initialize with the protocol.</h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                        <Link href="/signup">
                            <button className="px-12 py-5 rounded-full bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all">
                                Deploy Instance
                            </button>
                        </Link>
                        <Link href="/docs">
                            <button className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-colors">
                                View Documentation <ArrowUpRight size={16} />
                            </button>
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    )
}
