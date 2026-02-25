'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Loader2 } from 'lucide-react'

// Routes that do not require authentication
const PUBLIC_ROUTES = ['/', '/docs']

// Routes specifically for the onboarding flow
const AUTH_FLOW_ROUTES = ['/auth/signin', '/auth/signup', '/auth/forgot-password', '/auth/verify', '/auth/verify-google', '/auth/wallet', '/auth/success', '/auth/reset-password']

export default function RouteGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, accessToken, emailVerified, walletConnected } = useAuthStore()
    const hasHydrated = useRef(false)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
        const isAuthRoute = AUTH_FLOW_ROUTES.includes(pathname)
        const isAuthenticated = !!user && !!accessToken

        if (isAuthenticated) {
            if (!emailVerified && pathname !== '/auth/verify') {
                router.replace('/auth/verify')
            } else if (emailVerified && !walletConnected && pathname !== '/auth/wallet') {
                router.replace('/auth/wallet')
            } else if (emailVerified && walletConnected && isAuthRoute) {
                router.replace('/dashboard')
            }
        } else {
            if (!isPublicRoute && !isAuthRoute) {
                router.replace('/auth/signin')
            }
        }

        // Only show the loading spinner on the very first mount
        if (!hasHydrated.current) {
            hasHydrated.current = true
            setReady(true)
        }
    }, [pathname, user, accessToken, emailVerified, walletConnected, router])

    if (!ready) {
        return (
            <div className="min-h-screen bg-[#07090F] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
        )
    }

    return <>{children}</>
}
