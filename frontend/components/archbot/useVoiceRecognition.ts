'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseVoiceRecognitionReturn {
    isListening: boolean
    transcript: string
    startListening: () => void
    stopListening: () => void
    resetTranscript: () => void
    hasSupport: boolean
}

export function useVoiceRecognition(onCommandDetected: (transcript: string) => void): UseVoiceRecognitionReturn {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [hasSupport, setHasSupport] = useState(false)
    const recognitionRef = useRef<any>(null)
    const activeRef = useRef<boolean>(false)
    const callbackRef = useRef(onCommandDetected)

    // Keep callback fresh without restarting the speech recognition effect
    useEffect(() => {
        callbackRef.current = onCommandDetected
    }, [onCommandDetected])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            if (SpeechRecognition) {
                setHasSupport(true)
                const recognition = new SpeechRecognition()
                recognition.continuous = true
                recognition.interimResults = true
                recognition.lang = 'en-US'

                recognition.onstart = () => {
                    setIsListening(true)
                    activeRef.current = true
                }

                recognition.onresult = (event: any) => {
                    let interimTranscript = ''
                    let finalTranscript = ''

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript
                        } else {
                            interimTranscript += event.results[i][0].transcript
                        }
                    }

                    const currentHeard = (finalTranscript || interimTranscript).trim().toLowerCase()
                    if (currentHeard) {
                        setTranscript(currentHeard)

                        // Dedicated Wake Word Detection Layer
                        if (
                            currentHeard.includes('hello arch') ||
                            currentHeard.includes('hi arch') ||
                            currentHeard.includes('archbot') ||
                            currentHeard.includes('artbot') ||
                            currentHeard.includes('hello')
                        ) {
                            // Immediately fire activation callback and reset transcript 
                            // so it doesn't repeatedly trigger.
                            callbackRef.current('wake_word')
                            setTranscript('')
                            // We don't stop recognition here, let the Widget manage muting it.
                        }
                    }

                    // We no longer trigger callbackRef on EVERY final phrase, 
                    // because the AudioRecorder handles the actual command payload now.
                }

                recognition.onerror = (event: any) => {
                    // Suppress Next.js red error overlays for expected/routine Web Speech API quirks
                    if (event.error === 'not-allowed') {
                        console.warn('Microphone access denied or requires user interaction.')
                        setIsListening(false)
                        activeRef.current = false
                    } else if (event.error === 'network' || event.error === 'no-speech' || event.error === 'aborted') {
                        // These are common dropouts (especially 'network' on localhost or 'no-speech' from silence).
                        // Do NOT set activeRef to false so the onend handler can auto-restart it.
                        console.warn(`Speech recognition paused: ${event.error}`)
                        setIsListening(false)
                    } else {
                        console.warn('Speech recognition warning:', event.error)
                        setIsListening(false)
                    }
                }

                recognition.onend = () => {
                    // Auto-restart if we intended to be active (preventing accidental cutoffs)
                    if (activeRef.current) {
                        setTimeout(() => {
                            // Only restart if the user is actually looking at the page
                            if (activeRef.current && document.visibilityState === 'visible') {
                                try {
                                    recognition.start()
                                } catch (e) {
                                    setIsListening(false)
                                    activeRef.current = false
                                }
                            } else if (document.visibilityState !== 'visible') {
                                setIsListening(false)
                            }
                        }, 500) // 500ms backoff prevents Chrome from suffocating the connection
                    } else {
                        setIsListening(false)
                    }
                }

                recognitionRef.current = recognition
            }
        }

        return () => {
            if (recognitionRef.current) {
                activeRef.current = false
                recognitionRef.current.stop()
            }
        }
    }, [])

    const startListening = useCallback(() => {
        if (recognitionRef.current && !activeRef.current) {
            try {
                activeRef.current = true
                recognitionRef.current.start()
            } catch (err) {
                console.warn('Microphone already started or warming up.')
            }
        }
    }, [])

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            activeRef.current = false
            setIsListening(false)
            recognitionRef.current.stop()
        }
    }, [])

    const resetTranscript = useCallback(() => {
        setTranscript('')
    }, [])

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        hasSupport
    }
}
