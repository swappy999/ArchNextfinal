'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store/uiStore'
import {
    LayoutDashboard, Map, Building2, ShoppingBag,
    Briefcase, Brain, ChevronLeft, ChevronRight, Zap, Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
    { href: '/map', label: 'Intelligence Map', icon: Map },
    { href: '/properties', label: 'Properties', icon: Building2 },
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
    { href: '/prediction', label: 'AI Forecast', icon: Brain },
]

export default function Sidebar() {
    const pathname = usePathname()
    const { sidebarOpen, toggleSidebar } = useUIStore()

    return (
        <motion.aside
            initial={false}
            animate={{ width: sidebarOpen ? 280 : 88 }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="group/sidebar relative h-screen bg-[#0B0F1A]/40 backdrop-blur-2xl border-r border-white/[0.04] flex flex-col z-50 overflow-hidden"
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            
            {/* Brand */}
            <div className="h-24 flex items-center px-7 relative">
                <div className="relative group/logo cursor-pointer">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all duration-500">
                        <Zap size={20} className="text-white fill-white transition-transform group-hover:scale-110" />
                    </div>
                    {/* Pulsing Aura */}
                    <div className="absolute inset-[-4px] rounded-[20px] border border-cyan-500/20 animate-pulse-glow opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="ml-4"
                        >
                            <div className="font-bold text-white text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">ArchNext</div>
                            <div className="text-[10px] text-cyan-500 font-bold tracking-[0.2em] uppercase opacity-80">Smart City OS</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-10 px-4 space-y-2 relative">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href
                    return (
                        <Link key={href} href={href} className="block relative">
                            <motion.div
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    "relative flex items-center h-12 px-4 rounded-2xl transition-all duration-300 overflow-hidden group/item",
                                    active
                                        ? "bg-white/[0.04] border border-white/[0.08] text-white shadow-xl"
                                        : "text-slate-400 hover:text-white hover:bg-white/[0.02]"
                                )}
                            >
                                {/* Active Background Glow */}
                                {active && (
                                    <motion.div 
                                        layoutId="sidebar-active-bg"
                                        className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.4 }}
                                    />
                                )}

                                <Icon 
                                    size={20} 
                                    strokeWidth={active ? 2.5 : 2}
                                    className={cn(
                                        "shrink-0 transition-all duration-300 relative z-10", 
                                        active ? "text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" : "group-hover/item:text-slate-200"
                                    )} 
                                />

                                <AnimatePresence>
                                    {sidebarOpen && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -5 }}
                                            transition={{ duration: 0.2 }}
                                            className="ml-4 text-sm font-semibold tracking-tight whitespace-nowrap relative z-10"
                                        >
                                            {label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                
                                {active && (
                                    <motion.div 
                                        layoutId="sidebar-active-indicator"
                                        className="absolute left-0 w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_15px_#22d3ee]"
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </motion.div>
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-6 space-y-4 border-t border-white/[0.04] relative">
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-4 rounded-2xl glass-card relative overflow-hidden group/status cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent group-hover:from-cyan-500/10 transition-colors" />
                            
                            <div className="flex items-center justify-between mb-2 relative z-10">
                                <span className="text-[10px] uppercase font-bold text-cyan-500 tracking-wider">Neural Link</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-[10px] font-bold text-emerald-400 tracking-wide uppercase">Active</span>
                                </div>
                            </div>
                            <div className="text-xs text-slate-400 font-medium relative z-10">Syncing Urban Node...</div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center justify-between">
                    {!sidebarOpen && (
                        <div className="flex justify-center w-full">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                    )}
                    
                    <button
                        onClick={toggleSidebar}
                        className="flex-1 flex items-center justify-center h-10 rounded-xl hover:bg-white/[0.04] text-slate-500 hover:text-white transition-all duration-300 border border-transparent hover:border-white/[0.08]"
                    >
                        {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                    </button>
                </div>
            </div>
        </motion.aside>
    )
}

