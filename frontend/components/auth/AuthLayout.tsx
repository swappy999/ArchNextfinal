'use client'

import { motion } from 'framer-motion'
import ParticleBackground from './ParticleBackground'
import Image from 'next/image'

interface AuthLayoutProps {
    children: React.ReactNode
    title: string
    subtitle: string
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #080c18 0%, #0b1022 30%, #0d0f1a 60%, #080a14 100%)' }}
        >
            {/* Particle canvas background */}
            <ParticleBackground />

            {/* Ambient glow orbs */}
            <div className="fixed inset-0 pointer-events-none z-[1]">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/[0.04] blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/[0.04] blur-[120px]" />
                <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-blue-500/[0.03] blur-[100px]" />
            </div>

            {/* Scanline overlay */}
            <div className="fixed inset-0 pointer-events-none z-[2] opacity-[0.03]"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                }}
            />

            {/* Main content card */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-[420px]"
            >
                {/* Brand header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center mb-8"
                >
                    {/* Logo */}
                    <div className="relative mb-5 flex justify-center">
                        <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center">
                            <Image
                                src="/branding/logo-icon.png"
                                alt="ArchNext Icon"
                                fill
                                className="object-contain drop-shadow-[0_0_20px_rgba(14,165,233,0.4)] mix-blend-lighten brightness-[1.2]"
                                priority
                            />
                        </div>
                        {/* Logo glow */}
                        <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-cyan-400/10 blur-xl pointer-events-none" />
                    </div>

                    <h1 className="text-[22px] font-semibold text-white tracking-tight">
                        {title}
                    </h1>
                    <p className="text-sm text-zinc-400 mt-1.5 text-center max-w-[280px] leading-relaxed">
                        {subtitle}
                    </p>
                </motion.div>

                {/* Glass card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative"
                >
                    {/* Outer glow ring */}
                    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-cyan-500/20 via-transparent to-indigo-500/10 opacity-60" />

                    {/* Glass panel */}
                    <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-7 space-y-5
            shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.04)]"
                    >
                        {/* Top highlight line */}
                        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

                        {children}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}
