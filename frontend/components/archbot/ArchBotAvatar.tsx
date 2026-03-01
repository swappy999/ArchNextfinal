'use client'

import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'

export type AvatarState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'TRANSCRIBING'

interface ArchBotAvatarProps {
    state: AvatarState
    className?: string
}

export function ArchBotAvatar({ state, className = '' }: ArchBotAvatarProps) {
    const isSpeaking = state === 'SPEAKING'
    const isListening = state === 'LISTENING'
    const isThinking = state === 'THINKING'
    const isTranscribing = state === 'TRANSCRIBING'

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Core Avatar Background Glow */}
            <motion.div
                className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md pointer-events-none"
                animate={{
                    scale: isSpeaking || isListening ? [1, 1.4, 1] : isTranscribing ? [1, 1.1, 1] : isThinking ? [1, 1.2, 1] : [1, 1.1, 1],
                    opacity: isSpeaking ? [0.4, 0.8, 0.4] : 0.4
                }}
                transition={{
                    duration: isTranscribing ? 0.5 : isSpeaking ? 0.3 : isThinking ? 1 : 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Speaking Equalizer Rings */}
            {isSpeaking && (
                <>
                    <motion.div
                        className="absolute inset-[-4px] rounded-full border border-cyan-400/40 pointer-events-none"
                        animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div
                        className="absolute inset-[-4px] rounded-full border border-cyan-400/20 pointer-events-none"
                        animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                    />
                </>
            )}

            {/* Listening Rings */}
            {isListening && (
                <motion.div
                    className="absolute inset-[-2px] rounded-full border border-emerald-400/50 pointer-events-none"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
            )}

            {/* Transcribing Scan Line */}
            {isTranscribing && (
                <motion.div
                    className="absolute inset-x-0 h-[2px] bg-amber-400/80 shadow-[0_0_8px_rgba(251,191,36,0.8)] pointer-events-none z-20"
                    animate={{ top: ['10%', '90%', '10%'] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            )}

            {/* Main Avatar Body */}
            <motion.div
                className={`w-full h-full rounded-full flex items-center justify-center border shadow-[0_0_15px_rgba(6,182,212,0.3)] z-10 transition-colors duration-300 ${isListening ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-400' :
                    isTranscribing ? 'bg-amber-500/20 border-amber-400/50 text-amber-400' :
                        isThinking ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-400' :
                            'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
                    }`}
                animate={isThinking || isTranscribing ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: isTranscribing ? 1 : 3, repeat: Infinity, ease: "linear" }}
            >
                <Bot className="w-1/2 h-1/2" />
            </motion.div>
        </div>
    )
}
