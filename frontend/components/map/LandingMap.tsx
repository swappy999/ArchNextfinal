'use client'

import { useEffect, useRef, useState } from 'react'
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { motion } from 'framer-motion'

/* Kolkata property hotspots — real coordinates */
const KOLKATA_NODES = [
    { lat: 22.5726, lng: 88.4497, label: 'New Town' },
    { lat: 22.5840, lng: 88.4100, label: 'Salt Lake' },
    { lat: 22.5520, lng: 88.3530, label: 'Park Street' },
    { lat: 22.5940, lng: 88.4700, label: 'Rajarhat' },
    { lat: 22.6400, lng: 88.4200, label: 'Dum Dum' },
    { lat: 22.5890, lng: 88.3100, label: 'Howrah' },
    { lat: 22.5280, lng: 88.3630, label: 'Ballygunge' },
    { lat: 22.5320, lng: 88.3330, label: 'Alipore' },
    { lat: 22.5170, lng: 88.3700, label: 'Gariahat' },
    { lat: 22.4890, lng: 88.3100, label: 'Behala' },
    { lat: 22.4990, lng: 88.3700, label: 'Jadavpur' },
    { lat: 22.5690, lng: 88.4350, label: 'Sector V' },
]

export default function LandingMap() {
    const [ready, setReady] = useState(false)

    useEffect(() => {
        // small delay so map initialises after section is in view
        const t = setTimeout(() => setReady(true), 300)
        return () => clearTimeout(t)
    }, [])

    if (!ready) {
        return (
            <div className="w-full h-full bg-[#0A0E17] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="w-full h-full relative">
            <Map
                initialViewState={{
                    longitude: 88.38,
                    latitude: 22.56,
                    zoom: 11.2,
                    pitch: 40,
                    bearing: -12,
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                interactive={false}
                attributionControl={false}
            >
                {/* Kolkata Property Markers */}
                {KOLKATA_NODES.map((node, i) => (
                    <Marker key={i} longitude={node.lng} latitude={node.lat} anchor="center">
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                            className="relative group/marker cursor-pointer"
                        >
                            {/* Pulse ring */}
                            <div
                                className="absolute -inset-3 bg-cyan-400/20 rounded-full animate-ping"
                                style={{ animationDelay: `${i * 0.25}s`, animationDuration: '2.5s' }}
                            />
                            {/* Glow */}
                            <div className="absolute -inset-4 bg-cyan-400/10 rounded-full blur-md" />
                            {/* Dot */}
                            <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_12px_#22d3ee] border-2 border-white/30 relative z-10" />
                            {/* Label */}
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                <span className="text-[9px] font-black text-cyan-300 uppercase tracking-widest bg-black/80 px-2 py-1 rounded-md border border-cyan-500/20">
                                    {node.label}
                                </span>
                            </div>
                        </motion.div>
                    </Marker>
                ))}
            </Map>

            {/* Map Overlay — Top Left: Location Badge */}
            <div className="absolute top-5 left-5 p-4 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 z-10">
                <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                    <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live Network</div>
                </div>
                <div className="text-xl font-bold text-white tracking-tighter">Kolkata</div>
            </div>

            {/* Map Overlay — Bottom Right: Stats */}
            <div className="absolute bottom-5 right-5 px-4 py-3 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center gap-4 z-10">
                <div>
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Nodes</div>
                    <div className="text-sm font-black text-cyan-400">1,200</div>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div>
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Zones</div>
                    <div className="text-sm font-black text-white">14</div>
                </div>
            </div>

            {/* Subtle vignette overlay for cinematic feel */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0A0E17]/60 via-transparent to-[#0A0E17]/30 z-[5]" />
        </div>
    )
}
