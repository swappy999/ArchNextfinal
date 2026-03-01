export type MapCommandLayer = 'thermal' | 'pulse' | 'heatmap' | 'wards'

export const parseCommandToRoute = (userText: string, modelText: string): string | null => {
    // Rely on LLM specific tags for direct navigation
    const navMatch = modelText.match(/\[NAVIGATE:\s*(\/[-a-zA-Z0-9_/]+)\]/i);
    if (navMatch && navMatch[1]) {
        return navMatch[1];
    }

    // Fallback logic
    const lower = (userText + " " + modelText).toLowerCase()
    if (lower.includes('marketplace') || lower.includes('market')) return '/marketplace'
    if (lower.includes('dashboard') || lower.includes('home') || lower.includes('center')) return '/dashboard'
    if (lower.includes('portfolio') || lower.includes('assets') || lower.includes('holdings')) return '/portfolio'
    if (lower.includes('properties') || lower.includes('hub') || lower.includes('registry')) return '/properties'
    if (lower.includes('map') || lower.includes('intelligence map')) return '/map'
    if (lower.includes('forecast') || lower.includes('predict') || lower.includes('future')) return '/prediction'
    if (lower.includes('auction') || lower.includes('bid')) return '/marketplace'
    if (lower.includes('ecosystem')) return '/ecosystem'
    if (lower.includes('settings')) return '/settings'

    return null
}

export const parseMapLayerCommand = (command: string): MapCommandLayer | null => {
    const lower = command.toLowerCase()

    if (lower.includes('thermal')) return 'thermal'
    if (lower.includes('pulse') || lower.includes('infrastructure')) return 'pulse'
    if (lower.includes('ward') || lower.includes('boundary')) return 'wards'
    if (lower.includes('predict') || lower.includes('heatmap') || lower.includes('ai layer')) return 'heatmap'

    return null
}
