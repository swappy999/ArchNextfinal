'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Layers, Thermometer, Navigation2, Info, 
    Activity, TrendingUp, Filter, Crosshair, 
    Maximize, Zap, Scan, Globe, ShieldCheck, Map as MapIcon
} from 'lucide-react'
import { useMapStore } from '@/store/mapStore'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { cn } from '@/lib/utils'

export default function MapPage() {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<mapboxgl.Map | null>(null)
    const { 
        activeLayer, 
        setLayer, 
        clusters, 
        heatmap, 
        currentZone, 
        fetchMapData, 
        loading 
    } = useMapStore()
    const [mapError, setMapError] = useState(false)
    const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d')

    // Initialize Map
    useEffect(() => {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        if (!token || token === 'your_mapbox_token') {
            setMapError(true)
            return
        }

        mapboxgl.accessToken = token
        
        if (!mapContainer.current) return

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [72.877, 19.076], // Mumbai
            zoom: 12,
            pitch: 60,
            bearing: -20,
            antialias: true
        })

        const updateBounds = () => {
            if (!map.current) return
            const bounds = map.current.getBounds()
            if (!bounds) return
            fetchMapData({
                ne_lng: bounds.getNorthEast().lng,
                ne_lat: bounds.getNorthEast().lat,
                sw_lng: bounds.getSouthWest().lng,
                sw_lat: bounds.getSouthWest().lat,
            })
        }

        map.current.on('load', () => {
            if (!map.current) return

            // Add 3D Buildings
            map.current.addLayer({
                'id': '3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                'minzoom': 13,
                'paint': {
                    'fill-extrusion-color': '#0ea5e9',
                    'fill-extrusion-height': [
                        'interpolate', ['linear'], ['zoom'],
                        13, 0,
                        13.05, ['get', 'height']
                    ],
                    'fill-extrusion-base': [
                        'interpolate', ['linear'], ['zoom'],
                        13, 0,
                        13.05, ['get', 'min_height']
                    ],
                    'fill-extrusion-opacity': 0.15
                }
            })

            // Add Sources
            map.current.addSource('heatmap-data', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            })

            map.current.addSource('clusters-data', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            })

            // Add Heatmap Layer
            map.current.addLayer({
                id: 'heatmap-layer',
                type: 'heatmap',
                source: 'heatmap-data',
                maxzoom: 15,
                paint: {
                    'heatmap-weight': ['get', 'weight'],
                    'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
                    'heatmap-color': [
                        'interpolate',
                        ['linear'],
                        ['heatmap-density'],
                        0, 'rgba(0,0,255,0)',
                        0.2, 'rgba(14, 165, 233, 0.4)',
                        0.4, 'rgba(34, 211, 238, 0.6)',
                        0.6, 'rgba(34, 211, 238, 0.8)',
                        0.8, 'rgba(34, 211, 238, 0.9)',
                        1, 'rgba(34, 211, 238, 1)'
                    ],
                    'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 15, 25],
                    'heatmap-opacity': 0.6
                }
            })

            // Add Clusters Layer
            map.current.addLayer({
                id: 'clusters-layer',
                type: 'circle',
                source: 'clusters-data',
                paint: {
                    'circle-color': '#0ea5e9',
                    'circle-radius': ['interpolate', ['linear'], ['get', 'count'], 1, 12, 10, 30],
                    'circle-stroke-width': 2,
                    'circle-stroke-color': 'rgba(255, 255, 255, 0.2)',
                    'circle-opacity': 0.4,
                    'circle-blur': 0.5
                }
            })

            map.current.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: 'clusters-data',
                layout: {
                    'text-field': ['get', 'count'],
                    'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
                    'text-size': 12,
                    'text-allow-overlap': true
                },
                paint: {
                    'text-color': '#ffffff'
                }
            })

            updateBounds()
        })

        map.current.on('moveend', updateBounds)

        return () => {
            map.current?.remove()
        }
    }, [])

    // Update data
    useEffect(() => {
        if (!map.current || !map.current.isStyleLoaded()) return

        const heatmapGeoJSON: any = {
            type: 'FeatureCollection',
            features: heatmap.map(h => ({
                type: 'Feature',
                properties: { weight: h.weight },
                geometry: { type: 'Point', coordinates: [h.longitude, h.latitude] }
            }))
        }

        const clustersGeoJSON: any = {
            type: 'FeatureCollection',
            features: clusters.map(c => ({
                type: 'Feature',
                properties: { count: c.count, avg_price: c.avg_price },
                geometry: { type: 'Point', coordinates: [c.centroid.longitude, c.centroid.latitude] }
            }))
        }

        const hSource = map.current.getSource('heatmap-data') as mapboxgl.GeoJSONSource
        const cSource = map.current.getSource('clusters-data') as mapboxgl.GeoJSONSource

        if (hSource) hSource.setData(heatmapGeoJSON)
        if (cSource) cSource.setData(clustersGeoJSON)
    }, [heatmap, clusters])

    // Visibility
    useEffect(() => {
        if (!map.current || !map.current.isStyleLoaded()) return
        const isHeatmap = activeLayer === 'heatmap'
        const isClusters = activeLayer === 'properties'

        if (map.current.getLayer('heatmap-layer')) map.current.setLayoutProperty('heatmap-layer', 'visibility', isHeatmap ? 'visible' : 'none')
        if (map.current.getLayer('clusters-layer')) map.current.setLayoutProperty('clusters-layer', 'visibility', isClusters ? 'visible' : 'none')
        if (map.current.getLayer('cluster-count')) map.current.setLayoutProperty('cluster-count', 'visibility', isClusters ? 'visible' : 'none')
    }, [activeLayer])

    const layers = [
        { id: 'heatmap', label: 'Thermal Intel', icon: Thermometer },
        { id: 'properties', label: 'Property Nodes', icon: Navigation2 },
    ]

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Scan size={14} className="text-cyan-500 animate-pulse" />
                        <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em]">Spatial Scanning Active</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter text-gradient leading-none">Intelligence Map</h1>
                    <p className="text-slate-400 mt-2 font-medium">Real-time geospatial synthesis of urban development signals.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Sync</span>
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        {loading ? (
                            <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest animate-pulse">
                                <Activity size={12} /> SCANNING...
                            </div>
                        ) : (
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">STANDBY</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 relative rounded-[2.5rem] overflow-hidden border border-white/[0.06] bg-[#05070A] shadow-2xl group/map">
                {/* Map Container */}
                <div ref={mapContainer} className="absolute inset-0" />
                
                {/* HUD Overlay Effects */}
                <div className="absolute inset-0 pointer-events-none z-10">
                    <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-xl" />
                    <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-xl" />
                    <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-xl" />
                    <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-cyan-500/30 rounded-br-xl" />
                    
                    {/* Crosshair Center */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
                        <Crosshair size={24} className="text-cyan-400" />
                    </div>
                </div>

                {/* Left Controls - HUD Style */}
                <div className="absolute top-8 left-8 z-20 flex flex-col gap-4">
                    <div className="glass-panel p-1.5 rounded-2xl flex flex-col gap-1 shadow-2xl border border-white/[0.08] backdrop-blur-2xl">
                        {layers.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setLayer(id)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative overflow-hidden group/btn",
                                    activeLayer === id 
                                        ? "text-black bg-white shadow-lg" 
                                        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                                )}
                            >
                                <Icon size={14} className={cn("relative z-10", activeLayer === id ? "text-black" : "text-slate-500 group-hover/btn:text-cyan-400")} />
                                <span className="relative z-10">{label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="glass-panel p-1.5 rounded-2xl flex flex-col gap-1 border border-white/[0.08]">
                        <button className="p-3 rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.05] transition-all"><Filter size={16} /></button>
                        <button className="p-3 rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.05] transition-all"><MapIcon size={16} /></button>
                        <button className="p-3 rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.05] transition-all"><Maximize size={16} /></button>
                    </div>
                </div>

                {/* Zone Intelligence - Right Side Floating */}
                <AnimatePresence>
                    {currentZone && currentZone.count > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 40 }}
                            className="absolute top-8 right-8 z-20 w-80"
                        >
                            <div className="glass-panel p-6 rounded-[2rem] border-white/[0.1] shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
                                
                                <div className="flex items-center justify-between mb-6 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Zone Analytics</span>
                                    </div>
                                    <div className={cn(
                                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                        currentZone.tier === 'premium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                        currentZone.tier === 'high' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    )}>
                                        {currentZone.tier} NODE
                                    </div>
                                </div>
                                
                                <div className="space-y-8 relative z-10">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Growth Score</p>
                                            <div className="flex items-baseline gap-2">
                                                <h3 className="text-4xl font-black text-white tracking-tighter">{currentZone.growth_score}</h3>
                                                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                                    <TrendingUp size={12} /> +12%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-16 h-10 flex items-end gap-[2px]">
                                            {[0.4, 0.6, 0.5, 0.8, 0.7, 0.9].map((h, i) => (
                                                <div key={i} className="flex-1 bg-cyan-500/30 rounded-t-[1px]" style={{ height: `${h * 100}%` }} />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/[0.05]">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Median Val</p>
                                            <p className="text-lg font-bold text-slate-200 tracking-tight">${(currentZone.avg_price / 1000).toFixed(0)}k</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Node Count</p>
                                            <p className="text-lg font-bold text-slate-200 tracking-tight">{currentZone.count}</p>
                                        </div>
                                    </div>
                                    
                                    <button className="w-full py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] hover:bg-cyan-500/10 hover:border-cyan-500/20 transition-all flex items-center justify-center gap-2">
                                        <Zap size={14} /> SCAN ZONE DETAILS
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Legend & Stats Overlay - Bottom Left */}
                <div className="absolute bottom-8 left-8 z-20 flex items-end gap-4">
                    <div className="glass-panel p-4 rounded-[1.5rem] flex items-center gap-6 shadow-2xl border border-white/[0.08]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                <Globe size={20} className="text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Active Cluster</p>
                                <p className="text-sm font-bold text-white tracking-tight">South Mumbai</p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-1">
                                <div className="text-[8px] font-black text-slate-600 uppercase">Latency</div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> 12ms
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="text-[8px] font-black text-slate-600 uppercase">Protocols</div>
                                <div className="text-[10px] font-bold text-white">W3 / AI / GEO</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel px-4 py-3 rounded-xl flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border border-white/[0.08]">
                        <ShieldCheck size={14} className="text-cyan-500" />
                        Node Verified
                    </div>
                </div>

                {/* Map Mode Toggle - Bottom Right */}
                <div className="absolute bottom-8 right-8 z-20 flex gap-2">
                    <div className="glass-panel p-1 rounded-xl flex border border-white/[0.08]">
                        <button 
                            onClick={() => setViewMode('2d')}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                viewMode === '2d' ? "bg-white text-black" : "text-slate-500 hover:text-white"
                            )}
                        >2D</button>
                        <button 
                            onClick={() => setViewMode('3d')}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                viewMode === '3d' ? "bg-white text-black" : "text-slate-500 hover:text-white"
                            )}
                        >3D</button>
                    </div>
                </div>

                {/* Error / Placeholder */}
                {mapError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#05070A] gap-6 z-50">
                        <div className="relative">
                            <div className="absolute inset-0 bg-cyan-500/20 blur-2xl animate-pulse" />
                            <div className="w-20 h-20 rounded-[2rem] bg-white/[0.02] border border-white/[0.08] flex items-center justify-center relative z-10">
                                <Navigation2 size={32} className="text-slate-700" />
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-black text-white tracking-tight uppercase tracking-[0.2em]">Map Engine Offline</h3>
                            <p className="text-slate-500 text-sm font-medium max-w-xs">Authentication token missing or invalid. Verify your environmental configuration.</p>
                        </div>
                        <div className="glass-panel px-4 py-2 rounded-xl">
                            <code className="text-[10px] font-bold text-cyan-400">NEXT_PUBLIC_MAPBOX_TOKEN_REQUIRED</code>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

