import { create } from 'zustand'
import { api } from '@/lib/api'
import { useAuthStore } from './authStore'

interface Listing {
    id: string
    property_id: string
    title: string
    address: string
    property_title: string
    token_id: number
    nft_token_id: number
    price: number
    price_listed_matic: number
    seller: string
    seller_wallet: string
    is_nft: boolean
    location?: object
}

interface MarketplaceState {
    listings: Listing[]
    loading: boolean
    buyingId: string | null
    fetchListings: () => Promise<void>
    buy: (listingId: string, price: number) => Promise<void>
    prepareListProperty: (propertyId: string, priceMatic: number) => Promise<any>
}

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
    listings: [],
    loading: false,
    buyingId: null,
    _lastFetched: 0,

    fetchListings: async () => {
        // Skip if data is fresh (< 30s old)
        const now = Date.now()
        const state = get() as any
        if (state.listings.length > 0 && now - (state._lastFetched || 0) < 30000) {
            return
        }
        set({ loading: true })
        try {
            const data = await api.get('/marketplace/listings')
            set({ listings: Array.isArray(data) ? data : [], loading: false, _lastFetched: now } as any)
        } catch {
            set({ loading: false, listings: [] })
        }
    },

    buy: async (listingId: string, price: number) => {
        set({ buyingId: listingId })
        try {
            const token = useAuthStore.getState().accessToken
            await api.post(`/marketplace/buy/${listingId}`, { price }, token)
        } catch (e) {
            // In real app: trigger wallet tx, handle errors
            console.warn('Buy failed (may need wallet tx):', e)
        } finally {
            set({ buyingId: null })
        }
    },

    prepareListProperty: async (propertyId: string, priceMatic: number) => {
        const token = useAuthStore.getState().accessToken
        return api.post(`/marketplace/list/${propertyId}`, { price_matic: priceMatic }, token)
    },
}))
