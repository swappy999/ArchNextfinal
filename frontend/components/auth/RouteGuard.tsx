'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Loader2 } from 'lucide-react'

// Routes that do not require authentication
const PUBLIC_ROUTES = ['/', '/docs']

// Routes specifically for the onboarding flow
const AUTH_FLOW_ROUTES = ['/auth/signin', '/auth/signup', '/auth/forgot-password', '/auth/verify', '/auth/wallet']

export default function RouteGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, accessToken, emailVerified, walletConnected } = useAuthStore()
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        // Wait for hydration and state settling
        const checkAuth = () => {
            const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
            const isAuthRoute = AUTH_FLOW_ROUTES.includes(pathname)
            const isAuthenticated = !!user && !!accessToken

            if (isAuthenticated) {
                // User is authenticated but hasn't completed onboarding
                if (!emailVerified && pathname !== '/auth/verify') {
                    router.replace('/auth/verify')
                } else if (emailVerified && !walletConnected && pathname !== '/auth/wallet') {
                    router.replace('/auth/wallet')
                } else if (emailVerified && walletConnected && isAuthRoute) {
                    // Fully onboarded user trying to access auth pages -> redirect to dashboard
                    router.replace('/dashboard')
                }
            } else {
                // Not authenticated
                if (!isPublicRoute && !isAuthRoute) {
                    // Trying to access protected route (map, dashboard, etc) without auth
                    router.replace('/auth/signin')
                }
            }

            setIsChecking(false)
        }

        checkAuth()
    }, [pathname, user, accessToken, emailVerified, walletConnected, router])

    if (isChecking) {
        return (
            <div className="min-h-screen bg-[#07090F] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
        )
    }

    return <>{children}</>
}
