import { useState } from 'react'
import AuthContext from './AuthContextValue'
import { authService } from '../services/authService'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('blog_user')
    if (!savedUser) return null

    try {
      return JSON.parse(savedUser)
    } catch (error) {
      console.error('Could not read the saved user.', error)
      return null
    }
  })

  const saveUser = (nextUser) => {
    localStorage.setItem('blog_user', JSON.stringify(nextUser))
    setUser(nextUser)
  }

  const saveLogin = (data) => {
    if (data.token) localStorage.setItem('blog_token', data.token)
    if (data.user) saveUser(data.user)
  }

  const login = async (credentials) => {
    const { data } = await authService.login(credentials)
    saveLogin(data)
    return data
  }

  const register = async (values) => {
    const { data } = await authService.register(values)
    saveLogin(data)
    return data
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Could not end the server session.', error)
    } finally {
      localStorage.removeItem('blog_token')
      localStorage.removeItem('blog_user')
      setUser(null)
    }
  }

  return <AuthContext.Provider value={{ user, saveUser, login, register, logout }}>{children}</AuthContext.Provider>
}

