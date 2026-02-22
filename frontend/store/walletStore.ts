import { create } from 'zustand'

interface WalletState {
    address: string | null
    chainId: number | null
    isConnecting: boolean
    isConnected: boolean
    connect: () => Promise<void>
    disconnect: () => void
}

export const useWalletStore = create<WalletState>((set) => ({
    address: null,
    chainId: null,
    isConnecting: false,
    isConnected: false,

    connect: async () => {
        if (typeof window === 'undefined' || !(window as any).ethereum) {
            alert('MetaMask not detected. Please install MetaMask.')
            return
        }
        set({ isConnecting: true })
        try {
            const eth = (window as any).ethereum
            const accounts = await eth.request({ method: 'eth_requestAccounts' })
            const chainId = await eth.request({ method: 'eth_chainId' })
            set({
                address: accounts[0],
                chainId: parseInt(chainId, 16),
                isConnecting: false,
                isConnected: true,
            })
            eth.on('accountsChanged', (accs: string[]) =>
                set({ address: accs[0] || null, isConnected: !!accs[0] })
            )
            eth.on('chainChanged', (id: string) =>
                set({ chainId: parseInt(id, 16) })
            )
        } catch {
            set({ isConnecting: false, isConnected: false })
        }
    },

    disconnect: () => set({ address: null, chainId: null, isConnected: false }),
}))
