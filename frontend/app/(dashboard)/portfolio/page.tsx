'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Briefcase, TrendingUp, Building2,
    ArrowUpRight, ArrowDownRight, PieChart,
    History, Wallet, Target, Activity, Zap
} from 'lucide-react'
import { usePortfolioStore } from '@/store/portfolioStore'
import { formatCurrency, cn } from '@/lib/utils'

function AssetCard({ asset, index }: { asset: any, index: number }) {
    const gain = asset.current_value - asset.purchase_price
    const gainPct = ((gain / asset.purchase_price) * 100).toFixed(1)
    const isPositive = gain >= 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="group relative p-6 rounded-[2.5rem] glass-card border-white/[0.06] hover:border-cyan-500/30 transition-all duration-500 overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-start justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#0B0F1A] border border-white/[0.05] flex items-center justify-center shadow-xl group-hover:border-cyan-500/20 transition-colors relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent" />
                    <Building2 size={24} className="text-slate-500 group-hover:text-cyan-400 transition-colors relative z-10" />
                </div>
                {asset.is_nft && (
                    <span className="text-[9px] font-black px-2.5 py-1 rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 uppercase tracking-widest shadow-lg">NFT ASSET</span>
                )}
            </div>

            <div className="space-y-1.5 mb-8">
                <h3 className="text-lg font-black text-white truncate tracking-tight group-hover:text-cyan-50 transition-colors">{asset.title || 'Institutional Node'}</h3>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    <p className="text-xs font-bold text-slate-500 group-hover:text-slate-400 transition-colors uppercase tracking-tight">
                        {asset.area || (typeof asset.location === 'string' ? asset.location : 'KOLKATA NETWORK')}
                    </p>
                </div>
            </div>

            <div className="flex items-end justify-between pt-6 border-t border-white/[0.04]">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Live Valuation</p>
                    <p className="text-2xl font-black text-white tracking-tighter group-hover:text-cyan-400 transition-colors">
                        {formatCurrency(asset.current_value || 0)}
                    </p>
                </div>
                <div className={cn(
                    "flex flex-col items-end gap-1.5 px-4 py-2 rounded-2xl border transition-all duration-500",
                    isPositive ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-rose-500/5 border-rose-500/10 text-rose-400'
                )}>
                    <div className="flex items-center gap-1 text-[11px] font-black tracking-widest uppercase">
                        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {gainPct}%
                    </div>
                </div>
            </div>

            {asset.ai_growth_prediction && (
                <div className="mt-6 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between group-hover:bg-blue-500/10 transition-colors">
                    <div className="flex items-center gap-3">
                        <Zap size={14} className="text-blue-400" />
                        <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">AI Forecast</span>
                    </div>
                    <span className="text-xs font-black text-blue-400">+{asset.ai_growth_prediction}% YOY</span>
                </div>
            )}
        </motion.div>
    )
}

export default function PortfolioPage() {
    const { assets, total_current_value, total_invested, fetchPortfolio, loading } = usePortfolioStore()

    useEffect(() => { fetchPortfolio() }, [])

    const totalGain = total_current_value - total_invested
    const totalGainPct = total_invested > 0 ? ((totalGain / total_invested) * 100).toFixed(1) : '0'
    const isPositive = totalGain >= 0

    const mainStats = [
        { label: 'Network Assets', value: formatCurrency(total_current_value), icon: Briefcase, color: 'text-white' },
        { label: 'Capital Deployed', value: formatCurrency(total_invested), icon: Wallet, color: 'text-slate-400' },
        { label: 'Aggregate Return', value: `${isPositive ? '+' : ''}${formatCurrency(totalGain)}`, icon: TrendingUp, color: isPositive ? 'text-emerald-400' : 'text-rose-400', secondary: `${totalGainPct}% Total ROI` },
    ]

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 px-2">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] animate-pulse" />
                        <span className="text-[11px] font-black text-cyan-500 uppercase tracking-[0.3em]">Institutional Portfolio</span>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black text-white tracking-tighter text-gradient leading-none">Intelligence Hub</h1>
                        <p className="text-slate-400 max-w-xl text-lg font-medium">Detailed synthesis of your global on-chain urban asset portfolio and predictive yield analytics.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="glass-panel px-6 py-3.5 rounded-2xl flex items-center gap-4 border-white/[0.04] shadow-2xl">
                        <History size={16} className="text-slate-500" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Update: Just Now</span>
                    </div>
                </div>
            </div>

            {/* Top Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {mainStats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                        className="group p-8 rounded-[2.5rem] glass-card border-white/[0.06] hover:border-cyan-500/20 transition-all duration-500 overflow-hidden relative"
                    >
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/[0.02] blur-3xl rounded-full" />

                        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:border-cyan-500/30 transition-all duration-500">
                            <stat.icon size={20} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
                        </div>

                        <div className="space-y-2 relative z-10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                            {loading ? (
                                <div className="h-10 w-40 bg-white/[0.03] rounded-xl animate-shimmer relative overflow-hidden" />
                            ) : (
                                <div className="space-y-1">
                                    <h3 className={cn("text-3xl font-black tracking-tighter glow-text", stat.color)}>
                                        {stat.value}
                                    </h3>
                                    {stat.secondary && (
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{stat.secondary}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Interactive Growth Line (Decorative) */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                    </motion.div>
                ))}
            </div>

            {/* Asset Performance View */}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                            <PieChart size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Active Holdings</h2>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{assets.length} NODES IDENTIFIED</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Activity size={14} className="text-emerald-500" />
                            Efficiency: 98.2%
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-[320px] rounded-[2.5rem] glass-panel bg-white/[0.02] animate-pulse relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-shimmer" />
                            </div>
                        ))}
                    </div>
                ) : assets.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-40 glass-panel rounded-[3rem] border-dashed border-white/[0.06] bg-[#05070A]/50"
                    >
                        <div className="w-24 h-24 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-8 relative">
                            <Briefcase size={40} className="text-slate-800" />
                            <div className="absolute inset-[-8px] border border-cyan-500/10 rounded-[2.5rem] animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-300 tracking-tight">Zero Network Holdings</h2>
                        <p className="text-slate-500 mt-2 max-w-xs text-center font-medium">Initialize your capital deployment via the marketplace to begin tracking assets.</p>
                        <button className="mt-10 px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-700 text-[10px] font-black text-white uppercase tracking-[0.3em] shadow-2xl hover:-translate-y-1 transition-all">
                            Explore Marketplace
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {assets.map((asset: any, i: number) => <AssetCard key={asset.id || i} asset={asset} index={i} />)}
                    </div>
                )}
            </div>

            {/* Bottom Insight Card */}
            <div className="glass-panel p-10 rounded-[3rem] border-white/[0.06] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[40%] h-full bg-cyan-600/5 blur-[120px] rounded-full" />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 relative z-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Target size={20} className="text-cyan-400" />
                            <h2 className="text-2xl font-black text-white tracking-tight">Network Intelligence Insight</h2>
                        </div>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed">
                            Your portfolio currently exhibits a <span className="text-cyan-400">highly optimized spatial distribution</span> in Kolkata Zone 1. Based on aggregate AI signals, a liquidity rotation towards Zone 2 is projected within the next 14 cycles.
                        </p>
                        <div className="flex items-center gap-6 pt-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Confidence Index</p>
                                <p className="text-xl font-black text-white">94.8%</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Risk Factor</p>
                                <p className="text-xl font-black text-emerald-400">LOW</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center xl:justify-end">
                        <div className="relative w-full max-w-[300px] aspect-square">
                            <div className="absolute inset-0 bg-cyan-500/10 blur-3xl rounded-full animate-pulse-glow" />
                            <div className="absolute inset-0 border-[10px] border-white/[0.03] rounded-full" />
                            <div className="absolute inset-0 border-[10px] border-cyan-500/20 rounded-full border-t-cyan-500 animate-[spin_8s_linear_infinite]" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">AGGREGATE SCORE</p>
                                <p className="text-6xl font-black text-white tracking-tighter glow-text">9.2</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

