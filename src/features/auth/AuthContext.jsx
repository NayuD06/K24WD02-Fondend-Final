import { createContext, useContext, useMemo, useState } from 'react'
import { loginUser, logoutUser, readSession, registerUser } from './authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readSession())

  const login = (credentials) => {
    const session = loginUser(credentials)
    setUser(session)
    return session
  }

  const register = (payload) => {
    const session = registerUser(payload)
    setUser(session)
    return session
  }

  const logout = () => {
    logoutUser()
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
