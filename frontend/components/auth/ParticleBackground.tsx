'use client'

import { useEffect, useRef } from 'react'

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    radius: number
    opacity: number
    hue: number
}

export default function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationId: number
        let particles: Particle[] = []
        const PARTICLE_COUNT = 60
        const CONNECTION_DISTANCE = 120
        const MOUSE = { x: -1000, y: -1000 }

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        const createParticle = (): Particle => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            radius: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.5 + 0.1,
            hue: Math.random() > 0.5 ? 190 : 210, // cyan-blue range
        })

        const init = () => {
            resize()
            particles = Array.from({ length: PARTICLE_COUNT }, createParticle)
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const dist = Math.sqrt(dx * dx + dy * dy)

                    if (dist < CONNECTION_DISTANCE) {
                        const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.08
                        ctx.beginPath()
                        ctx.strokeStyle = `hsla(200, 80%, 60%, ${alpha})`
                        ctx.lineWidth = 0.5
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.stroke()
                    }
                }
            }

            // Draw particles
            for (const p of particles) {
                // Glow
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4)
                gradient.addColorStop(0, `hsla(${p.hue}, 80%, 65%, ${p.opacity * 0.6})`)
                gradient.addColorStop(1, `hsla(${p.hue}, 80%, 65%, 0)`)
                ctx.beginPath()
                ctx.fillStyle = gradient
                ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2)
                ctx.fill()

                // Core dot
                ctx.beginPath()
                ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.opacity})`
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
                ctx.fill()

                // Move
                p.x += p.vx
                p.y += p.vy

                // Mouse interaction — gentle push
                const mdx = p.x - MOUSE.x
                const mdy = p.y - MOUSE.y
                const mDist = Math.sqrt(mdx * mdx + mdy * mdy)
                if (mDist < 100) {
                    p.vx += (mdx / mDist) * 0.02
                    p.vy += (mdy / mDist) * 0.02
                }

                // Dampen velocity
                p.vx *= 0.999
                p.vy *= 0.999

                // Wrap edges
                if (p.x < 0) p.x = canvas.width
                if (p.x > canvas.width) p.x = 0
                if (p.y < 0) p.y = canvas.height
                if (p.y > canvas.height) p.y = 0
            }

            animationId = requestAnimationFrame(draw)
        }

        const handleMouse = (e: MouseEvent) => {
            MOUSE.x = e.clientX
            MOUSE.y = e.clientY
        }

        window.addEventListener('resize', resize)
        window.addEventListener('mousemove', handleMouse)
        init()
        draw()

        return () => {
            cancelAnimationFrame(animationId)
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', handleMouse)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none"
            style={{ opacity: 0.6 }}
        />
    )
}
