'use client'

import { useState, useRef, useCallback } from 'react'

interface UseAudioRecorderReturn {
    isRecording: boolean
    startRecording: () => Promise<void>
    stopRecording: () => Promise<Blob | null>
    audioBlob: Blob | null
}

export function useAudioRecorder(): UseAudioRecorderReturn {
    const [isRecording, setIsRecording] = useState(false)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const mediaRecorder = useRef<MediaRecorder | null>(null)
    const audioChunks = useRef<Blob[]>([])

    // A promise resolver stored securely to be called when stop() fires the onstop event
    const resolveBlob = useRef<((blob: Blob) => void) | null>(null)

    const startRecording = useCallback(async () => {
        if (isRecording) return

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })

            audioChunks.current = []

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.current.push(event.data)
                }
            }

            recorder.onstart = () => {
                setIsRecording(true)
                setAudioBlob(null)
            }

            recorder.onstop = () => {
                const blob = new Blob(audioChunks.current, { type: 'audio/webm' })
                setAudioBlob(blob)
                setIsRecording(false)

                // Release the microphone lock
                stream.getTracks().forEach(track => track.stop())

                if (resolveBlob.current) {
                    resolveBlob.current(blob)
                    resolveBlob.current = null
                }
            }

            mediaRecorder.current = recorder
            recorder.start()

        } catch (err) {
            console.error('Failed to access microphone or start recording:', err)
        }
    }, [isRecording])

    const stopRecording = useCallback((): Promise<Blob | null> => {
        return new Promise((resolve) => {
            if (!mediaRecorder.current || mediaRecorder.current.state === 'inactive') {
                resolve(null)
                return
            }

            // Hook up the resolver so that onstop resolves with the finished Blob
            resolveBlob.current = resolve
            mediaRecorder.current.stop()
        })
    }, [])

    return {
        isRecording,
        startRecording,
        stopRecording,
        audioBlob
    }
}
