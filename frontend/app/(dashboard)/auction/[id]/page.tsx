'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Gavel, Timer, TrendingUp, Building2, Brain, Shield, Flame,
    Wallet, Loader2, Trophy, Users, Hash,
    MapPin, BarChart3, ArrowLeft, Zap, Activity, Target, Droplets, Star
} from 'lucide-react'
import { useAuctionStore } from '@/store/auctionStore'
import { useWalletStore } from '@/store/walletStore'
import { formatCurrency, shortAddress, cn } from '@/lib/utils'
import Link from 'next/link'
import { toast, Toaster } from 'react-hot-toast'

// ─── Countdown Timer Hook ────────────────────────────────────────────────────
function useCountdown(endTime: string) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false })

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime()
            const end = new Date(endTime).getTime()
            const diff = end - now

            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true })
                clearInterval(timer)
            } else {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((diff % (1000 * 60)) / 1000),
                    expired: false,
                })
            }
        }, 1000)
        return () => clearInterval(timer)
    }, [endTime])

    return timeLeft
}

// ─── Countdown Display ───────────────────────────────────────────────────────
function CountdownDisplay({ endTime }: { endTime: string }) {
    const { days, hours, minutes, seconds, expired } = useCountdown(endTime)
    if (expired) return (
        <div className="flex items-center gap-2 text-rose-400">
            <Timer size={16} />
            <span className="text-sm font-black uppercase tracking-widest">AUCTION ENDED</span>
        </div>
    )
    return (
        <div className="flex items-center gap-3">
            <Timer size={16} className="text-cyan-400 animate-pulse" />
            <div className="flex gap-2">
                {[{ l: 'D', v: days }, { l: 'H', v: hours }, { l: 'M', v: minutes }, { l: 'S', v: seconds }].map(({ l, v }) => (
                    <div key={l} className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                            <span className="text-lg font-black text-white tabular-nums">{String(v).padStart(2, '0')}</span>
                        </div>
                        <span className="text-[8px] font-black text-slate-600 mt-1 uppercase">{l}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Score Bar ───────────────────────────────────────────────────────────────
function ScoreBar({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-[9px] font-bold text-slate-500">
                <span>{label}</span>
                <span className="text-white">{value.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                    className={cn("h-full rounded-full", color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            </div>
        </div>
    )
}

export default function AuctionDetailPage() {
    const params = useParams()
    const auctionId = params.id as string

    const { currentAuction, aiValuation, bids, loading, fetchAuctionDetail, placeBid, bidding, approving, finalizeAuction } = useAuctionStore()
    const { isConnected, connect } = useWalletStore()
    const [bidAmount, setBidAmount] = useState('')

    useEffect(() => {
        if (auctionId) fetchAuctionDetail(auctionId)
        const interval = setInterval(() => { if (auctionId) fetchAuctionDetail(auctionId) }, 15000)
        return () => clearInterval(interval)
    }, [auctionId])

    const auction = currentAuction
    const intel = aiValuation?.auction_intelligence

    const handlePlaceBid = async () => {
        if (!isConnected) { connect(); toast('Connect your wallet first.', { icon: '🦊' }); return }
        const amount = parseFloat(bidAmount)
        if (isNaN(amount) || amount <= 0) { toast.error('Enter a valid bid amount'); return }
        try {
            await placeBid(auctionId, amount)
            setBidAmount('')
        } catch (e: any) {
            toast.error(e.message || 'Failed to place bid')
        }
    }

    const handleFinalize = async () => {
        try { await finalizeAuction(auctionId) } catch (e: any) { toast.error(e.message || 'Failed to finalize') }
    }

    if (loading && !auction) return (
        <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
    )

    if (!auction) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Gavel size={48} className="text-slate-700" />
            <h2 className="text-xl font-black text-slate-400">Auction Not Found</h2>
            <Link href="/marketplace" className="text-cyan-400 text-sm hover:underline flex items-center gap-1">
                <ArrowLeft size={14} /> Back to Marketplace
            </Link>
        </div>
    )

    const minNextBid = auction.current_bid > 0
        ? auction.current_bid + auction.min_bid_increment
        : auction.reserve_price

    const property = (auction as any).property

    const zoneBadgeColors: Record<string, string> = {
        CBD: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
        Premium: 'bg-violet-500/15 border-violet-500/30 text-violet-400',
        Growth: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        Outer: 'bg-slate-500/15 border-slate-500/30 text-slate-400',
    }
    const zoneColor = zoneBadgeColors[aiValuation?.zone_category || ''] || zoneBadgeColors.Outer

    const competitionColors: Record<string, string> = {
        High: 'text-rose-400',
        Medium: 'text-amber-400',
        Low: 'text-emerald-400',
    }

    return (
        <div className="space-y-8 pb-16">
            <Toaster position="top-right" />

            {/* Back Nav */}
            <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors">
                <ArrowLeft size={16} /> Back to Marketplace
            </Link>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* ─── LEFT COLUMN ─────────────────────────────────────────────── */}
                <div className="flex-1 space-y-6">

                    {/* Property Header */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <Gavel size={16} className="text-cyan-500 animate-pulse" />
                            <span className="text-[11px] font-black text-cyan-500 uppercase tracking-[0.3em]">Live Auction</span>
                            <span className={cn("text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                                auction.status === 'active'
                                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                            )}>
                                {auction.status}
                            </span>
                            {aiValuation?.zone_category && (
                                <span className={cn("text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border", zoneColor)}>
                                    {aiValuation.zone_category} Zone
                                </span>
                            )}
                            <a
                                href={`https://amoy.polygonscan.com/token/0xe406730EF116B58F0C6007A276185803FF134706?a=${property?.token_id || property?.nft_token_id}`}
                                target="_blank" rel="noopener noreferrer"
                                className="text-[9px] font-black px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 uppercase tracking-widest flex items-center gap-1.5 hover:bg-blue-500/20 transition-all"
                            >
                                <Hash size={10} /> NODE #{property?.token_id || property?.nft_token_id}
                            </a>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter">
                            {property?.title || 'ArchNext Property Auction'}
                        </h1>
                        {aiValuation?.ward_name && aiValuation.ward_name !== 'Unknown' && (
                            <div className="flex items-center gap-2 text-slate-400">
                                <MapPin size={12} className="text-cyan-500" />
                                <span className="text-sm">Ward {aiValuation.ward_name}</span>
                            </div>
                        )}
                        {property?.description && (
                            <p className="text-slate-400 text-sm max-w-2xl">{property.description}</p>
                        )}
                    </div>

                    {/* Countdown */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/[0.06]">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Time Remaining</p>
                        <CountdownDisplay endTime={auction.end_time} />
                    </div>

                    {/* ─── AI INTELLIGENCE REPORT ───────────────────────────── */}
                    {aiValuation && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel p-6 rounded-2xl border border-cyan-500/10 space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Brain size={14} className="text-cyan-400" />
                                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">AI Intelligence Report</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[9px] text-emerald-400 font-black">LIVE</span>
                                </div>
                            </div>

                            {/* Valuation Grid */}
                            <div>
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-3">Valuation Breakdown</p>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">Per Sq.Ft</p>
                                        <p className="text-lg font-black text-white">₹{aiValuation.predicted_price_per_sqft?.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">Per Sq.M</p>
                                        <p className="text-lg font-black text-white">₹{aiValuation.predicted_price_per_sqm?.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">Market Tier</p>
                                        <p className={cn("text-lg font-black",
                                            aiValuation.market_tier === 'A' ? 'text-amber-400' : aiValuation.market_tier === 'B' ? 'text-cyan-400' : 'text-slate-400'
                                        )}>Zone {aiValuation.market_tier}</p>
                                    </div>
                                </div>

                                {/* Total Estimated Value */}
                                <div className="mt-3 text-center p-4 rounded-xl bg-gradient-to-r from-cyan-500/5 to-violet-500/5 border border-cyan-500/10">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Total AI-Estimated Value</p>
                                    <p className="text-2xl font-black text-white">₹{aiValuation.total_estimated_value?.toLocaleString('en-IN')}</p>
                                    <p className="text-[9px] text-slate-500 mt-1">Based on {aiValuation.confidence}% model confidence</p>
                                </div>
                            </div>

                            {/* Urban Scores */}
                            <div>
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-3">Urban Intelligence Scores</p>
                                <div className="space-y-3">
                                    <ScoreBar label="Infrastructure Density" value={aiValuation.infra_score} color="bg-cyan-500" />
                                    <ScoreBar label="Accessibility (Metro / Roads)" value={aiValuation.access_score} color="bg-emerald-500" />
                                    <ScoreBar label="Demand Intensity (POIs)" value={aiValuation.demand_score} color="bg-amber-500" />
                                    <ScoreBar label="CBD Proximity" value={aiValuation.cbd_score} color="bg-violet-500" />
                                    <ScoreBar label="Riverside Premium" value={aiValuation.river_score} color="bg-blue-500" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── AUCTION INTELLIGENCE PANEL ───────────────────────── */}
                    {intel && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-panel p-6 rounded-2xl border border-violet-500/10 space-y-4"
                        >
                            <div className="flex items-center gap-2">
                                <Zap size={14} className="text-violet-400" />
                                <span className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em]">Auction Intelligence Layer</span>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                                    <Activity size={12} className="text-violet-400 mb-2" />
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Competition</p>
                                    <p className={cn("text-sm font-black", competitionColors[intel.competition_level] || 'text-slate-400')}>
                                        {intel.competition_level}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                                    <Timer size={12} className="text-violet-400 mb-2" />
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Suggested Duration</p>
                                    <p className="text-sm font-black text-white">{intel.suggested_duration_days} Days</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                                    <Shield size={12} className="text-violet-400 mb-2" />
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Risk Rating</p>
                                    <p className={cn("text-sm font-black",
                                        intel.risk_rating === 'Low' ? 'text-emerald-400' : 'text-amber-400'
                                    )}>{intel.risk_rating}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                                    <Target size={12} className="text-violet-400 mb-2" />
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Predicted Close</p>
                                    <p className="text-[10px] font-black text-white">
                                        ₹{intel.predicted_closing_range[0].toLocaleString('en-IN')} – ₹{intel.predicted_closing_range[1].toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>
                            {intel.recommended_starting_bid > 0 && (
                                <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                        AI Recommended Starting Bid: <span className="text-violet-400">₹{intel.recommended_starting_bid.toLocaleString('en-IN')}</span> / sq.ft
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* ─── RIGHT COLUMN ────────────────────────────────────────────── */}
                <div className="lg:w-[400px] space-y-6">

                    {/* Bid Panel */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/[0.06] space-y-6">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Current Highest Bid</p>
                            <p className="text-4xl font-black text-white tracking-tighter">
                                {auction.current_bid > 0 ? formatCurrency(auction.current_bid) : 'No Bids Yet'}
                            </p>
                            {auction.highest_bidder && (
                                <a
                                    href={`https://amoy.polygonscan.com/address/${auction.highest_bidder}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="text-[10px] font-bold text-slate-500 hover:text-cyan-400 transition-colors"
                                >
                                    by <span className="text-cyan-400">{shortAddress(auction.highest_bidder)}</span>
                                </a>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Reserve</p>
                                <p className="text-sm font-black text-white">{formatCurrency(auction.reserve_price)}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Total Bids</p>
                                <p className="text-sm font-black text-white">{auction.bid_count}</p>
                            </div>
                        </div>

                        {/* ERC-20 Bid Input */}
                        {auction.status === 'active' && (
                            <div className="space-y-3">
                                <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                                    <p className="text-[9px] text-cyan-400 font-black">
                                        Bids use <span className="text-white">ARCH tokens</span>. MetaMask will prompt you to approve spending, then confirm the bid.
                                    </p>
                                </div>
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                    Min next bid: {formatCurrency(minNextBid)}
                                </p>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-600">₹</span>
                                    <input
                                        type="number"
                                        value={bidAmount}
                                        onChange={(e) => setBidAmount(e.target.value)}
                                        placeholder={minNextBid.toLocaleString('en-IN')}
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-8 pr-4 py-4 text-lg font-black text-white placeholder:text-slate-700 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                    />
                                </div>
                                <button
                                    onClick={handlePlaceBid}
                                    disabled={bidding || approving}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 text-sm font-black text-white uppercase tracking-[0.2em] shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                                >
                                    {(bidding || approving)
                                        ? <Loader2 size={16} className="animate-spin" />
                                        : <Gavel size={16} />
                                    }
                                    {approving ? 'APPROVING TOKENS...' : bidding ? 'PLACING BID...' : 'PLACE BID'}
                                </button>
                            </div>
                        )}

                        {auction.status === 'active' && (
                            <button
                                onClick={handleFinalize}
                                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 transition-all"
                            >
                                <Trophy size={14} />
                                FINALIZE AUCTION
                            </button>
                        )}
                    </div>

                    {/* Bid Leaderboard */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/[0.06] space-y-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 size={14} className="text-cyan-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bid Leaderboard</span>
                        </div>
                        {bids.length === 0 ? (
                            <p className="text-sm text-slate-600 text-center py-4">No bids yet. Be the first!</p>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {bids.map((bid, i) => (
                                    <motion.div
                                        key={bid.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-xl border",
                                            i === 0 ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-white/[0.02] border-white/[0.04]'
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black",
                                                i === 0 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/[0.04] text-slate-500'
                                            )}>
                                                {i === 0 ? <Trophy size={10} /> : `#${i + 1}`}
                                            </span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-bold text-white">{shortAddress(bid.bidder_wallet || bid.bidder_id)}</p>
                                                    {bid.tx_hash && (
                                                        <a href={`https://amoy.polygonscan.com/tx/${bid.tx_hash}`} target="_blank" rel="noopener noreferrer"
                                                            className="text-cyan-500/50 hover:text-cyan-400 transition-colors">
                                                            <TrendingUp size={10} />
                                                        </a>
                                                    )}
                                                </div>
                                                <p className="text-[9px] text-slate-600">{new Date(bid.created_at).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-black text-cyan-400">{formatCurrency(bid.amount)}</p>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
