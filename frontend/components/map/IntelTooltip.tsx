'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, MapPin, Zap, BarChart3 } from 'lucide-react'

interface IntelTooltipProps {
    info: {
        x: number
        y: number
        object: any | null
        layer: string
    } | null
}

export default function IntelTooltip({ info }: IntelTooltipProps) {
    if (!info?.object) return null

    const data = info.object
    const isProperty = info.layer === 'properties'
    const isZone = info.layer === 'zones'

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 4 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="fixed z-[100] pointer-events-none"
                style={{
                    left: info.x + 16,
                    top: info.y - 16,
                }}
            >
                <div className="relative min-w-[200px] max-w-[280px]">
                    {/* Glow background */}
                    <div className="absolute -inset-1 bg-cyan-500/10 blur-xl rounded-2xl" />

                    {/* Glass panel */}
                    <div className="relative rounded-xl border border-white/[0.1] bg-[#0a0e1a]/90 backdrop-blur-xl p-4 shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
                        {/* Top highlight */}
                        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

                        {isProperty && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                                        <MapPin size={12} className="text-cyan-400" />
                                    </div>
                                    <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.15em]">Property Node</span>
                                </div>
                                <div className="space-y-2">
                                    {data.count && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-zinc-500 font-medium">Cluster Size</span>
                                            <span className="text-xs font-bold text-white">{data.count}</span>
                                        </div>
                                    )}
                                    {data.avg_price && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-zinc-500 font-medium">Avg Value</span>
                                            <span className="text-xs font-bold text-emerald-400">
                                                ${(data.avg_price / 1000).toFixed(0)}k
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {isZone && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                                        <BarChart3 size={12} className="text-indigo-400" />
                                    </div>
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.15em]">Smart Zone</span>
                                </div>
                                <div className="space-y-2">
                                    {data.name && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-zinc-500 font-medium">Zone</span>
                                            <span className="text-xs font-bold text-white">{data.name}</span>
                                        </div>
                                    )}
                                    {data.growth_score !== undefined && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-zinc-500 font-medium">Growth</span>
                                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                                <TrendingUp size={10} /> {data.growth_score}%
                                            </span>
                                        </div>
                                    )}
                                    {data.prediction !== undefined && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-zinc-500 font-medium">AI Score</span>
                                            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                                                <Zap size={10} /> {data.prediction}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {!isProperty && !isZone && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center">
                                        <Zap size={12} className="text-amber-400" />
                                    </div>
                                    <span className="text-[9px] font-black text-amber-400 uppercase tracking-[0.15em]">Intelligence</span>
                                </div>
                                {data.weight && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-zinc-500 font-medium">Intensity</span>
                                        <span className="text-xs font-bold text-white">{(data.weight * 100).toFixed(0)}%</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
