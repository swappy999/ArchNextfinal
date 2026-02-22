const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function req(path: string, options: RequestInit = {}, token?: string | null) {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${BASE}${path}`, { ...options, headers })
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(err.detail || 'Request failed')
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
