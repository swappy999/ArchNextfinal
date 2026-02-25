import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/** Full Indian Rupee format: ₹45,00,000 */
export function formatCurrency(amount: number, _currency = 'INR') {
    if (amount == null || isNaN(amount)) return '₹0'
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

/** Compact Indian format: ₹45L, ₹1.25Cr, ₹8.5K */
export function formatCurrencyCompact(value: number) {
    if (value == null || isNaN(value)) return '₹0'
    const num = Math.abs(value)
    const sign = value < 0 ? '-' : ''
    if (num >= 1_00_00_000) {
        const cr = num / 1_00_00_000
        return `${sign}₹${cr >= 100 ? cr.toFixed(0) : cr.toFixed(2).replace(/\.?0+$/, '')} Cr`
    }
    if (num >= 1_00_000) {
        const lakh = num / 1_00_000
        return `${sign}₹${lakh >= 100 ? lakh.toFixed(0) : lakh.toFixed(1).replace(/\.0$/, '')} L`
    }
    if (num >= 1000) {
        return `${sign}₹${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`
    }
    return `${sign}₹${num.toFixed(0)}`
}

export function shortAddress(address: string) {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/** Compact Indian number (no ₹): 45L, 1.25Cr */
export function formatNumber(n: number) {
    if (n == null || isNaN(n)) return '0'
    const abs = Math.abs(n)
    if (abs >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(1).replace(/\.0$/, '')} Cr`
    if (abs >= 1_00_000) return `${(n / 1_00_000).toFixed(1).replace(/\.0$/, '')} L`
    if (abs >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
    return n.toFixed(0)
}

