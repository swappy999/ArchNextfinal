'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface AuthSuccessProps {
    message?: string
    redirectTo?: string
    redirectDelay?: number
}

export default function AuthSuccess({
    message = 'Authentication successful',
    redirectTo = '/dashboard',
    redirectDelay = 2500,
}: AuthSuccessProps) {
    const router = useRouter()
    const [countdown, setCountdown] = useState(Math.ceil(redirectDelay / 1000))

    useEffect(() => {
        const timer = setTimeout(() => router.push(redirectTo), redirectDelay)
        const interval = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000)
        return () => {
            clearTimeout(timer)
            clearInterval(interval)
        }
    }, [router, redirectTo, redirectDelay])

    return (
        <div className="flex flex-col items-center text-center space-y-6 py-4">
            {/* Animated checkmark */}
            <div className="relative">
                {/* Outer glow ring */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                        background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
                    }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                        className="w-16 h-16 rounded-full border-2 border-emerald-400/40 flex items-center justify-center bg-emerald-500/10"
                    >
                        <motion.svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-emerald-400"
                        >
                            <motion.path
                                d="M20 6 9 17l-5-5"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 0.5, duration: 0.4, ease: 'easeInOut' }}
                            />
                        </motion.svg>
                    </motion.div>
                </motion.div>

                {/* Pulse ring */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0.6 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full border border-emerald-400/30"
                />
            </div>

            {/* Message */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="space-y-2"
            >
                <h2 className="text-lg font-semibold text-white">{message}</h2>
                <p className="text-sm text-zinc-400">
                    Redirecting in {countdown}s...
                </p>
            </motion.div>

            {/* Progress bar */}
            <motion.div className="w-full max-w-[200px] h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: redirectDelay / 1000, ease: 'linear' }}
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full"
                    style={{ boxShadow: '0 0 10px rgba(34,211,238,0.4)' }}
                />
            </motion.div>
        </div>
    )
}
