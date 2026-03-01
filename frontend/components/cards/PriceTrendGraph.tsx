'use client'

import { useMemo } from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
} from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

// Utilities
import { formatCurrency } from '@/lib/utils'

interface PriceTrendGraphProps {
    predictedPrice: number
    fiveYearPrice: number
    tenYearPrice: number
}

// Custom Tooltip for dark theme
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#05070A]/90 border border-white/[0.1] backdrop-blur-md p-3 rounded-xl shadow-2xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-sm font-bold text-white tracking-tight">
                    {formatCurrency(payload[0].value)}
                </p>
            </div>
        )
    }
    return null
}

export default function PriceTrendGraph({ predictedPrice, fiveYearPrice, tenYearPrice }: PriceTrendGraphProps) {
    const data = useMemo(() => [
        { year: "Now", price: predictedPrice },
        { year: "5 Years", price: fiveYearPrice },
        { year: "10 Years", price: tenYearPrice },
    ], [predictedPrice, fiveYearPrice, tenYearPrice])

    const isBullish = tenYearPrice >= predictedPrice

    // Determine min/max for dynamic scaling
    const minPrice = Math.min(predictedPrice, fiveYearPrice, tenYearPrice)
    const maxPrice = Math.max(predictedPrice, fiveYearPrice, tenYearPrice)

    // Add padding to domain so the line isn't cut off
    const padding = (maxPrice - minPrice) * 0.1
    const domain = [Math.max(0, minPrice - padding), maxPrice + padding]

    // Colors
    const lineColor = isBullish ? '#34d399' : '#f87171' // emerald-400 : red-400
    const gradientId = isBullish ? 'colorGreen' : 'colorRed'

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full relative rounded-xl overflow-hidden glass-panel border border-white/[0.04] p-4 group"
        >
            {/* Header / Trend Indicator */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${isBullish ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    {isBullish ? (
                        <TrendingUp size={14} className="text-emerald-400" />
                    ) : (
                        <TrendingDown size={14} className="text-red-400" />
                    )}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isBullish ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isBullish ? 'AI Projected Uptrend' : 'AI Projected Downtrend'}
                </span>
            </div>

            <div className="h-40 w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                            </linearGradient>

                            {/* Glow Filter */}
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="4" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        <XAxis
                            dataKey="year"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} // slate-500
                            dy={10}
                        />
                        <YAxis
                            domain={domain}
                            hide={true}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />

                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke={lineColor}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill={`url(#${gradientId})`}
                            filter="url(#glow)"
                            activeDot={{ r: 6, fill: lineColor, stroke: '#1e293b', strokeWidth: 2 }}
                            dot={{ r: 4, fill: '#1e293b', stroke: lineColor, strokeWidth: 2 }}
                            animationDuration={1200}
                            animationEasing="ease-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    )
}
