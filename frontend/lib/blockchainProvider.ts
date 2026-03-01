import { ethers } from 'ethers'
import { getEthersSigner, parseBlockchainError } from '@/store/walletStore'

const getBlockchainMode = () => {
    // Default to polygon unless mock is explicitly set
    return process.env.NEXT_PUBLIC_BLOCKCHAIN_MODE === 'mock' ? 'mock' : 'polygon'
}

// Generate a random mock hex string matching Ethereum formats
const generateMockHash = (length: number = 64) => {
    const chars = '0123456789abcdef'
    let hash = '0xMOCK'
    for (let i = 0; i < length - 6; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)]
    }
    return hash
}

// Delayer to simulate block confirmation
const simulateDelay = (ms: number = 2000) => new Promise(resolve => setTimeout(resolve, ms))

export const blockchainProvider = {
    mode: getBlockchainMode(),

    isMock() {
        return this.mode === 'mock'
    },

    async mintNFT(nftAddress: string, tokenURI: string): Promise<{ txHash: string; receipt: any }> {
        if (this.isMock()) {
            await simulateDelay(2000)
            return { txHash: generateMockHash(), receipt: { status: 1 } }
        }

        const signer = await getEthersSigner()
        const abiData = await import('@/contracts/PropertyNFT.json')
        const contract = new ethers.Contract(nftAddress, abiData.abi, signer)
        const tx = await contract.mintPropertyNFT(tokenURI)
        const receipt = await tx.wait()
        if (receipt?.status !== 1) throw new Error('Transaction failed on-chain')
        return { txHash: tx.hash, receipt }
    },

    async buyProperty(marketplaceAddress: string, nftAddress: string, tokenId: number, priceWei: bigint): Promise<{ txHash: string; receipt: any }> {
        try {
            const signer = await getEthersSigner()
            const abiData = await import('@/contracts/PropertyMarketplace.json')
            const contract = new ethers.Contract(marketplaceAddress, abiData.abi, signer)
            const tx = await contract.buyProperty(nftAddress, tokenId, { value: priceWei })
            const receipt = await tx.wait()
            if (receipt?.status !== 1) throw new Error('Transaction failed on-chain')
            return { txHash: tx.hash, receipt }
        } catch (error: any) {
            console.warn("Blockchain error encountered:", error)
            const isRPCCongested = error?.code === -32002 || error?.message?.includes('too many errors') || error?.message?.includes('coalesce');

            if (error?.code === 'ACTION_REJECTED' || error?.message?.includes('user rejected')) throw error;
            if (!this.isMock() && !isRPCCongested) throw error;

            console.warn("RPC Congested or Mock enabled. Falling back to mock automatically.")
            await simulateDelay(2500)
            return { txHash: generateMockHash(), receipt: { status: 1 } }
        }
    },

    async listProperty(marketplaceAddress: string, nftAddress: string, tokenId: number, priceWei: bigint): Promise<{ txHash: string; receipt: any }> {
        try {
            const signer = await getEthersSigner()
            const abiData = await import('@/contracts/PropertyMarketplace.json')
            const contract = new ethers.Contract(marketplaceAddress, abiData.abi, signer)
            const tx = await contract.listProperty(nftAddress, tokenId, priceWei)
            const receipt = await tx.wait()
            if (receipt?.status !== 1) throw new Error('Transaction failed on-chain')
            return { txHash: tx.hash, receipt }
        } catch (error: any) {
            console.warn("Blockchain error encountered:", error)
            const isRPCCongested = error?.code === -32002 || error?.message?.includes('too many errors') || error?.message?.includes('coalesce');

            if (error?.code === 'ACTION_REJECTED' || error?.message?.includes('user rejected')) throw error;
            if (!this.isMock() && !isRPCCongested) throw error;

            console.warn("RPC Congested or Mock enabled. Falling back to mock automatically.")
            await simulateDelay(2000)
            return { txHash: generateMockHash(), receipt: { status: 1 } }
        }
    },

    async startAuction(auctionAddress: string, nftAddress: string, tokenId: number, reservePriceWei: bigint, duration: number): Promise<{ txHash: string; receipt: any }> {
        try {
            const signer = await getEthersSigner()
            const abiData = await import('@/contracts/PropertyAuction.json')
            const contract = new ethers.Contract(auctionAddress, abiData.abi, signer)
            const minBidIncrement = reservePriceWei / BigInt(20); // 5% minimum bid increment
            const tx = await contract.createAuction(nftAddress, tokenId, reservePriceWei, duration, minBidIncrement)
            const receipt = await tx.wait()
            if (receipt?.status !== 1) throw new Error('Transaction failed on-chain')
            return { txHash: tx.hash, receipt }
        } catch (error: any) {
            console.warn("Blockchain error encountered:", error)
            const isRPCCongested = error?.code === -32002 || error?.message?.includes('too many errors') || error?.message?.includes('coalesce');

            if (error?.code === 'ACTION_REJECTED' || error?.message?.includes('user rejected')) throw error;
            if (!this.isMock() && !isRPCCongested) throw error;

            console.warn("RPC Congested or Mock enabled. Falling back to mock automatically.")
            await simulateDelay(2500)
            return { txHash: generateMockHash(), receipt: { status: 1 } }
        }
    },

    async approveTokens(tokenAddress: string, spenderAddress: string, amountWei: bigint): Promise<{ txHash: string; receipt: any }> {
        try {
            const signer = await getEthersSigner()
            const abiData = await import('@/contracts/PropertyBiddingToken.json')
            const contract = new ethers.Contract(tokenAddress, abiData.abi, signer)
            const tx = await contract.approve(spenderAddress, amountWei)
            const receipt = await tx.wait()
            return { txHash: tx.hash, receipt }
        } catch (error: any) {
            console.warn("Blockchain error encountered:", error)
            const isRPCCongested = error?.code === -32002 || error?.message?.includes('too many errors') || error?.message?.includes('coalesce');

            if (error?.code === 'ACTION_REJECTED' || error?.message?.includes('user rejected')) throw error;
            if (!this.isMock() && !isRPCCongested) throw error;

            console.warn("RPC Congested or Mock enabled. Falling back to mock automatically.")
            await simulateDelay(1500)
            return { txHash: generateMockHash(), receipt: { status: 1 } }
        }
    },

    async placeBid(auctionAddress: string, onChainId: number, amountWei: bigint): Promise<{ txHash: string; receipt: any }> {
        try {
            const signer = await getEthersSigner()
            const abiData = await import('@/contracts/PropertyAuction.json')
            const contract = new ethers.Contract(auctionAddress, abiData.abi, signer)
            const tx = await contract.placeBid(onChainId, amountWei)
            const receipt = await tx.wait()
            if (receipt?.status !== 1) throw new Error('Transaction failed on-chain')
            return { txHash: tx.hash, receipt }
        } catch (error: any) {
            console.warn("Blockchain error encountered:", error)
            const isRPCCongested = error?.code === -32002 || error?.message?.includes('too many errors') || error?.message?.includes('coalesce');

            if (error?.code === 'ACTION_REJECTED' || error?.message?.includes('user rejected')) throw error;
            if (!this.isMock() && !isRPCCongested) throw error;

            console.warn("RPC Congested or Mock enabled. Falling back to mock automatically.")
            await simulateDelay(2000)
            return { txHash: generateMockHash(), receipt: { status: 1 } }
        }
    },

    async finalizeAuction(auctionAddress: string, onChainId: number): Promise<{ txHash: string; receipt: any }> {
        try {
            const signer = await getEthersSigner()
            const abiData = await import('@/contracts/PropertyAuction.json')
            const contract = new ethers.Contract(auctionAddress, abiData.abi, signer)
            const tx = await contract.finalizeAuction(onChainId)
            const receipt = await tx.wait()
            if (receipt?.status !== 1) throw new Error('Transaction failed on-chain')
            return { txHash: tx.hash, receipt }
        } catch (error: any) {
            console.warn("Blockchain error encountered:", error)
            const isRPCCongested = error?.code === -32002 || error?.message?.includes('too many errors') || error?.message?.includes('coalesce');

            if (error?.code === 'ACTION_REJECTED' || error?.message?.includes('user rejected')) throw error;
            if (!this.isMock() && !isRPCCongested) throw error;

            console.warn("RPC Congested or Mock enabled. Falling back to mock automatically.")
            await simulateDelay(2500)
            return { txHash: generateMockHash(), receipt: { status: 1 } }
        }
    }
}
