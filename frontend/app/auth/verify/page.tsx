'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

export default function VerifyEmailPage() {
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [timeLeft, setTimeLeft] = useState(60)

    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const router = useRouter()
    const { user, verifyOTP } = useAuthStore()

    useEffect(() => {
        if (!user || !user.email) {
            router.replace('/auth/signin')
        }

        // Auto-focus first input
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus()
        }
    }, [user, router])

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [timeLeft])

    const handleChange = (index: number, value: string) => {
        if (!/^[0-9]*$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        // Move to next input
        if (value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }

        // Auto-submit if full
        if (value !== '' && index === 5 && newOtp.every(v => v !== '')) {
            handleVerify(newOtp.join(''))
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').slice(0, 6).split('')
        if (pastedData.some(char => !/^[0-9]*$/.test(char))) return

        const newOtp = [...otp]
        pastedData.forEach((char, index) => {
            if (index < 6) newOtp[index] = char
        })
        setOtp(newOtp)

        // Focus appropriate input or submit
        if (pastedData.length === 6) {
            inputRefs.current[5]?.focus()
            handleVerify(newOtp.join(''))
        } else {
            inputRefs.current[pastedData.length]?.focus()
        }
    }
    const handleVerify = async (codeStr: string) => {
        if (codeStr.length !== 6) {
            setError('Please enter a valid 6-digit code')
            return
        }

        setLoading(true)
        setError('')

        try {
            if (!user?.email) throw new Error('No email found for verification')
            await verifyOTP(user.email, codeStr)
            router.push('/auth/wallet')
        } catch (err: any) {
            setError(err.message || 'Verification failed. Please check the code.')
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (timeLeft > 0 || !user?.email) return
        setLoading(true)
        setError('')
        try {
            await api.post('/auth/resend-verification', { email: user.email })
            setTimeLeft(60)
        } catch (err: any) {
            setError(err.message || 'Failed to resend code.')
        } finally {
            setLoading(false)
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
            title="Verification Required"
            subtitle={`We sent a secure transmission to ${user?.email || 'your email'}.`}
        >
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

                {/* Visual Indicator */}
                <motion.div variants={fadeUp} className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative z-10">
                            <ShieldCheck className="w-8 h-8 text-cyan-400" />
                        </div>
                        <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />
                    </div>
                </motion.div>

                {/* OTP Error Area */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold p-3 rounded-lg text-center uppercase tracking-widest"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 6-Digit Container */}
                <motion.div variants={fadeUp} className="flex items-center justify-between gap-2 sm:gap-3">
                    {otp.map((digit, i) => (
                        <div key={i} className="relative">
                            <input
                                ref={(el) => { inputRefs.current[i] = el }}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                onPaste={i === 0 ? handlePaste : undefined}
                                disabled={loading}
                                className="w-10 h-14 sm:w-12 sm:h-16 bg-[#05070A]/80 border-2 border-white/10 rounded-xl text-center text-xl font-black text-white focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] disabled:opacity-50"
                            />
                            {digit !== '' && (
                                <motion.div
                                    layoutId="glow"
                                    className="absolute inset-0 bg-cyan-400/20 blur-md rounded-xl -z-10"
                                />
                            )}
                        </div>
                    ))}
                </motion.div>

                {/* Submit Action */}
                <motion.div variants={fadeUp} className="pt-4">
                    <button
                        onClick={() => handleVerify(otp.join(''))}
                        disabled={loading || otp.some(v => v === '')}
                        className="group relative w-full h-12 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                    >
                        {/* Button gradient bg */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 transition-opacity duration-300 group-hover:opacity-90" />
                        {/* Hover glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg -z-10" />

                        <span className="relative flex items-center justify-center gap-2 text-white uppercase tracking-[0.2em] text-[11px] font-black">
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    VERIFYING...
                                </>
                            ) : (
                                <>
                                    Confirm Transmission
                                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </span>
                    </button>
                </motion.div>

                {/* Resend Logic */}
                <motion.div variants={fadeUp} className="flex items-center justify-center mt-6">
                    <button
                        onClick={handleResend}
                        disabled={timeLeft > 0 || loading}
                        className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-cyan-400 transition-colors disabled:opacity-50 disabled:hover:text-zinc-500"
                    >
                        <RefreshCw size={12} className={timeLeft === 0 && !loading ? "animate-none" : "animate-spin"} />
                        {timeLeft > 0 ? `Resend available in ${timeLeft}s` : 'Resend Code'}
                    </button>
                </motion.div>

            </motion.div>
        </AuthLayout>
    )
}
