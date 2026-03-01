import { create } from 'zustand'
import { ethers } from 'ethers'

export const STABLE_RPC_URLS = [
    "https://rpc-amoy.polygon.technology",
    "https://polygon-amoy-bor-rpc.publicnode.com",
    "https://rpc.ankr.com/polygon_amoy"
];

export const parseBlockchainError = (error: any): string => {
    const code = error.code || (error.error && error.error.code);
    const message = error.message || "";

    if (code === -32002 || message.includes("too many errors") || message.includes("coalesce")) {
        return "RPC Node Congested. Please try again or switch to a stable RPC in MetaMask settings.";
    }
    if (error.code === 'ACTION_REJECTED') {
        return "Transaction rejected by user.";
    }
    if (message.includes("insufficient funds")) {
        return "Insufficient MATIC for gas fees.";
    }
    return error.reason || message || "Blockchain transaction failed.";
}

export const getEthersSigner = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('MetaMask not installed');
    }
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    return await provider.getSigner();
}

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
        if (process.env.NEXT_PUBLIC_BLOCKCHAIN_MODE === 'mock') {
            set({
                address: '0xMOCKWALLET8b6f3a2c091dEa5b7C4B0e2F95A3bC4',
                chainId: 80002, // Amoy chain ID
                isConnecting: false,
                isConnected: true,
            })
            return
        }

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
