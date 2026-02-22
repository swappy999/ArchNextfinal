'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Mail, Loader2, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthInput from '@/components/auth/AuthInput'
import { api } from '@/lib/api'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            await api.post('/auth/forgot-password', { email })
            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email.')
        } finally {
            setLoading(false)
        }
    }

    const stagger = {
        hidden: {},
        show: { transition: { staggerChildren: 0.06 } },
    }

    const fadeUp = {
        hidden: { opacity: 0, y: 6 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    }

    return (
        <AuthLayout
            title="Reset Password"
            subtitle="We'll send you a transmission to regain access."
        >
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">

                {success ? (
                    <motion.div variants={fadeUp} className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(52,211,153,0.15)] relative">
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
                        </div>
                        <h3 className="text-white font-semibold">Check your inbox</h3>
                        <p className="text-[13px] text-zinc-400">
                            We have sent password recovery instructions to <br /> <span className="text-white font-medium">{email}</span>
                        </p>
                    </motion.div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-4">
                        <motion.div variants={fadeUp}>
                            <AuthInput
                                icon={Mail}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                required
                                autoComplete="email"
                                error={error}
                            />
                        </motion.div>

                        <motion.div variants={fadeUp}>
                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="group relative w-full h-12 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden mt-2"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 transition-opacity duration-300 group-hover:opacity-90" />
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg -z-10" />

                                <span className="relative flex items-center justify-center gap-2 text-white">
                                    {loading ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <>
                                            Send instructions
                                            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </motion.div>
                    </form>
                )}

                <motion.div variants={fadeUp} className="flex justify-center pt-4">
                    <Link href="/auth/signin" className="flex items-center gap-2 text-[12px] text-zinc-500 hover:text-cyan-400 transition-colors">
                        <ArrowLeft size={14} /> Back to Sign In
                    </Link>
                </motion.div>
            </motion.div>
        </AuthLayout>
    )
}
