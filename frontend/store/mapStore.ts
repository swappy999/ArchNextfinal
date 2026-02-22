import { create } from 'zustand'
import { api } from '@/lib/api'

interface MapBounds {
    ne_lng: number
    ne_lat: number
    sw_lng: number
    sw_lat: number
}

interface MapState {
    bounds: MapBounds | null
    clusters: any[]
    heatmap: any[]
    zones: any[]
    currentZone: any | null
    loading: boolean
    activeLayer: string
    setBounds: (bounds: MapBounds) => void
    setLayer: (layer: string) => void
    fetchMapData: (bounds: MapBounds) => Promise<void>
    fetchAnalytics: () => Promise<void>
}

export const useMapStore = create<MapState>((set) => ({
    bounds: null,
    clusters: [],
    heatmap: [],
    zones: [],
    currentZone: null,
    loading: false,
    activeLayer: 'heatmap',

    setBounds: (bounds) => set({ bounds }),
    setLayer: (layer) => set({ activeLayer: layer }),

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
                currentZone: data.zone || null,
                loading: false,
            })
        } catch {
            set({ loading: false })
        }
    },

    fetchAnalytics: async () => {
        try {
            const data = await api.get('/analytics/city-map')
            set({ zones: data.zones || [] })
        } catch { }
    },
}))
