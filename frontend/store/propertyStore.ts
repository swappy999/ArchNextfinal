import { create } from 'zustand'
import { api } from '@/lib/api'
import { useAuthStore } from './authStore'

interface Property {
    id: string
    title: string
    address: string
    price: number
    location: { type: string; coordinates: [number, number] }
    nft_minted?: boolean
    nft_token_id?: number
    blockchain_verified?: boolean
    owner_id: string
}

interface PropertyState {
    properties: Property[]
    loading: boolean
    error: string | null
    _lastFetched: number
    fetchProperties: () => Promise<void>
    fetchNearby: (lng: number, lat: number, radius?: number) => Promise<Property[]>
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
    properties: [],
    loading: false,
    error: null,
    _lastFetched: 0,

    fetchProperties: async () => {
        // Skip if data is fresh (< 60s old)
        const now = Date.now()
        if (get().properties.length > 0 && now - get()._lastFetched < 60000) return
        set({ loading: true, error: null })
        try {
            const data = await api.get('/properties/')
            set({ properties: data, loading: false, _lastFetched: now })
        } catch (e: any) {
            set({ error: e.message, loading: false })
        }
    },

    fetchNearby: async (lng, lat, radius = 3000) => {
        const token = useAuthStore.getState().accessToken
        return api.get(`/properties/nearby?longitude=${lng}&latitude=${lat}&radius=${radius}`, token)
    },
}))
