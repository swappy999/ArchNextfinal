'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, User, Mail, Lock, Loader2, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useWalletStore } from '@/store/walletStore'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthInput from '@/components/auth/AuthInput'
import PasswordStrength from '@/components/auth/PasswordStrength'

export default function SignupPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { signup } = useAuthStore()
    const { connect, isConnected, address, isConnecting } = useWalletStore()
    const router = useRouter()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            await signup(form.name, form.email, form.password)
            router.push('/auth/verify')
        } catch (err: any) {
            setError(err.message || 'Sign up failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleWalletConnect = async () => {
        try {
            await connect()
            router.push('/verify-wallet')
        } catch {
            setError('Wallet connection failed')
        }
    }

    const handleGoogleSignup = () => {
        router.push('/auth/verify-google')
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
            title="Create your account"
            subtitle="Join the future of smart city investment."
        >
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
                {/* Social / Web3 buttons */}
                <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleGoogleSignup}
                        className="group flex items-center justify-center gap-2 h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm text-zinc-300 hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="group-hover:text-white transition-colors">Google</span>
                    </button>

                    <button
                        onClick={handleWalletConnect}
                        disabled={isConnecting}
                        className="group flex items-center justify-center gap-2 h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm text-zinc-300 hover:bg-white/[0.06] hover:border-cyan-500/30 hover:text-cyan-300 transition-all duration-300 disabled:opacity-50"
                    >
                        {isConnecting ? (
                            <Loader2 size={15} className="animate-spin text-cyan-400" />
                        ) : (
                            <Wallet size={15} className="text-zinc-400 group-hover:text-cyan-400 transition-colors" />
                        )}
                        <span>
                            {isConnected && address
                                ? `${address.slice(0, 5)}...${address.slice(-3)}`
                                : 'MetaMask'}
                        </span>
                    </button>
                </motion.div>

                {/* Divider */}
                <motion.div variants={fadeUp} className="flex items-center gap-4">
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-white/[0.06]" />
                    <span className="text-[11px] text-zinc-500 uppercase tracking-widest">or</span>
                    <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-white/[0.06]" />
                </motion.div>

                {/* Form */}
                <form onSubmit={handleSignup} className="space-y-3">
                    <motion.div variants={fadeUp}>
                        <AuthInput
                            icon={User}
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Full name"
                            required
                            autoComplete="name"
                        />
                    </motion.div>

                    <motion.div variants={fadeUp}>
                        <AuthInput
                            icon={Mail}
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="Email address"
                            required
                            autoComplete="email"
                        />
                    </motion.div>

                    <motion.div variants={fadeUp}>
                        <AuthInput
                            icon={Lock}
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder="Create password"
                            required
                            autoComplete="new-password"
                            error={error}
                        />
                    </motion.div>

                    {/* Password strength */}
                    <motion.div variants={fadeUp}>
                        <AnimatePresence>
                            <PasswordStrength password={form.password} />
                        </AnimatePresence>
                    </motion.div>

                    {/* Submit */}
                    <motion.div variants={fadeUp}>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full h-12 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden mt-1"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 transition-opacity duration-300 group-hover:opacity-90" />
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg -z-10" />

                            <span className="relative flex items-center justify-center gap-2 text-white">
                                {loading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <>
                                        Create account
                                        <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                    </motion.div>
                </form>

                {/* Terms */}
                <motion.p variants={fadeUp} className="text-[11px] text-zinc-500 text-center leading-relaxed">
                    By signing up, you agree to our{' '}
                    <span className="text-zinc-400 hover:text-cyan-400 cursor-pointer transition-colors">Terms</span>
                    {' '}and{' '}
                    <span className="text-zinc-400 hover:text-cyan-400 cursor-pointer transition-colors">Privacy Policy</span>
                </motion.p>
            </motion.div>

            {/* Footer link */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center text-[13px] text-zinc-500 mt-6"
            >
                Already have an account?{' '}
                <Link href="/auth/signin" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                    Sign in
                </Link>
            </motion.p>
        </AuthLayout>
    )
}
