const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function req(path: string, options: RequestInit = {}, token?: string | null) {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    let res = await fetch(`${BASE}${path}`, { ...options, headers })

    // Handle 401 Unauthorized - Attempt Token Refresh
    if (res.status === 401 && !path.includes('/auth/')) {
        try {
            // We use a dynamic import to avoid circular dependency
            const { useAuthStore } = await import('@/store/authStore')
            const refreshToken = useAuthStore.getState().refreshToken

            if (refreshToken) {
                console.log('[API] Access token expired, attempting refresh...')
                const refreshRes = await fetch(`${BASE}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh_token: refreshToken })
                })

                if (refreshRes.ok) {
                    const data = await refreshRes.json()
                    if (data.access_token) {
                        console.log('[API] Refresh successful, retrying request')
                        // Update the store
                        useAuthStore.setState({ accessToken: data.access_token })
                        // Retry the original request with new token
                        headers['Authorization'] = `Bearer ${data.access_token}`
                        res = await fetch(`${BASE}${path}`, { ...options, headers })
                    }
                } else {
                    console.warn('[API] Refresh failed, session invalid')
                }
            }
        } catch (err) {
            console.error('[API] Refresh error:', err)
        }
    }

    if (!res.ok) {
        const contentType = res.headers.get('content-type')
        let detail = ''

        if (contentType && contentType.includes('application/json')) {
            const err = await res.json().catch(() => ({}))
            detail = err.detail || err.message || ''
        }

        const errorMessage = detail || res.statusText || `Request failed with status ${res.status}`

        // If it's a 401 that couldn't be refreshed, auto-logout silently
        if (res.status === 401) {
            try {
                const { useAuthStore } = await import('@/store/authStore')
                useAuthStore.getState().logout()
            } catch { }
            return null as any  // Return null — callers should handle gracefully
        }

        throw new Error(errorMessage)
    }

    return res.json()
}

export const api = {
    get: (path: string, token?: string | null) => req(path, { method: 'GET' }, token),
    post: (path: string, body: unknown, token?: string | null) =>
        req(path, { method: 'POST', body: JSON.stringify(body) }, token),
    put: (path: string, body: unknown, token?: string | null) =>
        req(path, { method: 'PUT', body: JSON.stringify(body) }, token),
    delete: (path: string, token?: string | null) => req(path, { method: 'DELETE' }, token),
}
