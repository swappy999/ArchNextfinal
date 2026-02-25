import { create } from 'zustand'
import { api } from '@/lib/api'
import { useAuthStore } from './authStore'

interface PortfolioAsset {
    id?: string
    property_id: string
    title: string
    address: string
    area?: string
    location?: string
    purchase_price: number
    current_value: number
    current_price?: number
    predicted_price?: number
    growth_percent?: number
    ai_growth_prediction?: number
    is_nft?: boolean
    nft_minted?: boolean
    nft_token_id?: number | null
    listed_for_sale?: boolean
    listing_price_matic?: number
    blockchain_verified?: boolean
}

interface PortfolioState {
    assets: PortfolioAsset[]
    total_current_value: number
    total_invested: number
    loading: boolean
    fetchPortfolio: () => Promise<void>
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
    assets: [],
    total_current_value: 0,
    total_invested: 0,
    loading: false,

    fetchPortfolio: async () => {
        const token = useAuthStore.getState().accessToken
        if (!token) return
        set({ loading: true })
        try {
            const data = await api.get('/portfolio/me', token)
            if (!data) return set({ loading: false }) // token revoked — silently bail
            const portfolio = data?.properties || data?.assets || []
            const totalValue = portfolio.reduce((acc: number, a: any) => acc + (a.current_value || a.current_price || 0), 0)
            const totalInvested = portfolio.reduce((acc: number, a: any) => acc + (a.purchase_price || 0), 0)
            set({
                assets: portfolio,
                total_current_value: data?.total_current_value || totalValue,
                total_invested: totalInvested,
                loading: false,
            })
        } catch (e: any) {
            console.warn('[Portfolio] Fetch error:', e?.message)
            set({ loading: false })
        }
    },
}))
