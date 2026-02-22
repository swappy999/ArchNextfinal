'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

interface OTPInputProps {
    length?: number
    onComplete?: (code: string) => void
}

export default function OTPInput({ length = 6, onComplete }: OTPInputProps) {
    const [values, setValues] = useState<string[]>(Array(length).fill(''))
    const [activeIndex, setActiveIndex] = useState(0)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        inputRefs.current[0]?.focus()
    }, [])

    const handleChange = useCallback(
        (index: number, value: string) => {
            // Accept only single digit
            const digit = value.replace(/\D/g, '').slice(-1)
            const newValues = [...values]
            newValues[index] = digit
            setValues(newValues)

            if (digit && index < length - 1) {
                inputRefs.current[index + 1]?.focus()
                setActiveIndex(index + 1)
            }

            const code = newValues.join('')
            if (code.length === length && !newValues.includes('')) {
                onComplete?.(code)
            }
        },
        [values, length, onComplete]
    )

    const handleKeyDown = useCallback(
        (index: number, e: React.KeyboardEvent) => {
            if (e.key === 'Backspace') {
                if (values[index]) {
                    const newValues = [...values]
                    newValues[index] = ''
                    setValues(newValues)
                } else if (index > 0) {
                    inputRefs.current[index - 1]?.focus()
                    setActiveIndex(index - 1)
                    const newValues = [...values]
                    newValues[index - 1] = ''
                    setValues(newValues)
                }
            } else if (e.key === 'ArrowLeft' && index > 0) {
                inputRefs.current[index - 1]?.focus()
                setActiveIndex(index - 1)
            } else if (e.key === 'ArrowRight' && index < length - 1) {
                inputRefs.current[index + 1]?.focus()
                setActiveIndex(index + 1)
            }
        },
        [values, length]
    )

    const handlePaste = useCallback(
        (e: React.ClipboardEvent) => {
            e.preventDefault()
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
            if (pasted) {
                const newValues = [...values]
                for (let i = 0; i < pasted.length; i++) {
                    newValues[i] = pasted[i]
                }
                setValues(newValues)
                const nextIndex = Math.min(pasted.length, length - 1)
                inputRefs.current[nextIndex]?.focus()
                setActiveIndex(nextIndex)

                if (pasted.length === length) {
                    onComplete?.(pasted)
                }
            }
        },
        [values, length, onComplete]
    )

    return (
        <div className="flex items-center justify-center gap-3">
            {values.map((val, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className="relative"
                >
                    {/* Glow ring when focused */}
                    <motion.div
                        animate={{
                            boxShadow: activeIndex === i
                                ? '0 0 20px rgba(14, 165, 233, 0.25), 0 0 40px rgba(14, 165, 233, 0.08)'
                                : '0 0 0px rgba(14, 165, 233, 0)',
                            borderColor: activeIndex === i
                                ? 'rgba(34, 211, 238, 0.4)'
                                : val ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                        }}
                        transition={{ duration: 0.2 }}
                        className="rounded-xl border"
                    >
                        <input
                            ref={(el) => { inputRefs.current[i] = el }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={val}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            onPaste={handlePaste}
                            onFocus={() => setActiveIndex(i)}
                            className="w-12 h-14 text-center text-lg font-semibold text-white bg-white/[0.03] rounded-xl focus:outline-none focus:bg-white/[0.06] transition-colors caret-cyan-400"
                        />
                    </motion.div>

                    {/* Active dot indicator */}
                    {activeIndex === i && (
                        <motion.div
                            layoutId="otp-indicator"
                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                    )}
                </motion.div>
            ))}
        </div>
    )
}
