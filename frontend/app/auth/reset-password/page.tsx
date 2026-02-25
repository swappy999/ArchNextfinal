'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Lock, Loader2, CheckCircle, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthInput from '@/components/auth/AuthInput'
import { useAuthStore } from '@/store/authStore'

function ResetPasswordForm() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const searchParams = useSearchParams()
    const router = useRouter()
    const { resetPassword } = useAuthStore()

    const token = searchParams.get('token')

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) return

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        setError('')

        try {
            await resetPassword(token, password, confirmPassword)
            setSuccess(true)
            setTimeout(() => {
                router.push('/auth/signin')
            }, 3000)
        } catch (err: any) {
            setError(err.message || 'Failed to reset password.')
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
            title="Set New Password"
            subtitle="Create a strong password for your account."
        >
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
                {success ? (
                    <motion.div variants={fadeUp} className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(52,211,153,0.15)] relative">
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
                        </div>
                        <h3 className="text-white font-semibold">Password Reset Successful</h3>
                        <p className="text-[13px] text-zinc-400">
                            Your password has been updated. Redirecting to sign in...
                        </p>
                    </motion.div>
                ) : !token ? (
                    <motion.div variants={fadeUp} className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.15)] relative">
                            <ShieldAlert className="w-8 h-8 text-rose-400" />
                            <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full animate-pulse" />
                        </div>
                        <h3 className="text-white font-semibold">Invalid Reset Link</h3>
                        <p className="text-[13px] text-zinc-400">
                            This link is invalid or has expired.
                        </p>
                        <Link href="/auth/forgot-password" className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
                            Request a new link →
                        </Link>
                    </motion.div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-3">
                        <motion.div variants={fadeUp}>
                            <AuthInput
                                icon={Lock}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="New password"
                                required
                                autoComplete="new-password"
                            />
                        </motion.div>

                        <motion.div variants={fadeUp}>
                            <AuthInput
                                icon={Lock}
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                                autoComplete="new-password"
                                error={error}
                            />
                        </motion.div>

                        <motion.div variants={fadeUp}>
                            <button
                                type="submit"
                                disabled={loading || !password || !confirmPassword}
                                className="group relative w-full h-12 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden mt-2"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 transition-opacity duration-300 group-hover:opacity-90" />
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg -z-10" />

                                <span className="relative flex items-center justify-center gap-2 text-white">
                                    {loading ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <>
                                            Reset Password
                                            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </motion.div>
                    </form>
                )}
            </motion.div>
        </AuthLayout>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <AuthLayout title="Set New Password" subtitle="Loading...">
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                </div>
            </AuthLayout>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}
