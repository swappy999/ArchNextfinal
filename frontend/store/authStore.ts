import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'

interface User {
    id: string
    email: string
    username: string
    role: string
    wallet_address?: string
}

interface AuthState {
    user: User | null
    accessToken: string | null
    refreshToken: string | null
    isLoading: boolean
    emailVerified: boolean
    walletConnected: boolean
    login: (email: string, password: string) => Promise<void>
    signup: (name: string, email: string, password: string) => Promise<void>
    logout: () => void
    setUser: (user: User) => void
    verifyEmail: () => void
    setWalletConnected: (address: string) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            emailVerified: false,
            walletConnected: false,

            login: async (email, password) => {
                set({ isLoading: true })
                try {
                    const result = await api.post('/auth/login', { email, password })
                    set({
                        accessToken: result.access_token,
                        refreshToken: result.refresh_token,
                        isLoading: false,
                        emailVerified: result.email_verified || false,
                    })
                    // Fetch user profile — backend returns { user: {...} }, unwrap it
                    const response = await api.get('/users/me', result.access_token)
                    set({ user: response.user ?? response })
                } catch (e) {
                    set({ isLoading: false })
                    throw e
                }
            },

            signup: async (name, email, password) => {
                set({ isLoading: true })
                try {
                    const result = await api.post('/auth/signup', { username: name, email, password })
                    set({
                        accessToken: result.access_token,
                        refreshToken: result.refresh_token,
                        isLoading: false,
                        emailVerified: result.email_verified || false,
                    })
                    const response = await api.get('/users/me', result.access_token)
                    set({ user: response.user ?? response })
                } catch (e) {
                    set({ isLoading: false })
                    throw e
                }
            },

            logout: () => {
                // Fire-and-forget backend logout to blacklist token
                const token = (get() as any).accessToken
                if (token) {
                    api.post('/auth/logout', {}, token).catch(() => { })
                }
                set({ user: null, accessToken: null, refreshToken: null, emailVerified: false, walletConnected: false })
            },

            setUser: (user) => set({ user }),
            verifyEmail: () => set({ emailVerified: true }),
            setWalletConnected: (address: string) => set((state) => ({
                walletConnected: true,
                user: state.user ? { ...state.user, wallet_address: address } : null
            })),
        }),
        {
            name: 'archnext-auth',
            partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken, user: s.user, emailVerified: s.emailVerified, walletConnected: s.walletConnected }),
        }
    )
)
