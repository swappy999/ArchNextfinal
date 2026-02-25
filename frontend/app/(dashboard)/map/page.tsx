'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Layers, Thermometer, Navigation2, Activity,
    TrendingUp, Crosshair, Zap, Scan, Globe,
    ShieldCheck, Eye, EyeOff, Hexagon, Radio,
    Building2, Maximize, ChevronRight
} from 'lucide-react'
import { useMapStore } from '@/store/mapStore'
import { formatCurrencyCompact } from '@/lib/utils'
import Map, { MapRef, useControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { ScatterplotLayer } from '@deck.gl/layers'
import { HeatmapLayer } from '@deck.gl/aggregation-layers'
import { PolygonLayer } from '@deck.gl/layers'
import { cn } from '@/lib/utils'
import IntelTooltip from '@/components/map/IntelTooltip'

// ─── Constants ──────────────────────────────────────────────────────
const CINEMATIC_DURATION = 3000

export default function MapPage() {
    const mapRef = useRef<MapRef | null>(null)
    const animFrameRef = useRef<number>(0)
    const [mapError, setMapError] = useState(false)
    const [mapLoaded, setMapLoaded] = useState(false)

    const {
        viewport, activeLayers, hoverInfo, viewMode,
        clusters, heatmap, zones, pulsePoints, currentZone,
        loading, cinematicEntry, propertyCount,
        setBounds, toggleLayer, setHoverInfo,
        setViewMode, setCinematicEntry, setViewport,
    } = useMapStore()

    // Local viewState to track user interaction 
    const [viewState, setViewState] = useState({
        longitude: viewport.longitude,
        latitude: viewport.latitude,
        zoom: 10,
        pitch: 0,
        bearing: 0,
        transitionDuration: 0,
        transitionEasing: (t: number) => t
    })

    // ─── Initialize MapLibre ───────────────────────────────────────────────
    const onMapLoad = useCallback((e: any) => {
        const m = e.target
        try {
            // Support both Mapbox (composite) and Carto (carto) styles
            const sourceId = m.getSource('carto') ? 'carto' : 'composite'

            if (m.getSource(sourceId)) {
                m.addLayer({
                    id: '3d-buildings',
                    source: sourceId,
                    'source-layer': 'building',
                    filter: ['==', 'extrude', 'true'],
                    type: 'fill-extrusion',
                    minzoom: 13,
                    paint: {
                        'fill-extrusion-color': [
                            'interpolate', ['linear'], ['get', 'height'],
                            0, '#0a1628',
                            50, '#0c2d5e',
                            150, '#0ea5e9',
                        ],
                        'fill-extrusion-height': [
                            'interpolate', ['linear'], ['zoom'],
                            13, 0, 13.05, ['get', 'height']
                        ],
                        'fill-extrusion-base': [
                            'interpolate', ['linear'], ['zoom'],
                            13, 0, 13.05, ['get', 'min_height']
                        ],
                        'fill-extrusion-opacity': 0.45,
                    },
                })
            }
        } catch (err) {
            console.log('[Map] 3D buildings not available on this tile provider style')
        }

        const labelLayers = m.getStyle().layers?.filter(
            (l: any) => l.type === 'symbol' && (l.id.includes('label') || l.id.includes('place'))
        ) || []
        labelLayers.forEach((l: any) => {
            m.setPaintProperty(l.id, 'text-opacity', 0.3)
        })

        setMapLoaded(true)

        // Cinematic entry
        setTimeout(() => {
            setViewState(prev => ({
                ...prev,
                zoom: viewport.zoom,
                pitch: viewport.pitch,
                bearing: viewport.bearing,
                transitionDuration: CINEMATIC_DURATION,
                transitionEasing: (t: number) => 1 - Math.pow(1 - t, 3),
            }))
            setTimeout(() => setCinematicEntry(true), CINEMATIC_DURATION)
        }, 500)

        // Force initial bounds update after a tiny delay to let the map size calculate
        setTimeout(() => {
            const bounds = m.getBounds()
            if (bounds) {
                setBounds({
                    ne_lng: bounds.getNorthEast().lng,
                    ne_lat: bounds.getNorthEast().lat,
                    sw_lng: bounds.getSouthWest().lng,
                    sw_lat: bounds.getSouthWest().lat,
                })
            }
        }, 100)
    }, [viewport, setCinematicEntry, setBounds])

    const onMoveEnd = useCallback((e: any) => {
        const m = e.target
        const bounds = m.getBounds()
        if (bounds) {
            setBounds({
                ne_lng: bounds.getNorthEast().lng,
                ne_lat: bounds.getNorthEast().lat,
                sw_lng: bounds.getSouthWest().lng,
                sw_lat: bounds.getSouthWest().lat,
            })
        }
        setViewState({
            longitude: m.getCenter().lng,
            latitude: m.getCenter().lat,
            zoom: m.getZoom(),
            pitch: m.getPitch(),
            bearing: m.getBearing(),
            transitionDuration: 0,
            transitionEasing: (t: number) => t
        })
    }, [setBounds])

    // ─── View Mode Toggle ─────────────────────────────────────────────────
    useEffect(() => {
        if (!mapLoaded || !mapRef.current) return
        const m = mapRef.current.getMap()
        if (viewMode === '3d') {
            m.easeTo({ pitch: 60, bearing: -20, duration: 1200 })
        } else {
            m.easeTo({ pitch: 0, bearing: 0, duration: 1200 })
        }
    }, [viewMode, mapLoaded])

    // ─── Buildings Visibility ─────────────────────────────────────────────
    useEffect(() => {
        if (!mapRef.current || !mapLoaded) return
        const m = mapRef.current.getMap()
        if (m && m.getLayer('3d-buildings')) {
            m.setLayoutProperty('3d-buildings', 'visibility',
                activeLayers.buildings ? 'visible' : 'none')
        }
    }, [activeLayers.buildings, mapLoaded])

    // ─── deck.gl Layers ───────────────────────────────────────────────────
    const deckLayers = useMemo(() => {
        const layers: any[] = []

        // Layer 2 — AI Heat Intelligence
        if (activeLayers.heatmap && heatmap.length > 0) {
            layers.push(
                new HeatmapLayer({
                    id: 'heat-intelligence',
                    data: heatmap,
                    getPosition: (d: any) => [d.longitude, d.latitude],
                    getWeight: (d: any) => d.weight || 1,
                    radiusPixels: 60,
                    intensity: 1.2,
                    threshold: 0.05,
                    colorRange: [
                        [6, 25, 60, 40],       // deep dark blue
                        [14, 165, 233, 100],    // cyan-500
                        [34, 211, 238, 160],     // cyan-400
                        [34, 211, 238, 200],     // cyan glow
                        [103, 232, 249, 220],    // bright cyan
                        [165, 243, 252, 255],    // white-cyan
                    ],
                    aggregation: 'SUM',
                })
            )
        }

        // Layer 3 — Smart Zones (Extruded Polygons)
        if (activeLayers.zones && zones.length > 0) {
            layers.push(
                new PolygonLayer({
                    id: 'smart-zones',
                    data: zones,
                    getPolygon: (d: any) => d.polygon,
                    getFillColor: (d: any) => {
                        const g = d.growth_score || 0
                        if (g > 70) return [14, 165, 233, 50]    // cyan premium
                        if (g > 40) return [99, 102, 241, 40]     // indigo high
                        return [51, 65, 85, 30]                     // slate standard
                    },
                    getLineColor: (d: any) => {
                        const g = d.growth_score || 0
                        if (g > 70) return [14, 165, 233, 120]
                        if (g > 40) return [99, 102, 241, 80]
                        return [51, 65, 85, 60]
                    },
                    getElevation: (d: any) => d.elevation || 0,
                    extruded: true,
                    wireframe: true,
                    lineWidthMinPixels: 1,
                    pickable: true,
                    onHover: (info: any) => {
                        if (info.object) {
                            setHoverInfo({ x: info.x, y: info.y, object: info.object, layer: 'zones' })
                        } else {
                            setHoverInfo(null)
                        }
                    },
                    transitions: {
                        getElevation: { duration: 1000, easing: (t: number) => 1 - Math.pow(1 - t, 3) },
                        getFillColor: { duration: 800 },
                    },
                })
            )
        }

        // Layer 4 — Property Scatterplot
        if (activeLayers.properties && clusters.length > 0) {
            layers.push(
                new ScatterplotLayer({
                    id: 'property-nodes',
                    data: clusters,
                    getPosition: (d: any) => [d.centroid.longitude, d.centroid.latitude],
                    getRadius: (d: any) => 30 + (d.count || 1) * 15,
                    getFillColor: [14, 165, 233, 160],
                    getLineColor: [14, 165, 233, 255],
                    lineWidthMinPixels: 1,
                    stroked: true,
                    filled: true,
                    radiusScale: 1,
                    radiusMinPixels: 4,
                    radiusMaxPixels: 40,
                    pickable: true,
                    antialiasing: true,
                    onHover: (info: any) => {
                        if (info.object) {
                            setHoverInfo({ x: info.x, y: info.y, object: info.object, layer: 'properties' })
                        } else {
                            setHoverInfo(null)
                        }
                    },
                    transitions: {
                        getRadius: { duration: 600 },
                    },
                })
            )

            // Inner glow dots
            layers.push(
                new ScatterplotLayer({
                    id: 'property-glow',
                    data: clusters,
                    getPosition: (d: any) => [d.centroid.longitude, d.centroid.latitude],
                    getRadius: (d: any) => 15 + (d.count || 1) * 8,
                    getFillColor: [103, 232, 249, 120],
                    filled: true,
                    radiusMinPixels: 2,
                    radiusMaxPixels: 20,
                    pickable: false,
                })
            )
        }

        // Layer 5 — Urban Pulse Points
        if (activeLayers.pulse && pulsePoints.length > 0) {
            layers.push(
                new ScatterplotLayer({
                    id: 'urban-pulse-outer',
                    data: pulsePoints,
                    getPosition: (d: any) => [d.longitude, d.latitude],
                    getRadius: (d: any) => (d.radius || 300) * 1.5,
                    getFillColor: [14, 165, 233, 20],
                    getLineColor: [14, 165, 233, 60],
                    stroked: true,
                    filled: true,
                    lineWidthMinPixels: 1,
                    radiusMinPixels: 20,
                    radiusMaxPixels: 200,
                    pickable: false,
                })
            )

            layers.push(
                new ScatterplotLayer({
                    id: 'urban-pulse-inner',
                    data: pulsePoints,
                    getPosition: (d: any) => [d.longitude, d.latitude],
                    getRadius: (d: any) => (d.radius || 300) * 0.4,
                    getFillColor: [34, 211, 238, 50],
                    filled: true,
                    radiusMinPixels: 8,
                    radiusMaxPixels: 80,
                    pickable: false,
                })
            )
        }

        return layers
    }, [activeLayers, heatmap, zones, clusters, pulsePoints, setHoverInfo])

    // DeckGL overlay hook for react-map-gl: create only ONCE
    const deckControl = useMemo(() => {
        return new MapboxOverlay({
            interleaved: false,
            layers: []
        })
    }, [])

    // Apply overlay to map and update layers continuously
    useEffect(() => {
        if (mapRef.current && mapLoaded && deckControl) {
            const map = mapRef.current.getMap()
            if (map && !map.hasControl(deckControl as any)) {
                map.addControl(deckControl as any)
            }

            // Re-sync props to force a redraw if layers changed
            deckControl.setProps({
                layers: [...(deckLayers as any[])]
            })
        }
    }, [deckControl, mapLoaded, deckLayers])

    // ─── Layer Config ─────────────────────────────────────────────────────
    const layerConfig = [
        { id: 'heatmap', label: 'Thermal Intel', icon: Thermometer, color: 'cyan' },
        { id: 'zones', label: 'Smart Zones', icon: Hexagon, color: 'indigo' },
        { id: 'properties', label: 'Property Nodes', icon: Navigation2, color: 'emerald' },
        { id: 'pulse', label: 'Urban Pulse', icon: Radio, color: 'amber' },
        { id: 'buildings', label: '3D Structures', icon: Building2, color: 'blue' },
    ]

    const colorMap: Record<string, string> = {
        cyan: 'text-cyan-400',
        indigo: 'text-indigo-400',
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
        blue: 'text-blue-400',
    }

    const activeCount = Object.values(activeLayers).filter(Boolean).length

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Scan size={14} className="text-cyan-500 animate-pulse" />
                        <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em]">
                            Intelligence Operating System
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter leading-none">
                        City Intelligence Map
                    </h1>
                    <p className="text-slate-500 mt-1.5 text-sm font-medium">
                        GPU-accelerated geospatial synthesis · deck.gl + MapLibre GL
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Sync</span>
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        {loading ? (
                            <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest animate-pulse">
                                <Activity size={12} /> SCANNING...
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    {propertyCount} NODES
                                </span>
                                <span className="text-[10px] font-black text-cyan-500/60 uppercase tracking-widest">
                                    {activeCount} LAYERS
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative rounded-[2.5rem] overflow-hidden border border-white/[0.06] bg-[#030508] shadow-2xl">
                <div className="absolute inset-0">
                    <Map
                        ref={mapRef}
                        initialViewState={viewState}
                        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                        onLoad={onMapLoad}
                        onMoveEnd={onMoveEnd}
                        reuseMaps
                    />
                </div>

                {/* Cinematic Fade-In Overlay */}
                <AnimatePresence>
                    {!cinematicEntry && mapLoaded && (
                        <motion.div
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5 }}
                            className="absolute inset-0 z-50 bg-[#030508] flex items-center justify-center"
                        >
                            <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-center"
                            >
                                <Scan size={32} className="text-cyan-500 mx-auto mb-3" />
                                <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em]">
                                    Initializing Intelligence
                                </p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* HUD Corner Marks */}
                <div className="absolute inset-0 pointer-events-none z-10">
                    <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-cyan-500/20 rounded-tl-xl" />
                    <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-cyan-500/20 rounded-tr-xl" />
                    <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-cyan-500/20 rounded-bl-xl" />
                    <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-cyan-500/20 rounded-br-xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
                        <Crosshair size={24} className="text-cyan-400" />
                    </div>
                </div>

                {/* Left — Layer Controls */}
                <AnimatePresence>
                    {cinematicEntry && (
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute top-6 left-6 z-20 flex flex-col gap-3"
                        >
                            {/* Layer Toggles */}
                            <div className="bg-[#0a0e1a]/80 backdrop-blur-2xl p-2 rounded-2xl flex flex-col gap-1 border border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
                                <div className="px-3 py-2 flex items-center gap-2">
                                    <Layers size={12} className="text-cyan-400" />
                                    <span className="text-[9px] font-black text-cyan-400/80 uppercase tracking-[0.15em]">Layers</span>
                                </div>
                                {layerConfig.map(({ id, label, icon: Icon, color }) => {
                                    const isActive = activeLayers[id]
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => toggleLayer(id)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 group/btn relative",
                                                isActive
                                                    ? "text-white bg-white/[0.06]"
                                                    : "text-slate-600 hover:text-slate-400 hover:bg-white/[0.02]"
                                            )}
                                        >
                                            <Icon size={13} className={cn(
                                                "transition-colors",
                                                isActive ? colorMap[color] : "text-slate-700"
                                            )} />
                                            <span className="flex-1 text-left">{label}</span>
                                            {isActive ? (
                                                <Eye size={11} className="text-emerald-500/60" />
                                            ) : (
                                                <EyeOff size={11} className="text-slate-700" />
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Right — Zone Intelligence Panel */}
                <AnimatePresence>
                    {cinematicEntry && currentZone && currentZone.count > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 40 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute top-6 right-6 z-20 w-72"
                        >
                            <div className="bg-[#0a0e1a]/80 backdrop-blur-2xl p-5 rounded-2xl border border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl -translate-y-1/2 translate-x-1/2" />

                                <div className="flex items-center justify-between mb-5 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">Zone Intel</span>
                                    </div>
                                    <div className={cn(
                                        "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border",
                                        currentZone.tier === 'premium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                            currentZone.tier === 'high' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    )}>
                                        {currentZone.tier}
                                    </div>
                                </div>

                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Growth Score</p>
                                            <div className="flex items-baseline gap-2">
                                                <h3 className="text-3xl font-black text-white tracking-tighter">{currentZone.growth_score}</h3>
                                                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                                    <TrendingUp size={10} /> +12%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-14 h-8 flex items-end gap-[2px]">
                                            {[0.4, 0.6, 0.5, 0.8, 0.7, 0.9].map((h, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${h * 100}%` }}
                                                    transition={{ delay: i * 0.08, duration: 0.5 }}
                                                    className="flex-1 bg-cyan-500/30 rounded-t-sm"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.04]">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Median Val</p>
                                            <p className="text-base font-bold text-slate-300 tracking-tight">
                                                {formatCurrencyCompact(currentZone.avg_price)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Node Count</p>
                                            <p className="text-base font-bold text-slate-300 tracking-tight">{currentZone.count}</p>
                                        </div>
                                    </div>

                                    <button className="w-full py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[9px] font-black text-cyan-400 uppercase tracking-[0.15em] hover:bg-cyan-500/10 hover:border-cyan-500/20 transition-all flex items-center justify-center gap-2">
                                        <Zap size={12} /> Deep Scan
                                        <ChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom Left — Status Bar */}
                <AnimatePresence>
                    {cinematicEntry && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="absolute bottom-6 left-6 z-20 flex items-end gap-3"
                        >
                            <div className="bg-[#0a0e1a]/80 backdrop-blur-2xl px-4 py-3 rounded-xl flex items-center gap-5 border border-white/[0.06]">
                                <div className="flex items-center gap-2.5">
                                    <Globe size={16} className="text-cyan-400/60" />
                                    <div>
                                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none mb-0.5">Active Cluster</p>
                                        <p className="text-[11px] font-bold text-white tracking-tight">Kolkata Metro</p>
                                    </div>
                                </div>
                                <div className="h-6 w-px bg-white/[0.06]" />
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-black text-slate-700 uppercase">Latency</span>
                                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                            <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> 12ms
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-black text-slate-700 uppercase">Engine</span>
                                        <span className="text-[10px] font-bold text-white">deck.gl</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-black text-slate-700 uppercase">Render</span>
                                        <span className="text-[10px] font-bold text-white">WebGL2</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#0a0e1a]/80 backdrop-blur-2xl px-3 py-2.5 rounded-lg flex items-center gap-2 border border-white/[0.06]">
                                <ShieldCheck size={13} className="text-cyan-500/60" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Verified</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom Right — View Mode Toggle */}
                <AnimatePresence>
                    {cinematicEntry && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="absolute bottom-6 right-6 z-20"
                        >
                            <div className="bg-[#0a0e1a]/80 backdrop-blur-2xl p-1 rounded-xl flex border border-white/[0.06]">
                                <button
                                    onClick={() => setViewMode('2d')}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                        viewMode === '2d'
                                            ? "bg-white text-black shadow-lg"
                                            : "text-slate-600 hover:text-white"
                                    )}
                                >2D</button>
                                <button
                                    onClick={() => setViewMode('3d')}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                        viewMode === '3d'
                                            ? "bg-white text-black shadow-lg"
                                            : "text-slate-600 hover:text-white"
                                    )}
                                >3D</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Intel Tooltip */}
                <IntelTooltip info={hoverInfo} />

                {/* Error State */}
                {mapError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#030508] gap-6 z-50">
                        <div className="relative">
                            <div className="absolute inset-0 bg-cyan-500/20 blur-2xl animate-pulse" />
                            <div className="w-20 h-20 rounded-[2rem] bg-white/[0.02] border border-white/[0.08] flex items-center justify-center relative z-10">
                                <Navigation2 size={32} className="text-slate-700" />
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-black text-white uppercase tracking-[0.2em]">Map Engine Offline</h3>
                            <p className="text-slate-500 text-sm font-medium max-w-xs">
                                MapLibre GL engine failed to initialize. Check console for details.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
