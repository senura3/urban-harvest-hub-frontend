import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import { Mail, Lock, User, Leaf } from 'lucide-react'

export const Login = () => {
  const { login, register } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        if (!formData.name.trim()) throw new Error("Name is required")
        await register(formData.name, formData.email, formData.password)
      } else {
        await login(formData.email, formData.password)
      }
      navigate(redirect)
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-transparent to-[#f4ebd7]/20 dark:to-stone-950/20">
      <div className="max-w-md w-full bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-harvest text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Leaf className="w-6 h-6 fill-white/10" />
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900 dark:text-white font-display">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-stone-500">
            {isRegister ? 'Join our eco-conscious hub' : 'Access your member dashboard'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-350 border border-red-200/50 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-stone-550 dark:text-stone-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400 pointer-events-none">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-11 py-2 text-sm"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-stone-550 dark:text-stone-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400 pointer-events-none">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field pl-11 py-2 text-sm"
                placeholder="member@harvest.org"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-stone-550 dark:text-stone-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400 pointer-events-none">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field pl-11 py-2 text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-sm font-semibold tracking-wide py-2.5 shadow-md shadow-harvest/15 mt-2"
          >
            <span>{loading ? 'Authenticating...' : isRegister ? 'Register' : 'Login'}</span>
          </button>
        </form>

        <div className="relative flex py-2 items-center" aria-hidden="true">
          <div className="flex-grow border-t border-stone-150 dark:border-stone-850"></div>
          <span className="flex-shrink mx-4 text-[10px] text-stone-400 font-bold uppercase">Quick Demo logins</span>
          <div className="flex-grow border-t border-stone-150 dark:border-stone-850"></div>
        </div>

        {/* Demo Quick Logins */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <button
            type="button"
            onClick={() => setFormData({ name: '', email: 'member@harvest.org', password: 'member123' })}
            className="p-2 border border-stone-150 dark:border-stone-800 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-850 font-semibold text-stone-600 dark:text-stone-300"
          >
            Load Member
          </button>
          <button
            type="button"
            onClick={() => setFormData({ name: '', email: 'admin@harvest.org', password: 'admin123' })}
            className="p-2 border border-stone-150 dark:border-stone-800 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-850 font-semibold text-stone-600 dark:text-stone-300"
          >
            Load Admin
          </button>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-harvest hover:text-harvest-dark font-bold hover:underline"
            type="button"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

      </div>
    </div>
  )
}

export default Login
