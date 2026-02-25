'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { accessToken, emailVerified } = useAuthStore()
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        if (!accessToken) {
            // No session → send to landing page (replace history so back won't return here)
            router.replace('/')
            return
        }
        if (!emailVerified) {
            router.replace('/auth/verify')
            return
        }
        setChecked(true)
    }, [accessToken, emailVerified, router])

    // While checking auth, show a minimal loading state
    if (!checked) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#0B0F1A]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Authenticating...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-screen bg-[#0B0F1A] overflow-hidden font-sans antialiased text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200">
            {/* Cinematic Overlays */}
            <div className="noise-bg" />
            <div className="cinematic-overlay" />

            {/* Ambient Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[150px] animate-pulse-glow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[150px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[20%] right-[15%] w-[30%] h-[30%] rounded-full bg-cyan-500/5 blur-[120px]" />
                <div className="absolute inset-0 grid-bg opacity-[0.2]" />
            </div>

            {/* Sidebar with Glass Effect */}
            <div className="z-50 shrink-0 relative">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 min-w-0 relative">
                <Navbar />

                <main className="flex-1 overflow-y-auto overflow-x-hidden relative premium-scroll scroll-smooth">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                            className="max-w-[1700px] mx-auto p-6 md:p-8 lg:p-10 pb-24 space-y-10"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Bottom Blur Overlay for better depth */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0B0F1A] to-transparent pointer-events-none z-10" />
            </div>
        </div>
    )
}


