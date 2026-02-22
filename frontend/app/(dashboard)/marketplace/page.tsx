'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Tag, Wallet, Loader2, ExternalLink, Building2, Fingerprint, Sparkles, Cpu, ScanLine } from 'lucide-react'
import { useMarketplaceStore } from '@/store/marketplaceStore'
import { useWalletStore } from '@/store/walletStore'
import { formatCurrency, shortAddress, cn } from '@/lib/utils'

function NFTCard({ listing, index }: { listing: any, index: number }) {
    const { buy, buyingId } = useMarketplaceStore()
    const { isConnected, connect } = useWalletStore()
    const isBuying = buyingId === listing.id

    const handleBuy = async () => {
        if (!isConnected) { connect(); return }
        await buy(listing.id, listing.price)
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.6 }}
            className="group relative flex flex-col rounded-[2.5rem] bg-[#0B0F1A]/80 backdrop-blur-md border border-white/[0.06] hover:border-cyan-500/30 transition-all duration-500 overflow-hidden"
        >
            {/* Holographic Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            {/* Visual Container */}
            <div className="relative h-64 bg-[#05070A] overflow-hidden flex items-center justify-center">
                {/* Tech Grid Background */}
                <div className="absolute inset-0 grid-bg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                
                {/* Central Icon */}
                <div className="relative z-10 group-hover:scale-110 transition-transform duration-700">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
                    <Building2 size={56} className="text-slate-700 group-hover:text-cyan-400 transition-colors duration-500 relative z-10" />
                </div>

                {/* Status Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="text-[9px] font-black px-3 py-1.5 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md text-slate-400 uppercase tracking-widest shadow-lg">
                        NODE #{listing.token_id || listing.id}
                    </span>
                    {listing.is_nft && (
                        <span className="text-[9px] font-black px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 backdrop-blur-md text-blue-400 uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                            <Fingerprint size={12} /> ON-CHAIN
                        </span>
                    )}
                </div>
                
                {/* AI Verified Badge */}
                <div className="absolute top-6 right-6">
                    <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:border-cyan-500/40 transition-colors shadow-lg">
                        <Sparkles size={16} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    </div>
                </div>

                {/* Bottom Info Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#05070A] to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex items-center gap-3">
                    <Cpu size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">AI Verified Asset</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-8 flex flex-col gap-6 flex-1 relative z-10">
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-white truncate tracking-tight group-hover:text-cyan-50 transition-colors">
                        {listing.title || listing.property_title || 'Autonomous Asset'}
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide group-hover:text-slate-400 transition-colors">
                            {listing.seller ? shortAddress(listing.seller) : 'ArchNext Protocol'}
                        </p>
                    </div>
                </div>

                <div className="flex items-end justify-between pt-6 border-t border-white/[0.04] mt-auto">
                    <div>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Current Valuation</p>
                        <p className="text-2xl font-black text-white tracking-tighter group-hover:text-cyan-400 transition-colors glow-text">
                            {formatCurrency(listing.price || 0)}
                        </p>
                    </div>
                    
                    <button
                        onClick={handleBuy}
                        disabled={isBuying}
                        className={cn(
                            "relative flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 overflow-hidden group/btn",
                            isConnected 
                                ? "bg-white text-black hover:bg-cyan-50 shadow-xl hover:shadow-cyan-500/20" 
                                : "bg-cyan-600/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
                        )}
                    >
                        {isBuying ? <Loader2 size={14} className="animate-spin" /> : <Wallet size={14} />}
                        <span className="relative z-10">
                            {isBuying ? 'PROCESSING' : isConnected ? 'ACQUIRE' : 'CONNECT'}
                        </span>
                        {isConnected && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

export default function MarketplacePage() {
    const { listings, loading, fetchListings } = useMarketplaceStore()
    const [filter, setFilter] = useState<'all' | 'nft' | 'standard'>('all')

    useEffect(() => { fetchListings() }, [])

    const filtered = listings.filter((l: any) => {
        if (filter === 'nft') return l.is_nft
        if (filter === 'standard') return !l.is_nft
        return true
    })

    const categories = [
        { id: 'all', label: 'All Units', icon: ShoppingBag },
        { id: 'nft', label: 'On-Chain', icon: Fingerprint },
        { id: 'standard', label: 'Standard', icon: Building2 },
    ]

    return (
        <div className="space-y-12">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 px-2">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <ScanLine size={16} className="text-cyan-500 animate-pulse" />
                        <span className="text-[11px] font-black text-cyan-500 uppercase tracking-[0.3em]">Protocol Marketplace</span>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black text-white tracking-tighter text-gradient leading-none">Marketplace</h1>
                        <p className="text-slate-400 max-w-xl text-lg font-medium">Acquire fractionalized, AI-validated urban assets with institutional-grade security.</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="glass-panel p-2 rounded-[1.5rem] flex gap-2 border border-white/[0.06] shadow-2xl">
                    {categories.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setFilter(id as any)}
                            className={cn(
                                "relative flex items-center gap-3 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                filter === id 
                                    ? "text-black bg-white shadow-lg" 
                                    : "text-slate-500 hover:text-white hover:bg-white/[0.04]"
                            )}
                        >
                            <Icon size={14} className={cn("relative z-10", filter === id ? "text-black" : "text-slate-500 group-hover:text-white")} />
                            <span className="relative z-10">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-[500px] rounded-[2.5rem] glass-panel bg-white/[0.02] animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-shimmer" />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-40 glass-panel rounded-[3rem] border border-white/[0.06] bg-[#05070A]/50"
                >
                    <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-8 relative">
                        <ShoppingBag size={40} className="text-slate-800" />
                        <div className="absolute inset-0 border border-cyan-500/10 rounded-full animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-300 tracking-tight uppercase tracking-widest">Market Offline</h2>
                    <p className="text-slate-500 mt-2 max-w-xs text-center font-medium">No assets match current search criteria. Network sync recommended.</p>
                    <button 
                        onClick={() => setFilter('all')}
                        className="mt-10 px-8 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] hover:bg-cyan-500/10 hover:border-cyan-500/20 transition-all"
                    >
                        Reset Filters
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filtered.map((listing: any, i: number) => (
                        <NFTCard key={listing.id || i} listing={listing} index={i} />
                    ))}
                </div>
            )}
            
            {/* Network Footer */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-6 py-10 border-t border-white/[0.06]">
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0B0F1A] bg-slate-800" />
                        ))}
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <span className="text-white">1,204</span> ACTIVE TRADERS
                    </p>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Network Volume</p>
                        <p className="text-sm font-black text-white">4,208.5 ETH</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">System Status</p>
                        <div className="flex items-center justify-end gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                            <p className="text-[10px] font-black text-emerald-400 tracking-widest">OPTIMAL</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


