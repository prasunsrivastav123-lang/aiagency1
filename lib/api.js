'use client'

// Client-side helper for calling backend /api and managing JWT

const TOKEN_KEY = 'agencyos_token'
const USER_KEY = 'agencyos_user'

export function getToken() { if (typeof window === 'undefined') return null; return localStorage.getItem(TOKEN_KEY) }
export function getUser() { if (typeof window === 'undefined') return null; try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') } catch { return null } }
export function setAuth(token, user) { localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(USER_KEY, JSON.stringify(user)) }
export function clearAuth() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY) }

export async function api(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }
  const res = await fetch(`/api${path}`, { ...options, headers, body: options.body ? JSON.stringify(options.body) : undefined })
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : await res.text()
  if (!res.ok) throw new Error((data && data.error) || `HTTP ${res.status}`)
  return data
}
