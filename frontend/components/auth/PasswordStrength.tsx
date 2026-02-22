'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface PasswordStrengthProps {
    password: string
}

const CHECKS = [
    { label: 'Min 8 chars', test: (p: string) => p.length >= 8 },
    { label: 'Uppercase', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
    { label: 'Special char', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

const LEVELS = [
    { label: 'Weak', color: '#ef4444', glow: 'rgba(239,68,68,0.3)' },
    { label: 'Fair', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
    { label: 'Good', color: '#22d3ee', glow: 'rgba(34,211,238,0.3)' },
    { label: 'Strong', color: '#10b981', glow: 'rgba(16,185,129,0.3)' },
]

export default function PasswordStrength({ password }: PasswordStrengthProps) {
    const score = useMemo(() => {
        if (!password) return 0
        return CHECKS.reduce((acc, c) => acc + (c.test(password) ? 1 : 0), 0)
    }, [password])

    if (!password) return null

    const level = LEVELS[Math.max(0, score - 1)] || LEVELS[0]

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
        >
            {/* Bar segments */}
            <div className="flex gap-1.5">
                {LEVELS.map((_, i) => (
                    <motion.div
                        key={i}
                        className="h-1 flex-1 rounded-full"
                        initial={{ scaleX: 0 }}
                        animate={{
                            scaleX: i < score ? 1 : 1,
                            backgroundColor: i < score ? level.color : 'rgba(255,255,255,0.06)',
                        }}
                        style={{
                            boxShadow: i < score ? `0 0 8px ${level.glow}` : 'none',
                            transformOrigin: 'left',
                        }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                    />
                ))}
            </div>

            {/* Label */}
            <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">Password strength</span>
                <motion.span
                    key={score}
                    initial={{ opacity: 0, x: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[11px] font-medium"
                    style={{ color: level.color }}
                >
                    {level.label}
                </motion.span>
            </div>
        </motion.div>
    )
}
