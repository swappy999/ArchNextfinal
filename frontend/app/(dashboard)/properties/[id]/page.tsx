'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Building2, Globe, ShieldCheck, Activity, 
    Zap, TrendingUp, ArrowLeft, Fingerprint, 
    Radar, MapPin, Share2, Heart, Cpu, Network
} from 'lucide-react'
import { usePropertyStore } from '@/store/propertyStore'
import { formatCurrency, cn } from '@/lib/utils'

function AIRadarChart() {
    return (
        <div className="relative w-full aspect-square flex items-center justify-center">
            <div className="absolute inset-0 border border-white/[0.05] rounded-full" />
            <div className="absolute inset-[20%] border border-white/[0.05] rounded-full" />
            <div className="absolute inset-[40%] border border-white/[0.05] rounded-full" />
            <div className="absolute inset-[60%] border border-white/[0.05] rounded-full" />
            
            {/* Axis */}
            {[0, 60, 120, 180, 240, 300].map(deg => (
                <div key={deg} className="absolute h-full w-[1px] bg-white/[0.05]" style={{ transform: `rotate(${deg}deg)` }} />
            ))}

            {/* Radar Shape */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
                <motion.polygon
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    points="100,20 160,60 180,130 140,180 60,160 40,80"
                    className="fill-cyan-500/20 stroke-cyan-500 stroke-2"
                    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                    viewBox="0 0 200 200"
                />
            </svg>
            
            {/* Pulsing Center */}
            <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_15px_#22d3ee] z-10" />
        </div>
    )
}

function StatsRing({ value, label }: { value: number, label: string }) {
    const percentage = value * 10
    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                    <circle cx="64" cy="64" r="58" fill="none" className="stroke-white/[0.03]" strokeWidth="8" />
                    <motion.circle 
                        cx="64" cy="64" r="58" fill="none" 
                        className="stroke-cyan-500" 
                        strokeWidth="8" 
                        strokeDasharray="364.4"
                        initial={{ strokeDashoffset: 364.4 }}
                        animate={{ strokeDashoffset: 364.4 - (364.4 * percentage) / 100 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-white">{value}</span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Score</span>
                </div>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
        </div>
    )
}

export default function PropertyDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { properties, fetchProperties } = usePropertyStore()
    const [property, setProperty] = useState<any>(null)

    useEffect(() => {
        if (properties.length === 0) fetchProperties()
        const p = properties.find((x: any) => x.id.toString() === id)
        if (p) setProperty(p)
    }, [id, properties])

    if (!property) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 rounded-3xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center animate-pulse">
                <Building2 size={32} className="text-slate-700" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Synching Neural Node...</p>
        </div>
    )

    return (
        <div className="space-y-12">
            {/* Breadcrumb & Actions */}
            <div className="flex items-center justify-between px-2">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-3 text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-[0.2em] group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Registry
                </button>
                <div className="flex items-center gap-4">
                    <button className="p-3 rounded-xl glass-card border-white/[0.06] text-slate-400 hover:text-white transition-all"><Share2 size={18} /></button>
                    <button className="p-3 rounded-xl glass-card border-white/[0.06] text-slate-400 hover:text-rose-400 transition-all"><Heart size={18} /></button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Left: Imagery & Primary Info */}
                <div className="xl:col-span-8 space-y-10">
                    <div className="relative h-[500px] rounded-[3rem] overflow-hidden border border-white/[0.06] bg-[#05070A] shadow-2xl group">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 grid-bg opacity-20" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                        
                        {/* Placeholder Content */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Building2 size={120} className="text-slate-900 group-hover:scale-110 group-hover:text-slate-800 transition-all duration-1000" />
                        </div>

                        {/* Top Overlays */}
                        <div className="absolute top-8 left-8 flex gap-3">
                            <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-3 border-white/[0.1] shadow-2xl">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE TRACKING</span>
                            </div>
                            {property.is_nft && (
                                <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-3 border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-2xl">
                                    <Fingerprint size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">ON-CHAIN VERIFIED</span>
                                </div>
                            )}
                        </div>

                        {/* Bottom Overlays */}
                        <div className="absolute bottom-10 left-10 right-10">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-cyan-400">
                                        <MapPin size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{property.location || 'MUMBAI CENTRAL, IN'}</span>
                                    </div>
                                    <h1 className="text-5xl font-black text-white tracking-tighter text-gradient leading-none">
                                        {property.title}
                                    </h1>
                                </div>
                                <div className="glass-panel p-6 rounded-3xl border-white/[0.1] shadow-2xl backdrop-blur-3xl">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Market Evaluation</p>
                                    <p className="text-3xl font-black text-white tracking-tighter">{formatCurrency(property.price)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Infrastructure Intel Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="glass-panel p-8 rounded-[2.5rem] border-white/[0.06] space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                    <Cpu size={20} className="text-cyan-400" />
                                </div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Neural Score</h3>
                            </div>
                            <AIRadarChart />
                            <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest pt-4 border-t border-white/[0.04]">
                                <span>Connectivity</span>
                                <span className="text-cyan-400">9.4/10</span>
                            </div>
                        </div>

                        <div className="md:col-span-2 glass-panel p-8 rounded-[2.5rem] border-white/[0.06] space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                        <Network size={20} className="text-purple-400" />
                                    </div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Urban Infrastructure</h3>
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aggregate Analysis</span>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                {[
                                    { label: 'Transport Hubs', value: 'High Density', score: 92 },
                                    { label: 'Digital Grid', value: 'Level 5 Fiber', score: 98 },
                                    { label: 'Energy Grade', value: 'Renewable A+', score: 85 },
                                    { label: 'Public Services', value: 'Global Standard', score: 90 },
                                ].map((item, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="flex justify-between items-baseline">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{item.label}</p>
                                            <p className="text-xs font-bold text-white">{item.score}%</p>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.score}%` }}
                                                transition={{ delay: i * 0.1 + 0.5, duration: 1 }}
                                                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                                            />
                                        </div>
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: AI Forecasting & Action */}
                <div className="xl:col-span-4 space-y-10">
                    <div className="glass-panel p-10 rounded-[3rem] border-white/[0.08] relative overflow-hidden flex flex-col items-center text-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
                        
                        <div className="flex flex-col items-center gap-4 mb-10">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-2xl mb-2">
                                <Zap size={28} className="text-cyan-400" />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">AI Growth Projection</h2>
                            <p className="text-slate-500 text-sm font-medium">Neural forecasting based on 400+ urban development signals.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-10 w-full mb-12">
                            <StatsRing value={8.4} label="Composite Growth" />
                        </div>

                        <div className="w-full space-y-6 pt-10 border-t border-white/[0.04]">
                            <div className="flex justify-between">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Projected 12M Return</span>
                                <span className="text-sm font-black text-emerald-400">+14.2%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Liquidity</span>
                                <span className="text-sm font-black text-white">OPTIMAL</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Volatilty Index</span>
                                <span className="text-sm font-black text-slate-400">LOW</span>
                            </div>
                        </div>

                        <div className="w-full mt-12 space-y-4">
                            <button className="w-full py-5 rounded-[1.5rem] bg-white text-black text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-cyan-50 transition-all active:scale-95 overflow-hidden group relative">
                                <span className="relative z-10">ACQUIRE ASSET</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            </button>
                            <button className="w-full py-5 rounded-[1.5rem] bg-white/[0.03] border border-white/[0.08] text-[11px] font-black text-cyan-400 uppercase tracking-[0.3em] hover:bg-cyan-500/10 hover:border-cyan-500/20 transition-all">
                                FRACTIONALIZE
                            </button>
                        </div>
                    </div>

                    <div className="glass-panel p-8 rounded-[2.5rem] border-white/[0.06] space-y-6">
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={20} className="text-emerald-500" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Network Verification</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'Property Deed', status: 'VERIFIED', icon: ShieldCheck },
                                { label: 'Zoning Compliance', status: 'CONFIRMED', icon: ShieldCheck },
                                { label: 'Environmental ESG', status: 'GRADE A', icon: Activity },
                            ].map((v, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                                    <div className="flex items-center gap-3">
                                        <v.icon size={14} className="text-slate-500" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{v.label}</span>
                                    </div>
                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">{v.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
