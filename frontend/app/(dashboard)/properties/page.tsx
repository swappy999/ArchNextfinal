'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, Layers, Search, Grid, List, ExternalLink, MapPin, Activity, ArrowRight, Fingerprint } from 'lucide-react'
import { usePropertyStore } from '@/store/propertyStore'
import { formatCurrency, cn } from '@/lib/utils'
import Link from 'next/link'

function PropertyCard({ property, view, index }: { property: any; view: 'grid' | 'list'; index: number }) {
    if (view === 'list') {
        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group flex items-center gap-6 p-5 rounded-2xl glass-card border-white/[0.04] hover:border-cyan-500/30 transition-all duration-300"
            >
                <div className="w-14 h-14 rounded-xl bg-[#0B0F1A] border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:border-cyan-500/40 transition-colors shadow-lg">
                    <Building2 size={22} className="text-slate-600 group-hover:text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <p className="text-base font-bold text-white group-hover:text-cyan-50 transition-colors">{property.title || property.address}</p>
                        {property.is_nft && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                                <Fingerprint size={10} className="text-blue-400" />
                                <span className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">SECURED</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1">
                            <MapPin size={12} /> {property.area || (typeof property.location === 'string' ? property.location : 'Kolkata, IN')}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-8 shrink-0">
                    <div className="text-right">
                        <p className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors tracking-tight">{formatCurrency(property.price || 0)}</p>
                        <div className="flex items-center justify-end gap-1.5 mt-0.5">
                            <Activity size={10} className="text-cyan-500" />
                            <span className="text-[10px] font-bold text-slate-600 uppercase">AI: 8.4</span>
                        </div>
                    </div>
                    <Link href={`/properties/${property.id}`}>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-cyan-500/10 hover:border-cyan-500/20 text-slate-500 hover:text-cyan-400 transition-all shadow-xl group/btn">
                            <ArrowRight size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                    </Link>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative flex flex-col rounded-[2.5rem] glass-card overflow-hidden border-white/[0.06] hover:border-cyan-500/30 transition-all duration-500"
        >
            <Link href={`/properties/${property.id}`} className="block h-full">
                <div className="relative h-48 bg-[#05070A] overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                    <div className="absolute inset-0 grid-bg opacity-10" />
                    <Building2 size={48} className="text-slate-800 group-hover:text-cyan-400/50 transition-colors duration-700" />

                    {/* Floating Badges */}
                    <div className="absolute top-5 left-5">
                        {property.is_nft && (
                            <span className="text-[9px] font-black px-2.5 py-1 rounded-lg border border-blue-500/30 bg-blue-500/10 backdrop-blur-md text-blue-400 uppercase tracking-widest flex items-center gap-1.5 shadow-2xl">
                                <Fingerprint size={10} /> ON-CHAIN
                            </span>
                        )}
                    </div>

                    <div className="absolute bottom-5 right-5">
                        <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black text-cyan-400 tracking-widest flex items-center gap-1.5">
                            <Activity size={12} /> 8.4
                        </div>
                    </div>
                </div>

                <div className="p-7 flex flex-col gap-5 flex-1 relative z-10">
                    <div className="space-y-1.5">
                        <h3 className="text-lg font-black text-white truncate tracking-tight group-hover:text-cyan-50 transition-colors">
                            {property.title || property.address || 'Autonomous Asset'}
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-tight">
                            <MapPin size={12} className="text-slate-700" />
                            {property.area || (typeof property.location === 'string' ? property.location : 'Kolkata Network')}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-white/[0.04] mt-auto">
                        <p className="text-xl font-black text-white tracking-tighter group-hover:text-cyan-400 transition-colors">
                            {formatCurrency(property.price || 0)}
                        </p>
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.02] border border-white/[0.08] group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10 transition-all duration-500">
                            <ArrowRight size={18} className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

export default function PropertiesPage() {
    const { properties, loading, fetchProperties } = usePropertyStore()
    const [view, setView] = useState<'grid' | 'list'>('grid')
    const [search, setSearch] = useState('')

    useEffect(() => { fetchProperties() }, [])

    const filtered = properties.filter((p: any) =>
        (p.title || p.address || '').toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-12">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 px-2">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] animate-pulse" />
                        <span className="text-[11px] font-black text-cyan-500 uppercase tracking-[0.3em]">Network Intelligence Registry</span>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black text-white tracking-tighter text-gradient leading-none">Property Index</h1>
                        <p className="text-slate-400 max-w-xl text-lg font-medium">Monitoring {properties.length} active urban nodes across the global spatial network.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="relative group/search w-full md:w-64">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/search:text-cyan-400 transition-colors" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="SCAN REGISTRY..."
                            className="h-12 pl-12 pr-6 w-full rounded-2xl bg-[#05070A]/50 glass-panel border border-white/[0.06] text-[10px] font-black tracking-[0.2em] text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                        />
                    </div>
                    <div className="flex p-1 rounded-[1.25rem] bg-[#05070A]/50 glass-panel border border-white/[0.06]">
                        <button
                            onClick={() => setView('grid')}
                            className={cn(
                                "w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-300",
                                view === 'grid' ? "bg-white text-black shadow-xl" : "text-slate-600 hover:text-slate-400"
                            )}
                        ><Grid size={18} /></button>
                        <button
                            onClick={() => setView('list')}
                            className={cn(
                                "w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-300",
                                view === 'list' ? "bg-white text-black shadow-xl" : "text-slate-600 hover:text-slate-400"
                            )}
                        ><List size={18} /></button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className={cn(
                    "grid gap-8",
                    view === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                )}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className={cn(
                            "rounded-[2.5rem] glass-panel bg-white/[0.02] animate-pulse relative overflow-hidden",
                            view === 'grid' ? "h-[420px]" : "h-24"
                        )}>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-shimmer" />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 glass-panel rounded-[3rem] border-dashed border-white/[0.06]">
                    <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-8 relative">
                        <Building2 size={40} className="text-slate-800" />
                        <div className="absolute inset-0 border border-cyan-500/10 rounded-full animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-300 tracking-tight uppercase tracking-widest">Registry Sync Failed</h2>
                    <p className="text-slate-500 mt-2 max-w-xs text-center font-medium">No active urban nodes match your current search parameters.</p>
                    <button
                        onClick={() => setSearch('')}
                        className="mt-10 px-8 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] hover:bg-cyan-500/10 hover:border-cyan-500/20 transition-all"
                    >
                        Reset Local Search
                    </button>
                </div>
            ) : (
                <div className={cn(
                    "gap-8",
                    view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col"
                )}>
                    {filtered.map((p: any, i) => (
                        <PropertyCard key={p.id || i} property={p} view={view} index={i} />
                    ))}
                </div>
            )}
        </div>
    )
}

