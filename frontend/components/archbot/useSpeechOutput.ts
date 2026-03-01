'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseSpeechOutputReturn {
    speak: (text: string) => void
    stopSpeaking: () => void
    isSpeaking: boolean
    hasSupport: boolean
}

export function useSpeechOutput(onStart?: () => void, onEnd?: () => void): UseSpeechOutputReturn {
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [hasSupport, setHasSupport] = useState(false)
    const synthRef = useRef<SpeechSynthesis | null>(null)
    const voiceRef = useRef<SpeechSynthesisVoice | null>(null)

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            setHasSupport(true)
            synthRef.current = window.speechSynthesis

            // Try to find a premium English voice
            const loadVoices = () => {
                if (!synthRef.current) return
                const voices = synthRef.current.getVoices()
                // Prefer Google UK/US professional voices or native defaults
                voiceRef.current =
                    voices.find(v => v.name.includes('Google') && v.lang === 'en-GB') ||
                    voices.find(v => v.name.includes('Google') && v.lang === 'en-US') ||
                    voices.find(v => v.lang.startsWith('en')) ||
                    null
            }

            if (synthRef.current.onvoiceschanged !== undefined) {
                synthRef.current.onvoiceschanged = loadVoices
            }
            loadVoices()
        }

        return () => {
            if (synthRef.current) {
                synthRef.current.cancel()
            }
        }
    }, [])

    const stopSpeaking = useCallback(() => {
        if (synthRef.current) {
            synthRef.current.cancel()
            setIsSpeaking(false)
        }
    }, [])

    const speak = useCallback((text: string) => {
        if (!synthRef.current) return

        // Cancel any ongoing speech
        synthRef.current.cancel()

        // Strip markdown asterisks and hash tags for clearer speech
        const cleanText = text.replace(/[*#_`]/g, '')

        const utterance = new SpeechSynthesisUtterance(cleanText)
        if (voiceRef.current) utterance.voice = voiceRef.current

        // Optimize for a calm, professional delivery
        utterance.rate = 1.05
        utterance.pitch = 0.95
        utterance.volume = 1

        utterance.onstart = () => {
            setIsSpeaking(true)
            onStart?.()
        }

        utterance.onend = () => {
            setIsSpeaking(false)
            onEnd?.()
        }

        utterance.onerror = (e) => {
            console.error('Speech synthesis error:', e)
            setIsSpeaking(false)
            onEnd?.()
        }

        synthRef.current.speak(utterance)
    }, [onStart, onEnd])

    return { speak, stopSpeaking, isSpeaking, hasSupport }
}
