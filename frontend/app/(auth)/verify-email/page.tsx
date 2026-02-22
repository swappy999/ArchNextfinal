'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2, Mail, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AuthLayout from '@/components/auth/AuthLayout'
import OTPInput from '@/components/auth/OTPInput'

export default function VerifyEmailPage() {
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [resendTimer, setResendTimer] = useState(60)
    const [canResend, setCanResend] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (resendTimer <= 0) {
            setCanResend(true)
            return
        }
        const interval = setInterval(() => setResendTimer((t) => t - 1), 1000)
        return () => clearInterval(interval)
    }, [resendTimer])

    const handleComplete = async (otp: string) => {
        setCode(otp)
        setLoading(true)
        setError('')
        try {
            // TODO: wire to API — verify OTP
            await new Promise((r) => setTimeout(r, 1500))
            router.push('/success')
        } catch (err: any) {
            setError('Invalid verification code. Please try again.')
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (!canResend) return
        setCanResend(false)
        setResendTimer(60)
        // TODO: wire to API — resend OTP
        await new Promise((r) => setTimeout(r, 500))
    }

    return (
        <AuthLayout
            title="Verify your email"
            subtitle="We sent a 6-digit code to your email address."
        >
            <div className="space-y-6">
                {/* Email icon badge */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
                    className="flex justify-center"
                >
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center">
                            <Mail size={24} className="text-cyan-400" />
                        </div>
                        <div className="absolute inset-0 w-14 h-14 rounded-2xl bg-cyan-400/10 blur-xl" />

                        {/* Notification dot */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center"
                        >
                            <span className="text-[9px] font-bold text-black">1</span>
                        </motion.div>
                    </div>
                </motion.div>

                {/* OTP Input */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                >
                    <OTPInput length={6} onComplete={handleComplete} />
                </motion.div>

                {/* Error */}
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-400 text-center"
                    >
                        {error}
                    </motion.p>
                )}

                {/* Loading state */}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center gap-2 text-sm text-zinc-400"
                    >
                        <Loader2 size={14} className="animate-spin text-cyan-400" />
                        <span>Verifying...</span>
                    </motion.div>
                )}

                {/* Resend timer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center"
                >
                    {canResend ? (
                        <button
                            onClick={handleResend}
                            className="flex items-center justify-center gap-1.5 mx-auto text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            <RotateCcw size={13} />
                            Resend code
                        </button>
                    ) : (
                        <p className="text-[13px] text-zinc-500">
                            Resend code in{' '}
                            <span className="text-zinc-300 font-mono tabular-nums">
                                {String(Math.floor(resendTimer / 60)).padStart(1, '0')}:{String(resendTimer % 60).padStart(2, '0')}
                            </span>
                        </p>
                    )}
                </motion.div>
            </div>
        </AuthLayout>
    )
}
