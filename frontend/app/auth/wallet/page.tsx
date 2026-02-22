'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ArrowRight, ShieldCheck, Wallet, ChevronRight } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import { useAuthStore } from '@/store/authStore'
import { useWalletStore } from '@/store/walletStore'

export default function WalletConnectPage() {
    const router = useRouter()
    const { user, emailVerified, setWalletConnected } = useAuthStore()
    const { isConnected, address, isConnecting, connect } = useWalletStore()

    const [verifying, setVerifying] = useState(false)
    const [signatureComplete, setSignatureComplete] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        // Strict guard: ensure they've passed email verification
        if (!user || !emailVerified) {
            router.replace('/auth/signin')
        }
    }, [user, emailVerified, router])

    const handleSignature = async () => {
        if (!isConnected || !address) return

        setVerifying(true)
        setError('')

        try {
            // Simulated cinematic signature process
            // In production, this invokes wagmi/viem signMessage and verifies via the backend
            await new Promise((resolve) => setTimeout(resolve, 2000))

            setSignatureComplete(true)
            setWalletConnected(address)

            // Redirect to dashboard after a brief success delay
            setTimeout(() => {
                router.push('/dashboard')
            }, 1500)

        } catch (err) {
            setError('Signature request rejected. Please try again.')
        } finally {
            if (!signatureComplete) setVerifying(false)
        }
    }

    const stagger = {
        hidden: {},
        show: { transition: { staggerChildren: 0.1 } },
    }

    const fadeUp = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
    }

    return (
        <AuthLayout
            title="Secure Asset Vault"
            subtitle="Link your Web3 wallet to tokenize and trade tier-1 real estate."
        >
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

                {/* Visual Identity */}
                <motion.div variants={fadeUp} className="flex justify-center mb-4">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-900/40 to-blue-900/40 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.15)] relative z-10 overflow-hidden transform rotate-3">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                            {signatureComplete ? (
                                <ShieldCheck className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                            ) : (
                                <Wallet className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                            )}
                        </div>
                        <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-2xl animate-pulse" />
                    </div>
                </motion.div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold p-3 rounded-lg text-center uppercase tracking-widest"
                    >
                        {error}
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {!isConnected ? (
                        <motion.div
                            key="connect"
                            variants={fadeUp}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-4"
                        >
                            <div className="text-center space-y-2 mb-6">
                                <h3 className="text-sm font-semibold text-white">MetaMask Required</h3>
                                <p className="text-[12px] text-zinc-400 leading-relaxed px-4">
                                    ArchNext operates strictly on-chain. Connect your wallet to access the decentralized dashboard.
                                </p>
                            </div>

                            <button
                                onClick={connect}
                                disabled={isConnecting}
                                className="group relative w-full h-14 rounded-xl text-sm font-semibold transition-all duration-300 border border-white/10 hover:border-cyan-500/50 bg-[#0A0D14] hover:bg-cyan-950/20 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                <span className="relative flex items-center justify-between px-6 text-white uppercase tracking-[0.2em] text-[11px] font-black">
                                    <div className="flex items-center gap-3">
                                        {isConnecting ? (
                                            <Loader2 size={16} className="animate-spin text-cyan-400" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center">
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-4 h-4" />
                                            </div>
                                        )}
                                        {isConnecting ? 'INITIALIZING...' : 'CONNECT METAMASK'}
                                    </div>
                                    <ChevronRight size={16} className="text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                                </span>
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sign"
                            variants={fadeUp}
                            initial="hidden"
                            animate="show"
                            className="space-y-6"
                        >
                            <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 relative">
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0A0D14]" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Connected</span>
                                        <span className="text-sm font-medium text-white">{`${address?.slice(0, 6)}...${address?.slice(-4)}`}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => address && setWalletConnected(address)}
                                    className="text-[10px] uppercase font-bold text-zinc-500 hover:text-white transition-colors"
                                >
                                    Disconnect
                                </button>
                            </div>

                            <button
                                onClick={handleSignature}
                                disabled={verifying || signatureComplete}
                                className="group relative w-full h-12 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-600 transition-opacity duration-300 group-hover:opacity-90" />
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg -z-10" />

                                <span className="relative flex items-center justify-center gap-2 text-white uppercase tracking-[0.2em] text-[11px] font-black">
                                    {verifying ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            AWAITING SIGNATURE...
                                        </>
                                    ) : signatureComplete ? (
                                        <>
                                            <ShieldCheck size={16} />
                                            VAULT UNLOCKED
                                        </>
                                    ) : (
                                        <>
                                            SIGN TO ENTER
                                            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </motion.div>
        </AuthLayout>
    )
}
