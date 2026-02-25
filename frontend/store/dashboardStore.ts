import { create } from 'zustand'
import { api } from '@/lib/api'

interface TrendingZone {
    grid_key: string
    center: { lat: number; lng: number }
    avg_price: number
    property_count: number
    growth_signal: number
    tier: string
}

interface DashboardState {
    trendingZones: TrendingZone[]
    hotZones: any[]
    loading: boolean
    fetchDashboardData: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set) => ({
    trendingZones: [],
    hotZones: [],
    loading: false,

    fetchDashboardData: async () => {
        set({ loading: true })
        try {
            const [trending, hotZones] = await Promise.all([
                api.get('/analytics/trending?top_n=5').catch(() => []),
                api.get('/analytics/hot-zones?top_n=5').catch(() => []),
            ])
            set({
                trendingZones: Array.isArray(trending) ? trending : [],
                hotZones: Array.isArray(hotZones) ? hotZones : [],
                loading: false,
            })
        } catch {
            set({ loading: false })
        }
    },
}))
