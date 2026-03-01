'use client'

import { create } from 'zustand'
import { api } from '@/lib/api'
import { useAuthStore } from './authStore'
import { getEthersSigner, parseBlockchainError } from './walletStore'
import { blockchainProvider } from '@/lib/blockchainProvider'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

interface Bid {
    id: string
    auction_id: string
    bidder_id: string
    bidder_wallet: string
    amount: number
    tx_hash: string
    created_at: string
}

interface AuctionIntelligence {
    recommended_starting_bid: number
    suggested_duration_days: number
    competition_level: string
    predicted_closing_range: [number, number]
    risk_rating: string
}

interface AIValuation {
    ward_name: string
    zone_category: string
    predicted_price_per_sqft: number
    predicted_price_per_sqm: number
    total_estimated_value: number
    confidence: number
    market_tier: string
    infra_score: number
    access_score: number
    demand_score: number
    cbd_score: number
    river_score: number
    auction_intelligence: AuctionIntelligence
}

interface Auction {
    id: string
    property_id: string
    seller_id: string
    reserve_price: number
    current_bid: number
    highest_bidder: string
    min_bid_increment: number
    start_time: string
    end_time: string
    status: string
    bid_count: number
    property?: any
    bids?: Bid[]
    ai_valuation?: AIValuation
}

interface AuctionState {
    auctions: Auction[]
    currentAuction: Auction | null
    aiValuation: AIValuation | null
    bids: Bid[]
    loading: boolean
    bidding: boolean
    approving: boolean
    fetchActiveAuctions: () => Promise<void>
    fetchAuctionDetail: (auctionId: string) => Promise<void>
    createAuction: (propertyId: string, reservePrice: number, durationHours: number) => Promise<any>
    placeBid: (auctionId: string, amount: number) => Promise<any>
    finalizeAuction: (auctionId: string) => Promise<any>
}

async function getAuctionContract(signer: ethers.Signer) {
    const addrData = await import('@/contracts/PropertyAuction-address.json')
    const abiData = await import('@/contracts/PropertyAuction.json')
    const address = addrData.address
    if (!address || address === '0x0000000000000000000000000000000000000000') {
        throw new Error('Auction contract not yet deployed. Please deploy and update the address.')
    }
    return new ethers.Contract(address, abiData.abi, signer)
}

async function getTokenContract(signer: ethers.Signer) {
    const addrData = await import('@/contracts/PropertyBiddingToken-address.json')
    const abiData = await import('@/contracts/PropertyBiddingToken.json')
    const address = addrData.address
    if (!address || address === '0x0000000000000000000000000000000000000000') {
        throw new Error('ARCH token contract not yet deployed.')
    }
    return new ethers.Contract(address, abiData.abi, signer)
}

export const useAuctionStore = create<AuctionState>((set, get) => ({
    auctions: [],
    currentAuction: null,
    aiValuation: null,
    bids: [],
    loading: false,
    bidding: false,
    approving: false,

    fetchActiveAuctions: async () => {
        set({ loading: true })
        try {
            const data = await api.get('/auction/active/all')
            set({ auctions: Array.isArray(data) ? data : [], loading: false })
        } catch {
            set({ loading: false, auctions: [] })
        }
    },

    fetchAuctionDetail: async (auctionId: string) => {
        set({ loading: true })
        try {
            const data = await api.get(`/auction/${auctionId}`)
            set({
                currentAuction: data.auction,
                aiValuation: data.ai_valuation || null,
                bids: data.bids || [],
                loading: false,
            })
        } catch {
            set({ loading: false })
        }
    },

    createAuction: async (propertyId: string, reservePrice: number, durationHours: number) => {
        const token = useAuthStore.getState().accessToken
        const res = await api.post(`/auction/create/${propertyId}`, {
            reserve_price: reservePrice,
            duration_hours: durationHours,
        }, token)
        const { usePropertyStore } = await import('./propertyStore')
        await usePropertyStore.getState().syncAll()
        const { usePortfolioStore } = await import('./portfolioStore')
        usePortfolioStore.getState().fetchPortfolio()
        return res
    },

    placeBid: async (auctionId: string, amount: number) => {
        set({ bidding: true })
        const toastId = toast.loading('Preparing bid...')
        try {
            const auction = get().currentAuction
            if (!auction) throw new Error('Auction not loaded')

            let txHash = ''

            try {
                const signer = await getEthersSigner()

                // ─── Step 1: Approve Token Spend ──────────────────────────────────────
                set({ approving: true })
                toast.loading('Step 1/3: Approve ARCH tokens for escrow...', { id: toastId })

                let auctionContractAddr: string = ''
                let tokenContractAddr: string = ''
                let useOnChain = true

                try {
                    const addrData = await import('@/contracts/PropertyAuction-address.json')
                    auctionContractAddr = addrData.address
                    const tokenData = await import('@/contracts/PropertyBiddingToken-address.json')
                    tokenContractAddr = tokenData.address
                    if (!auctionContractAddr || auctionContractAddr === '0x0000000000000000000000000000000000000000') {
                        useOnChain = false
                    }
                } catch (e) {
                    if (!blockchainProvider.isMock()) useOnChain = false
                }

                if (useOnChain || blockchainProvider.isMock()) {
                    // ERC-20 Approval (amount in token units — using parseUnits for 18 decimals)
                    const amountWei = ethers.parseUnits(amount.toString(), 18)

                    toast.loading(blockchainProvider.isMock() ? 'Mock: Approving ARCH tokens...' : 'Approving... waiting for confirmation', { id: toastId })
                    await blockchainProvider.approveTokens(tokenContractAddr, auctionContractAddr, amountWei)

                    set({ approving: false })

                    // ─── Step 2: Place Bid ─────────────────────────────────────────────────
                    toast.loading(blockchainProvider.isMock() ? 'Mock: Confirm bid...' : 'Step 2/3: Confirm bid in MetaMask...', { id: toastId })
                    const onChainId = (auction as any).on_chain_id ?? parseInt(auction.id)
                    if (isNaN(onChainId)) throw new Error('Invalid on-chain auction ID')

                    const result = await blockchainProvider.placeBid(auctionContractAddr, onChainId, amountWei)

                    toast.loading(blockchainProvider.isMock() ? 'Mock: Mining bid transaction...' : 'Step 3/3: Mining bid transaction...', { id: toastId })
                    txHash = result.txHash
                }

            } catch (ethError: any) {
                set({ approving: false })
                const parsedMsg = parseBlockchainError(ethError)
                toast.error(parsedMsg, { id: toastId })
                throw new Error(parsedMsg)
            }

            // ─── Step 3: Record in Backend ─────────────────────────────────────────
            const token = useAuthStore.getState().accessToken
            const result = await api.post(`/auction/${auctionId}/bid`, { amount, tx_hash: txHash }, token)

            toast.success(`Bid of ₹${amount.toLocaleString('en-IN')} placed!`, { id: toastId })
            await get().fetchAuctionDetail(auctionId)
            const { usePropertyStore } = await import('./propertyStore')
            await usePropertyStore.getState().syncAll()
            return result
        } catch (e: any) {
            console.error('Bid failed:', e)
            throw e
        } finally {
            set({ bidding: false, approving: false })
        }
    },

    finalizeAuction: async (auctionId: string) => {
        const toastId = toast.loading('Finalizing auction...')
        try {
            const auction = get().currentAuction
            if (!auction) throw new Error('Auction not loaded')

            try {
                const onChainId = (auction as any).on_chain_id ?? parseInt(auction.id)
                let auctionContractAddr = ''

                try {
                    const addrData = await import('@/contracts/PropertyAuction-address.json')
                    auctionContractAddr = addrData.address
                } catch (e) {
                    if (!blockchainProvider.isMock()) throw e
                }

                toast.loading(blockchainProvider.isMock() ? 'Mock: Confirm finalization...' : 'Confirm finalization in MetaMask...', { id: toastId })
                await blockchainProvider.finalizeAuction(auctionContractAddr, onChainId)

            } catch (ethError: any) {
                const parsedMsg = parseBlockchainError(ethError)
                // If contract not deployed, fall through to backend-only finalization
                if (!parsedMsg.includes('not yet deployed')) {
                    toast.error(parsedMsg, { id: toastId })
                    throw new Error(parsedMsg)
                }
            }

            const token = useAuthStore.getState().accessToken
            await api.post(`/auction/${auctionId}/finalize`, {}, token)

            toast.success('Auction finalized!', { id: toastId })
            await get().fetchAuctionDetail(auctionId)
            const { usePropertyStore } = await import('./propertyStore')
            await usePropertyStore.getState().syncAll()
        } catch (e: any) {
            console.error('Finalize failed:', e)
            throw e
        }
    },
}))
