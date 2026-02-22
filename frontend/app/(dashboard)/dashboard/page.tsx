'use client'

import { motion } from 'framer-motion'
import {
    TrendingUp, Building2, ShoppingBag, Brain,
    ArrowUpRight, ArrowRight, Activity, Zap,
    Globe, ShieldCheck, BarChart3, Fingerprint,
    Cpu, Layers, Network, ScanLine, MapPin,
    Bell, Clock, Flame, Eye, DiamondIcon,
    ChevronRight, Wallet, CheckCircle2, Tag, Truck
} from 'lucide-react'
import Link from 'next/link'
import { usePropertyStore } from '@/store/propertyStore'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useMarketplaceStore } from '@/store/marketplaceStore'
import { useEffect, useState } from 'react'
import { formatCurrency, cn } from '@/lib/utils'

/* ──────────────────────── ANIMATION PRESET ──────────────────────── */
const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: d, duration: 0.55, ease: [0.22, 0.8, 0.36, 1] },
})

/* ──────────────────────── MINI CHART ──────────────────────── */
function MiniChart({ data, color = '#0ea5e9', height = 60 }: { data: number[]; color?: string; height?: number }) {
    const max = Math.max(...data)
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * 100
        const y = height - (v / max) * height
        return `${x},${y}`
    }).join(' ')
    return (
        <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="overflow-visible">
            <defs>
                <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
            <polygon fill={`url(#grad-${color.replace('#', '')})`} points={`0,${height} ${points} 100,${height}`} />
        </svg>
    )
}

/* ──────────────────────── SPARKLINE BARS ──────────────────────── */
function SparkBars({ values, color = 'bg-cyan-500' }: { values: number[]; color?: string }) {
    return (
        <div className="flex items-end gap-[3px] h-10">
            {values.map((v, i) => (
                <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${v * 100}%` }}
                    transition={{ delay: i * 0.04, duration: 0.6 }}
                    className={cn("flex-1 rounded-t-sm", color)}
                    style={{ opacity: 0.35 + v * 0.65 }}
                />
            ))}
        </div>
    )
}

/* ──────────────────────── WIDGET WRAPPER ──────────────────────── */
function Widget({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    return (
        <motion.div
            {...fadeUp(delay)}
            className={cn(
                "relative group rounded-[1.5rem] border border-white/[0.06] bg-[#0d1117]/80 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-cyan-500/20",
                className,
            )}
        >
            {/* Top edge glow on hover */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {children}
        </motion.div>
    )
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
    const { properties, fetchProperties, loading: pLoading } = usePropertyStore()
    const { total_current_value, total_invested, assets, fetchPortfolio, loading: portLoading } = usePortfolioStore()
    const { listings, fetchListings, loading: mLoading } = useMarketplaceStore()

    useEffect(() => {
        fetchProperties()
        fetchPortfolio()
        fetchListings()
    }, [])

    const portfolioValue = total_current_value || 1_245_000
    const investmentScore = 8.7
    const growthPercent = 12

    /* ────── MOCK DATA for demo visuals ────── */
    const chartData = [20, 45, 30, 55, 40, 65, 50, 70, 60, 80, 72, 90]
    const alerts = [
        { icon: Truck, text: 'Metro line extension approved', time: '10 min ago', color: 'text-blue-400' },
        { icon: Flame, text: 'Growth spike in Sector V', time: '20 min ago', color: 'text-amber-400' },
        { icon: MapPin, text: 'New tech hub development nearby', time: '1 hr ago', color: 'text-emerald-400' },
    ]
    const nftCards = [
        { name: 'Modern Loft', eth: '2.5', price: '$7,300', img: '🏙️' },
        { name: 'Skyline Penthouse', eth: '3.1', price: '$9,800', img: '🌆' },
    ]
    const timelineSteps = ['Minted', 'Verified', 'Listed', 'Sold']

    return (
        <div className="space-y-6">
            {/* ─── BENTO GRID ─── */}
            <div className="grid grid-cols-12 gap-5 auto-rows-min">

                {/* ╔═══════════════════════════════════════════════════╗
                   ║  1. SMARTCITY DASHBOARD  (spans 5 cols, 2 rows)  ║
                   ╚═══════════════════════════════════════════════════╝ */}
                <Widget className="col-span-12 lg:col-span-5 row-span-2 p-0" delay={0}>
                    {/* City Image BG */}
                    <div className="relative h-48 bg-gradient-to-br from-cyan-900/30 via-slate-900 to-indigo-900/30 overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22f%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23f)%22%2F%3E%3C%2Fsvg%3E')] opacity-5" />
                        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-[#0d1117] to-transparent" />

                        {/* Title Overlay */}
                        <div className="absolute top-5 left-6 z-10">
                            <h2 className="text-lg font-black text-white tracking-tight">SmartCity Dashboard</h2>
                        </div>

                        {/* Portfolio Value Card */}
                        <div className="absolute bottom-4 left-6 z-10">
                            <div className="glass-panel rounded-2xl px-5 py-3">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Portfolio Value</p>
                                <h3 className="text-2xl font-black text-white tracking-tight">{formatCurrency(portfolioValue)}</h3>
                            </div>
                        </div>

                        {/* AI Investment Score Card */}
                        <div className="absolute bottom-4 right-6 z-10">
                            <div className="glass-panel rounded-2xl px-5 py-3 flex items-center gap-4">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Investment Score</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-black text-white">{investmentScore}</span>
                                        <span className="text-xs font-bold text-emerald-400">Excellent</span>
                                    </div>
                                </div>
                                <ArrowUpRight size={18} className="text-cyan-400" />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="p-6 space-y-4">
                        {/* Growth Heatmap mini */}
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Growth Heatmap</p>
                            <MiniChart data={chartData} color="#0ea5e9" height={50} />
                        </div>

                        {/* Trending Zones */}
                        <div className="flex items-center gap-3 pt-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                <Activity size={12} className="text-cyan-400" />
                                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Trending Zones</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <Zap size={12} className="text-amber-400" />
                                <span className="text-[10px] font-bold text-slate-300">Metro Expansion</span>
                                <ChevronRight size={12} className="text-slate-500" />
                            </div>
                        </div>
                    </div>
                </Widget>

                {/* ╔═══════════════════════════════════════════════════╗
                   ║  2. INTERACTIVE SMART MAP  (spans 7 cols, 2 rows) ║
                   ╚═══════════════════════════════════════════════════╝ */}
                <Widget className="col-span-12 lg:col-span-7 row-span-2" delay={0.1}>
                    <div className="p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-black text-white tracking-tight">Interactive Smart Map</h2>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                    <Globe size={12} />
                                    <span>Listings: <span className="text-white font-black">{properties.length || 258}</span></span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400">
                                    <TrendingUp size={12} />
                                    <span>Growth: +{growthPercent}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Map Placeholder with gradient */}
                        <Link href="/map" className="flex-1 relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0f1d32] to-[#0d1117] border border-white/[0.04] min-h-[220px] cursor-pointer group/map">
                            {/* Grid overlay */}
                            <div className="absolute inset-0 grid-bg opacity-30" />
                            {/* Heatmap glow spots */}
                            <div className="absolute top-[30%] left-[40%] w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl animate-pulse" />
                            <div className="absolute top-[50%] left-[60%] w-16 h-16 bg-blue-500/15 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
                            <div className="absolute top-[40%] left-[25%] w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />

                            {/* Layer toggles */}
                            <div className="absolute top-4 left-4 z-10 space-y-2">
                                {['Heatmap', 'Zones', 'Transit'].map((label, i) => (
                                    <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/[0.06]">
                                        <div className={cn("w-2 h-2 rounded-full", i === 0 ? 'bg-cyan-500' : i === 1 ? 'bg-purple-500' : 'bg-amber-500')} />
                                        <span className="text-[10px] font-bold text-slate-300">{label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* "Open Map" hover CTA */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover/map:opacity-100 transition-opacity z-10">
                                <div className="px-6 py-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 backdrop-blur-sm">
                                    <span className="text-xs font-black text-cyan-300 uppercase tracking-widest">Open Intelligence Map →</span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </Widget>

                {/* ╔═══════════════════════════════════════════════════╗
                   ║  3. AI PREDICTION INSIGHTS  (spans 4 cols)       ║
                   ╚═══════════════════════════════════════════════════╝ */}
                <Widget className="col-span-12 md:col-span-6 lg:col-span-4" delay={0.15}>
                    <div className="p-6 space-y-5">
                        <h2 className="text-lg font-black text-white tracking-tight">AI Prediction Insights</h2>

                        <div className="flex items-center gap-6">
                            <div>
                                <span className="text-4xl font-black text-emerald-400 tracking-tighter">+18%</span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Brain size={14} className="text-purple-400" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">High Confidence</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-emerald-400" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Low Risk</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-white/[0.06]" />

                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Cpu size={12} /> Future Growth Projection
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-3 text-xs font-bold text-slate-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                    Strong Infrastructure Development
                                </li>
                                <li className="flex items-center gap-3 text-xs font-bold text-slate-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Rising Market Demand
                                </li>
                            </ul>
                        </div>

                        <Link href="/prediction" className="block w-full py-3 rounded-xl bg-gradient-to-r from-purple-600/80 to-cyan-600/80 text-center text-[10px] font-black text-white uppercase tracking-[0.2em] hover:from-purple-500 hover:to-cyan-500 transition-all active:scale-[0.98]">
                            Run AI Forecast →
                        </Link>
                    </div>
                </Widget>

                {/* ╔═══════════════════════════════════════════════════╗
                   ║  4. NFT MARKETPLACE  (spans 4 cols)              ║
                   ╚═══════════════════════════════════════════════════╝ */}
                <Widget className="col-span-12 md:col-span-6 lg:col-span-4" delay={0.2}>
                    <div className="p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black text-white tracking-tight">NFT Marketplace</h2>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 rounded-lg bg-cyan-500/10 text-[10px] font-black text-cyan-400 uppercase tracking-wider border border-cyan-500/20">Buy</button>
                                <button className="px-3 py-1 rounded-lg bg-white/[0.03] text-[10px] font-black text-slate-400 uppercase tracking-wider border border-white/[0.06]">List for Sale</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {nftCards.map((card) => (
                                <div key={card.name} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-cyan-500/20 transition-colors group/card">
                                    {/* Card image area */}
                                    <div className="h-24 bg-gradient-to-br from-blue-900/40 to-indigo-900/40 flex items-center justify-center text-3xl relative">
                                        {card.img}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent" />
                                    </div>
                                    <div className="p-3 space-y-2">
                                        <p className="text-xs font-black text-white truncate">{card.name}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                                                <DiamondIcon size={10} /> {card.eth} ETH
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400">{card.price}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="flex-1 py-1.5 rounded-lg bg-cyan-500/10 text-[9px] font-black text-cyan-400 uppercase tracking-wider border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors">Buy</button>
                                            <button className="flex-1 py-1.5 rounded-lg bg-white/[0.03] text-[9px] font-black text-slate-400 uppercase tracking-wider border border-white/[0.06] hover:bg-white/[0.06] transition-colors">List</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link href="/marketplace" className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors py-2">
                            View All Listings <ArrowRight size={12} />
                        </Link>
                    </div>
                </Widget>

                {/* ╔═══════════════════════════════════════════════════╗
                   ║  5. PORTFOLIO OVERVIEW  (spans 4 cols)           ║
                   ╚═══════════════════════════════════════════════════╝ */}
                <Widget className="col-span-12 md:col-span-6 lg:col-span-4" delay={0.25}>
                    <div className="p-6 space-y-5">
                        <h2 className="text-lg font-black text-white tracking-tight">Portfolio Overview</h2>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <BarChart3 size={14} className="text-cyan-400" />
                                <span className="text-[10px] font-bold text-slate-400">Total Value</span>
                            </div>
                            <span className="text-xl font-black text-white tracking-tight">{formatCurrency(portfolioValue)}</span>
                            <span className="text-xs font-bold text-emerald-400">→ {formatCurrency(portfolioValue * 1.12)}</span>
                        </div>

                        {/* Chart */}
                        <div className="h-[90px]">
                            <MiniChart data={[30, 40, 35, 55, 48, 60, 52, 75, 68, 80, 72, 95]} color="#22d3ee" height={90} />
                        </div>

                        {/* Asset Breakdown */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Breakdown</p>
                            {[
                                { label: 'Residential', pct: 55, color: 'bg-cyan-500' },
                                { label: 'Commercial', pct: 30, color: 'bg-purple-500' },
                                { label: 'Land', pct: 15, color: 'bg-slate-500' },
                            ].map((a) => (
                                <div key={a.label} className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-slate-400 w-20">{a.label}</span>
                                    <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${a.pct}%` }}
                                            transition={{ delay: 0.5, duration: 1 }}
                                            className={cn("h-full rounded-full", a.color)}
                                        />
                                    </div>
                                    <span className="text-[10px] font-black text-white w-8 text-right">{a.pct}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Widget>

                {/* ╔═══════════════════════════════════════════════════╗
                   ║  6. LIVE ALERTS FEED  (spans 4 cols)             ║
                   ╚═══════════════════════════════════════════════════╝ */}
                <Widget className="col-span-12 md:col-span-6 lg:col-span-4" delay={0.3}>
                    <div className="p-6 space-y-4">
                        {/* Urban Intel Feed */}
                        <div className="space-y-4 mb-2">
                            <MiniChart data={[10, 30, 25, 50, 35, 60, 55, 80, 65, 75]} color="#a855f7" height={40} />
                        </div>

                        {alerts.map((alert, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors cursor-pointer group/alert">
                                <alert.icon size={16} className={alert.color} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-200 truncate group-hover/alert:text-white transition-colors">{alert.text}</p>
                                </div>
                                <span className="text-[9px] font-bold text-slate-500 shrink-0">{alert.time}</span>
                                <ChevronRight size={12} className="text-slate-600 shrink-0" />
                            </div>
                        ))}
                    </div>
                </Widget>

                {/* ╔═══════════════════════════════════════════════════╗
                   ║  7. SMART ALERTS  (spans 4 cols)                 ║
                   ╚═══════════════════════════════════════════════════╝ */}
                <Widget className="col-span-12 md:col-span-6 lg:col-span-4" delay={0.35}>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <Bell size={16} className="text-amber-400" />
                            <h2 className="text-lg font-black text-white tracking-tight">Smart Alerts</h2>
                        </div>

                        {alerts.map((alert, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors cursor-pointer">
                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                    i === 0 ? 'bg-blue-500/10' : i === 1 ? 'bg-amber-500/10' : 'bg-emerald-500/10',
                                )}>
                                    <alert.icon size={14} className={alert.color} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-200 truncate">{alert.text}</p>
                                </div>
                                <span className="text-[9px] font-bold text-slate-500 shrink-0">{alert.time}</span>
                            </div>
                        ))}
                    </div>
                </Widget>

                {/* ╔═══════════════════════════════════════════════════╗
                   ║  8. WEB3 OWNERSHIP TIMELINE  (spans 4 cols)      ║
                   ╚═══════════════════════════════════════════════════╝ */}
                <Widget className="col-span-12 md:col-span-6 lg:col-span-4" delay={0.4}>
                    <div className="p-6 space-y-5">
                        <h2 className="text-lg font-black text-white tracking-tight">Web3 Ownership Timeline</h2>

                        {/* Timeline steps */}
                        <div className="flex items-center justify-between">
                            {timelineSteps.map((step, i) => (
                                <div key={step} className="flex flex-col items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{step}</span>
                                </div>
                            ))}
                        </div>

                        {/* Progress Line */}
                        <div className="relative">
                            <div className="h-1 bg-white/[0.04] rounded-full">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '75%' }}
                                    transition={{ delay: 0.6, duration: 1.2, ease: 'easeOut' }}
                                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full relative"
                                >
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400 border-2 border-[#0d1117] shadow-[0_0_10px_#0ea5e9]" />
                                </motion.div>
                            </div>

                            {/* Date labels */}
                            <div className="flex items-center justify-between mt-3">
                                {['Jan 2023', 'Feb 2023', 'Mar 2023', 'Apr 2023'].map((d) => (
                                    <span key={d} className="text-[9px] font-bold text-slate-600">{d}</span>
                                ))}
                            </div>
                        </div>

                        {/* Status badges */}
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { label: 'Minted', icon: Fingerprint, done: true },
                                { label: 'Verified', icon: CheckCircle2, done: true },
                                { label: 'Listed', icon: Tag, done: true },
                                { label: 'Sold', icon: Wallet, done: false },
                            ].map((s) => (
                                <div key={s.label} className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wider",
                                    s.done
                                        ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                                        : 'bg-white/[0.02] border-white/[0.06] text-slate-500'
                                )}>
                                    <s.icon size={10} />
                                    {s.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </Widget>

            </div>
        </div>
    )
}
