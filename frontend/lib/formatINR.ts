/**
 * Format a number as Indian Rupees with the Indian number system
 * (lakhs, crores).
 *
 * Examples:
 *   formatINR(4500000)   → "₹45,00,000"
 *   formatINR(12500000)  → "₹1,25,00,000"
 *   formatINR(850000)    → "₹8,50,000"
 */
export function formatINR(value: number | undefined | null): string {
    if (value == null || isNaN(value)) return '₹0'
    const num = Math.round(value)
    const str = num.toString()
    // Indian number system: last 3 digits, then groups of 2
    const lastThree = str.slice(-3)
    const remaining = str.slice(0, -3)
    const formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',')
    return `₹${remaining ? formatted + ',' : ''}${lastThree}`
}

/**
 * Format as compact Indian (e.g. "₹45L", "₹1.25Cr", "₹8,500")
 */
export function formatINRCompact(value: number | undefined | null): string {
    if (value == null || isNaN(value)) return '₹0'
    const num = Math.abs(value)
    const sign = value < 0 ? '-' : ''

    if (num >= 1_00_00_000) {
        // Crores
        const cr = num / 1_00_00_000
        return `${sign}₹${cr >= 10 ? cr.toFixed(0) : cr.toFixed(2).replace(/\.?0+$/, '')} Cr`
    }
    if (num >= 1_00_000) {
        // Lakhs
        const lakh = num / 1_00_000
        return `${sign}₹${lakh >= 10 ? lakh.toFixed(0) : lakh.toFixed(1).replace(/\.0$/, '')} L`
    }
    if (num >= 1000) {
        return `${sign}₹${(num / 1000).toFixed(0)}K`
    }
    return `${sign}₹${num.toFixed(0)}`
}
