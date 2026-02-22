import { create } from 'zustand'

interface UIState {
    sidebarOpen: boolean
    theme: 'dark' | 'light'
    activeModal: string | null
    toggleSidebar: () => void
    openModal: (name: string) => void
    closeModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    theme: 'dark',
    activeModal: null,
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    openModal: (name) => set({ activeModal: name }),
    closeModal: () => set({ activeModal: null }),
}))
