import React, { createContext, useContext, useState, useEffect } from 'react'
import api, { setAuthToken } from '../api/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  // Listen to online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Initialize Auth
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      
      if (savedToken && savedUser) {
        try {
          setAuthToken(savedToken)
          // If online, optionally verify token with API
          if (navigator.onLine) {
            // Check auth endpoint or just use cached user
            setUser(JSON.parse(savedUser))
          } else {
            setUser(JSON.parse(savedUser))
          }
        } catch (e) {
          logout()
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      // Attempt backend API call
      const response = await api.post('/auth/login', { email, password })
      const { token: jwtToken, user: userData } = response.data
      
      localStorage.setItem('token', jwtToken)
      localStorage.setItem('user', JSON.stringify(userData))
      setAuthToken(jwtToken)
      setUser(userData)
      setToken(jwtToken)
      
      // Subscribe to push notifications if service worker is active
      subscribeUserToPush()
      
      return { success: true, user: userData }
    } catch (error) {
      console.warn("Backend API login failed. Falling back to local seed accounts.", error)
      
      // SPA Fallback: Check mock user accounts
      if (
        (email === 'admin@harvest.org' && password === 'admin123') ||
        (email === 'admin' && password === 'admin')
      ) {
        const mockAdmin = { name: 'Harvest Admin', email: 'admin@harvest.org', role: 'admin', id: 'mock-admin' }
        localStorage.setItem('token', 'mock-token-admin')
        localStorage.setItem('user', JSON.stringify(mockAdmin))
        setUser(mockAdmin)
        setToken('mock-token-admin')
        return { success: true, user: mockAdmin }
      } else if (
        (email === 'member@harvest.org' && password === 'member123') ||
        (email === 'member' && password === 'member')
      ) {
        const mockMember = { name: 'Eco Member', email: 'member@harvest.org', role: 'member', id: 'mock-member' }
        localStorage.setItem('token', 'mock-token-member')
        localStorage.setItem('user', JSON.stringify(mockMember))
        setUser(mockMember)
        setToken('mock-token-member')
        return { success: true, user: mockMember }
      }
      
      throw new Error(error.response?.data?.message || 'Invalid email or password')
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password })
      // Auto login after registration
      return login(email, password)
    } catch (error) {
      console.warn("Backend API registration failed, running in SPA mock registration mode.", error)
      // SPA Mock: simulate successful registration and login as member
      const mockMember = { name, email, role: 'member', id: 'mock-' + Date.now() }
      localStorage.setItem('token', 'mock-token-' + mockMember.id)
      localStorage.setItem('user', JSON.stringify(mockMember))
      setUser(mockMember)
      setToken('mock-token-' + mockMember.id)
      return { success: true, user: mockMember }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setAuthToken(null)
    setUser(null)
    setToken(null)
  }

  // Push notifications helper
  const subscribeUserToPush = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready
        
        // Fetch VAPID key from backend
        let vapidPublicKey;
        try {
          const res = await api.get('/auth/vapid-key')
          vapidPublicKey = res.data.publicKey
        } catch (e) {
          console.warn("Could not retrieve VAPID key from backend, push registration skipped.")
          return
        }

        if (!vapidPublicKey) return

        // Convert key
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

        let subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          // Already subscribed, send to backend to verify it's registered
          await api.post('/auth/subscribe', subscription)
          return
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        })

        await api.post('/auth/subscribe', subscription)
        console.log("Successfully subscribed to Push Notifications!")
      } catch (err) {
        console.error("Failed to subscribe user to push notifications:", err)
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, isOffline, login, register, logout, subscribeUserToPush }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Utility to convert VAPID public key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
