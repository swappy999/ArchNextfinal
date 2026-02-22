'use client'

import { motion } from 'framer-motion'
import { Terminal, Code, Book, Hash, Share2, Shield, Search, Copy, Check } from 'lucide-react'
import { useState } from 'react'

const sections = [
    {
        id: 'introduction',
        title: 'Introduction',
        content: 'ArchNext is an institutional-grade protocol for urban spatial intelligence and real estate tokenization. It provides a unified API and blockchain infrastructure for developers to build next-generation urban applications.'
    },
    {
        id: 'core-concepts',
        title: 'Core Concepts',
        content: 'The platform operates on three primary layers: Spatial Intelligence (AI), On-chain Settlement (Blockchain), and Global Urban Data. Every property is represented as an ERC-721 token on the Polygon network, ensuring immutable title history and instant liquidity.'
    },
    {
        id: 'getting-started',
        title: 'Getting Started',
        content: 'To begin building with ArchNext, you will need an API key and a wallet connection. Our SDK supports TypeScript, Python, and Go for seamless integration into existing infrastructure.'
    },
    {
        id: 'smart-contracts',
        title: 'Smart Contracts',
        content: 'Our core contracts are audited and open-source. The PropertyNFT contract handles asset minting, while PropertyMarketplace manages the order book and settlement logic.'
    }
]

export default function DocsPage() {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText('npm install @archnext/sdk')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="min-h-screen bg-[#07090F] text-white selection:bg-cyan-500/30 font-sans">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-dot-grid opacity-[0.05]" />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-600/[0.03] rounded-full blur-[160px]" />
            </div>

            <div className="relative z-10 flex min-h-screen">
                {/* Sidebar Navigation */}
                <aside className="hidden lg:flex flex-col w-72 border-r border-white/5 pt-32 px-8 sticky top-0 max-h-screen overflow-y-auto">
                    <div className="flex items-center gap-3 mb-12">
                        <Book className="text-cyan-500" size={18} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Documentation</span>
                    </div>

                    <nav className="space-y-8">
                        <div>
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-6 block">Foundation</span>
                            <div className="space-y-4 flex flex-col">
                                {sections.map(s => (
                                    <a key={s.id} href={`#${s.id}`} className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">
                                        {s.title}
                                    </a>
                                ))}
                            </div>
                        </div>
                        <div>
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-6 block">API Reference</span>
                            <div className="space-y-4 flex flex-col">
                                <a href="#" className="text-[11px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Authentication</a>
                                <a href="#" className="text-[11px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Spatial Queries</a>
                                <a href="#" className="text-[11px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">NFT Minting</a>
                            </div>
                        </div>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 pt-32 pb-24 px-8 md:px-16 lg:px-24 max-w-5xl">
                    <header className="mb-20">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20"
                        >
                            <Terminal size={12} className="text-cyan-400" />
                            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Developer Beta v0.9</span>
                        </motion.div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6">Documentation</h1>
                        <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-2xl">
                            The technical blueprint for building on the ArchNext infrastructure.
                            Learn how to integrate urban intelligence into your decentralized applications.
                        </p>
                    </header>

                    {/* Quick Start Code Block */}
                    <section className="mb-24">
                        <div className="glass-panel border-white/5 rounded-2xl overflow-hidden relative">
                            <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-rose-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Terminal — archnext-sdk</span>
                                </div>
                                <button onClick={handleCopy} className="text-slate-500 hover:text-white transition-colors">
                                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                </button>
                            </div>
                            <div className="p-8 font-mono text-sm">
                                <span className="text-cyan-500">$</span> <span className="text-white">npm install @archnext/sdk</span>
                                <div className="mt-2 text-slate-600"># Initializing the urban spatial protocol...</div>
                            </div>
                        </div>
                    </section>

                    {/* Content Sections */}
                    <div className="space-y-32">
                        {sections.map((section) => (
                            <motion.section
                                key={section.id}
                                id={section.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="scroll-mt-32"
                            >
                                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-4">
                                    <span className="text-cyan-500">#</span> {section.title}
                                </h2>
                                <div className="prose prose-invert max-w-none">
                                    <p className="text-slate-400 text-lg leading-relaxed font-medium mb-12">
                                        {section.content}
                                    </p>
                                </div>

                                {section.id === 'smart-contracts' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                                        <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-6 text-slate-400 group-hover:text-cyan-400 transition-colors">
                                                <Share2 size={20} />
                                            </div>
                                            <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-widest">PropertyNFT.sol</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed font-medium">Verified contract for ERC-721 property minting.</p>
                                        </div>
                                        <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-6 text-slate-400 group-hover:text-cyan-400 transition-colors">
                                                <Shield size={20} />
                                            </div>
                                            <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-widest">Verification.sol</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed font-medium">On-chain validation for urban data authenticity.</p>
                                        </div>
                                    </div>
                                )}
                            </motion.section>
                        ))}
                    </div>

                    {/* Footer for Docs */}
                    <footer className="mt-48 pt-12 border-t border-white/5 flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        <span>Last updated: Feb 21, 2026</span>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-white transition-colors">GitHub</a>
                            <a href="#" className="hover:text-white transition-colors">Discord</a>
                        </div>
                    </footer>
                </main>

                {/* Right Sidebar: On this page */}
                <aside className="hidden xl:flex flex-col w-64 pt-32 px-8 sticky top-0 max-h-screen overflow-y-auto">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-6 block">On this page</span>
                    <div className="space-y-4 flex flex-col">
                        {sections.map(s => (
                            <a key={s.id} href={`#${s.id}`} className="text-[10px] font-bold text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-widest border-l border-white/5 pl-4 hover:border-cyan-500/50">
                                {s.title}
                            </a>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    )
}
