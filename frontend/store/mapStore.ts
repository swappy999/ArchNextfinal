import { create } from 'zustand'
import { api } from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MapBounds {
    ne_lng: number
    ne_lat: number
    sw_lng: number
    sw_lat: number
}

interface Viewport {
    longitude: number
    latitude: number
    zoom: number
    pitch: number
    bearing: number
}

interface HoverInfo {
    x: number
    y: number
    object: any | null
    layer: string
}

interface MapState {
    // ─── Viewport ─────────────────────────────────────
    viewport: Viewport
    bounds: MapBounds | null

    // ─── Data ─────────────────────────────────────────
    clusters: any[]
    heatmap: any[]
    zones: any[]
    pulsePoints: any[]
    currentZone: any | null
    propertyCount: number

    // ─── UI State ─────────────────────────────────────
    loading: boolean
    activeLayers: Record<string, boolean>
    selectedFeature: any | null
    hoverInfo: HoverInfo | null
    viewMode: '2d' | '3d'
    cinematicEntry: boolean

    // ─── Actions ──────────────────────────────────────
    setViewport: (viewport: Partial<Viewport>) => void
    setBounds: (bounds: MapBounds) => void
    toggleLayer: (layerId: string) => void
    setSelectedFeature: (feature: any | null) => void
    setHoverInfo: (info: HoverInfo | null) => void
    setViewMode: (mode: '2d' | '3d') => void
    setCinematicEntry: (done: boolean) => void
    fetchMapData: (bounds: MapBounds) => Promise<void>
    flyTo: (target: Partial<Viewport>, duration?: number) => void
}

// ─── Debounce Helper ──────────────────────────────────────────────────────────

let fetchTimer: any = null

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMapStore = create<MapState>((set, get) => ({
    // Viewport — Kolkata default
    viewport: {
        longitude: 88.3639,
        latitude: 22.5726,
        zoom: 12,
        pitch: 60,
        bearing: -20,
    },
    bounds: null,

    // Data
    clusters: [],
    heatmap: [],
    zones: [],
    pulsePoints: [],
    currentZone: null,
    propertyCount: 0,

    // UI
    loading: false,
    activeLayers: {
        heatmap: true,
        zones: true,
        properties: true,
        pulse: true,
        buildings: true,
    },
    selectedFeature: null,
    hoverInfo: null,
    viewMode: '3d',
    cinematicEntry: false,

    // ─── Actions ──────────────────────────────────────

    setViewport: (partial) =>
        set((s) => ({ viewport: { ...s.viewport, ...partial } })),

    setBounds: (bounds) => {
        set({ bounds })
        // Debounced fetch — 300ms
        if (fetchTimer) clearTimeout(fetchTimer)
        fetchTimer = setTimeout(() => {
            get().fetchMapData(bounds)
        }, 300)
    },

    toggleLayer: (layerId) =>
        set((s) => ({
            activeLayers: {
                ...s.activeLayers,
                [layerId]: !s.activeLayers[layerId],
            },
        })),

    setSelectedFeature: (feature) => set({ selectedFeature: feature }),
    setHoverInfo: (info) => set({ hoverInfo: info }),
    setViewMode: (mode) => set({ viewMode: mode }),
    setCinematicEntry: (done) => set({ cinematicEntry: done }),

    fetchMapData: async (bounds) => {
        set({ loading: true })
        try {
            const { ne_lng, ne_lat, sw_lng, sw_lat } = bounds
            const data = await api.get(
                `/map/smart-map?ne_lng=${ne_lng}&ne_lat=${ne_lat}&sw_lng=${sw_lng}&sw_lat=${sw_lat}`
            )
            set({
                clusters: data.clusters || [],
                heatmap: data.heatmap || [],
                zones: data.zones || [],
                pulsePoints: data.pulse_points || [],
                currentZone: data.zone || null,
                propertyCount: data.property_count || 0,
                loading: false,
            })
        } catch {
            set({ loading: false })
        }
    },

    flyTo: (target, _duration = 2000) => {
        set((s) => ({
            viewport: { ...s.viewport, ...target },
        }))
    },
}))
