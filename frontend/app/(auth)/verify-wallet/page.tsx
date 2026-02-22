'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2, Wallet, Shield, Hexagon, Link2, Fingerprint } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useWalletStore } from '@/store/walletStore'
import AuthLayout from '@/components/auth/AuthLayout'

type WalletStatus = 'connecting' | 'signing' | 'verifying' | 'success' | 'error'

export default function VerifyWalletPage() {
    const [status, setStatus] = useState<WalletStatus>('connecting')
    const { address, isConnected, chainId, connect } = useWalletStore()
    const router = useRouter()

    useEffect(() => {
        if (!isConnected) {
            connect()
        }
    }, [isConnected, connect])

    useEffect(() => {
        if (!isConnected) return

        // Simulate signature flow
        const t1 = setTimeout(() => setStatus('signing'), 1500)
        const t2 = setTimeout(() => setStatus('verifying'), 4000)
        const t3 = setTimeout(() => setStatus('success'), 6000)
        const t4 = setTimeout(() => router.push('/success'), 7500)

        return () => {
            clearTimeout(t1)
            clearTimeout(t2)
            clearTimeout(t3)
            clearTimeout(t4)
        }
    }, [isConnected, router])

    const truncatedAddress = address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : '0x...'

    const networkName = chainId === 1 ? 'Ethereum Mainnet'
        : chainId === 5 ? 'Goerli Testnet'
            : chainId === 31337 ? 'Localhost'
                : chainId ? `Chain ${chainId}`
                    : 'Unknown'

    return (
        <AuthLayout
            title="Wallet Verification"
            subtitle="Connect and sign to verify your identity."
        >
            <div className="space-y-6 py-2">
                {/* Wallet visualization */}
                <div className="flex justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative"
                    >
                        {/* Hexagonal frame */}
                        <div className="w-24 h-24 relative flex items-center justify-center">
                            {/* Animated ring */}
                            <motion.div
                                animate={{
                                    rotate: 360,
                                    borderColor: status === 'success'
                                        ? 'rgba(16,185,129,0.3)'
                                        : 'rgba(34,211,238,0.2)',
                                }}
                                transition={{
                                    rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
                                    borderColor: { duration: 0.5 },
                                }}
                                className="absolute inset-0 rounded-full border-2 border-dashed"
                            />

                            {/* Inner glow */}
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${status === 'success'
                                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                                    : 'bg-gradient-to-br from-cyan-500/15 to-blue-600/15 border border-cyan-500/20'
                                }`}>
                                {status === 'success' ? (
                                    <motion.div
                                        initial={{ scale: 0, rotate: -90 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                    >
                                        <CheckCircle size={28} className="text-emerald-400" />
                                    </motion.div>
                                ) : (
                                    <Wallet size={28} className="text-cyan-400" />
                                )}
                            </div>

                            {/* Blockchain badge */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
                                className="absolute -top-1 -right-1 w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center"
                            >
                                <Hexagon size={14} className="text-cyan-400" />
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Wallet info card */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Link2 size={13} className="text-zinc-500" />
                            <span className="text-xs text-zinc-400">Address</span>
                        </div>
                        <span className="text-xs font-mono text-cyan-300">{truncatedAddress}</span>
                    </div>
                    <div className="h-[1px] bg-white/[0.04]" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield size={13} className="text-zinc-500" />
                            <span className="text-xs text-zinc-400">Network</span>
                        </div>
                        <span className="text-xs text-zinc-300">{networkName}</span>
                    </div>
                    <div className="h-[1px] bg-white/[0.04]" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Fingerprint size={13} className="text-zinc-500" />
                            <span className="text-xs text-zinc-400">Status</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${status === 'success' ? 'bg-emerald-400' : 'bg-cyan-400 animate-pulse'
                                }`} />
                            <span className={`text-xs ${status === 'success' ? 'text-emerald-400' : 'text-cyan-300'
                                }`}>
                                {status === 'connecting' ? 'Connecting'
                                    : status === 'signing' ? 'Awaiting signature'
                                        : status === 'verifying' ? 'Verifying'
                                            : 'Verified'}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Signature request visualization */}
                {status === 'signing' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-xl border border-cyan-500/10 bg-cyan-500/[0.03] p-4 space-y-2"
                    >
                        <div className="flex items-center gap-2">
                            <Fingerprint size={14} className="text-cyan-400" />
                            <span className="text-xs font-medium text-cyan-300">Signature Request</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                            Sign this message to verify wallet ownership for ArchNext platform authentication.
                        </p>
                        <div className="flex justify-center pt-1">
                            <Loader2 size={16} className="animate-spin text-cyan-400" />
                        </div>
                    </motion.div>
                )}

                {/* Step indicators */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                >
                    <WalletStep
                        icon={Wallet}
                        label="Connect wallet"
                        status={status === 'connecting' ? 'active' : 'done'}
                    />
                    <WalletStep
                        icon={Fingerprint}
                        label="Sign verification message"
                        status={status === 'connecting' ? 'pending' : status === 'signing' ? 'active' : 'done'}
                    />
                    <WalletStep
                        icon={Shield}
                        label="Verify on-chain identity"
                        status={status === 'success' ? 'done' : status === 'verifying' ? 'active' : 'pending'}
                    />
                </motion.div>
            </div>
        </AuthLayout>
    )
}

function WalletStep({
    icon: Icon,
    label,
    status,
}: {
    icon: any
    label: string
    status: 'pending' | 'active' | 'done'
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="shrink-0">
                {status === 'done' && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center"
                    >
                        <CheckCircle size={13} className="text-emerald-400" />
                    </motion.div>
                )}
                {status === 'active' && (
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <Loader2 size={13} className="animate-spin text-cyan-400" />
                    </div>
                )}
                {status === 'pending' && (
                    <div className="w-6 h-6 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-center">
                        <Icon size={12} className="text-zinc-500" />
                    </div>
                )}
            </div>
            <span className={`text-sm ${status === 'done' ? 'text-zinc-300' : status === 'active' ? 'text-white' : 'text-zinc-500'
                }`}>
                {label}
            </span>
        </div>
    )
}
