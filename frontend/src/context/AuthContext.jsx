import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../services/api'

const TOKEN_KEY = 'civicpulse_token'
const USER_KEY = 'civicpulse_user'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || '')
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)

    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  }, [token, user])

  const login = async (payload) => {
    const res = await authApi.login(payload)
    setToken(res.token)
    setUser({ username: res.username, role: res.role })
    return res
  }

  const register = async (payload) => {
    const res = await authApi.register(payload)
    setToken(res.token)
    setUser({ username: res.username, role: res.role })
    return res
  }

  const logout = () => {
    setToken('')
    setUser(null)
  }

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token && user), login, register, logout }),
    [token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
