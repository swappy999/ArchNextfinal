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
    verifyOTP: (email: string, code: string) => Promise<void>
    googleLogin: (token: string) => Promise<void>
    resetPassword: (token: string, password: string, confirmPassword: string) => Promise<void>
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

                    if (result.error) {
                        throw new Error(result.error)
                    }

                    // Login always requires OTP verification
                    set({
                        user: { email } as User,
                        isLoading: false,
                        emailVerified: false
                    })
                } catch (e) {
                    set({ isLoading: false })
                    throw e
                }
            },

            signup: async (name, email, password) => {
                set({ isLoading: true })
                try {
                    const result = await api.post('/auth/signup', { username: name, email, password })
                    // Signup always requires verification now
                    set({
                        user: { email, username: name } as User,
                        accessToken: result.access_token,
                        refreshToken: result.refresh_token,
                        isLoading: false,
                        emailVerified: false,
                    })
                } catch (e) {
                    set({ isLoading: false })
                    throw e
                }
            },

            verifyOTP: async (email: string, code: string) => {
                set({ isLoading: true })
                try {
                    const result = await api.post('/auth/verify-email', { email, code })
                    set({
                        accessToken: result.access_token,
                        refreshToken: result.refresh_token,
                        emailVerified: true,
                        isLoading: false
                    })
                    const response = await api.get('/users/me', result.access_token)
                    set({ user: response.user ?? response })
                } catch (e) {
                    set({ isLoading: false })
                    throw e
                }
            },

            resetPassword: async (token: string, password: string, confirmPassword: string) => {
                set({ isLoading: true })
                try {
                    const result = await api.post('/auth/reset-password', {
                        token,
                        password,
                        confirm_password: confirmPassword
                    })
                    if (result.error) {
                        throw new Error(result.error)
                    }
                    set({ isLoading: false })
                } catch (e) {
                    set({ isLoading: false })
                    throw e
                }
            },

            googleLogin: async (token: string) => {
                set({ isLoading: true })
                try {
                    const result = await api.post('/auth/google-login', { token })
                    if (result.error) {
                        throw new Error(result.error)
                    }
                    set({
                        accessToken: result.access_token,
                        refreshToken: result.refresh_token,
                        emailVerified: true,
                        isLoading: false
                    })
                    const response = await api.get('/users/me', result.access_token)
                    set({ user: response.user ?? response })
                } catch (e) {
                    set({ isLoading: false })
                    throw e
                }
            },

            logout: () => {
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
