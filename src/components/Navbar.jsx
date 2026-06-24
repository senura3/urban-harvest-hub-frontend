import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useLang } from '../context/LanguageContext'
import { Menu, X, Sun, Moon, Globe, Download, LogOut, User, Leaf } from 'lucide-react'

export const Navbar = () => {
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const { language, changeLanguage, t } = useLang()
  const navigate = useNavigate()
  
  const [isOpen, setIsOpen] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallBtn, setShowInstallBtn] = useState(false)

  // Intercept beforeinstallprompt for PWA install capability
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallBtn(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to install prompt: ${outcome}`)
    setDeferredPrompt(null)
    setShowInstallBtn(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsOpen(false)
  }

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/products', label: t('nav.products') },
    { path: '/workshops', label: t('nav.workshops') },
    { path: '/events', label: t('nav.events') },
  ]

  const activeStyle = ({ isActive }) => 
    `px-3 py-2 text-sm font-medium transition-colors ${
      isActive 
        ? 'text-harvest dark:text-earthen border-b-2 border-harvest dark:border-earthen' 
        : 'text-stone-600 dark:text-stone-300 hover:text-harvest dark:hover:text-earthen'
    }`

  const mobileActiveStyle = ({ isActive }) => 
    `block px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
      isActive 
        ? 'bg-harvest/10 text-harvest dark:bg-earthen/10 dark:text-earthen' 
        : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
    }`

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-100 dark:border-stone-850 shadow-sm" aria-label="Main Navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" aria-label="Urban Harvest Hub home">
            <span className="p-2 bg-harvest text-white rounded-xl group-hover:scale-105 transition-transform duration-200 shadow-sm">
              <Leaf className="w-5 h-5 fill-white/10" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-stone-900 dark:text-white">
              Urban Harvest <span className="text-harvest dark:text-earthen font-sans">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              {navItems.map((item) => (
                <NavLink key={item.path} to={item.path} className={activeStyle} aria-label={item.label}>
                  {item.label}
                </NavLink>
              ))}
              {user?.role === 'admin' && (
                <NavLink to="/admin" className={activeStyle} aria-label={t('nav.admin')}>
                  {t('nav.admin')}
                </NavLink>
              )}
            </div>

            <div className="h-6 w-px bg-stone-200 dark:bg-stone-800 mx-2"></div>

            {/* Language Switcher */}
            <button
              onClick={() => changeLanguage(language === 'en' ? 'es' : 'en')}
              className="p-2.5 text-stone-500 hover:text-harvest dark:hover:text-earthen hover:bg-stone-50 dark:hover:bg-stone-850 rounded-xl transition-all"
              aria-label="Toggle language"
              title="Toggle language"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                <Globe className="w-4.5 h-4.5" />
                <span>{language === 'en' ? 'es' : 'en'}</span>
              </div>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 text-stone-500 hover:text-harvest dark:hover:text-earthen hover:bg-stone-50 dark:hover:bg-stone-850 rounded-xl transition-all"
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* PWA Install Button */}
            {showInstallBtn && (
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-harvest text-white rounded-xl text-xs font-semibold hover:bg-harvest-dark shadow-sm transition-all"
                aria-label="Install applications on this device"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('nav.installApp')}</span>
              </button>
            )}

            {/* Auth section */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
                  <User className="w-4 h-4 text-harvest" />
                  <span className="font-medium max-w-[100px] truncate">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 text-stone-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                  aria-label="Log out of account"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-5 py-2.5 bg-stone-900 text-white dark:bg-white dark:text-stone-900 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
                aria-label="Navigate to login"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden flex items-center gap-2">
            {showInstallBtn && (
              <button
                onClick={handleInstallClick}
                className="p-2 text-harvest hover:bg-harvest/15 rounded-xl transition-colors"
                aria-label="Install app"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => changeLanguage(language === 'en' ? 'es' : 'en')}
              className="p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl text-xs uppercase font-bold"
              aria-label="Change language"
            >
              {language === 'en' ? 'ES' : 'EN'}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl"
              aria-expanded={isOpen}
              aria-label="Toggle navigation drawer"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 py-4 space-y-3 shadow-inner">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} onClick={() => setIsOpen(false)} className={mobileActiveStyle} aria-label={item.label}>
              {item.label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin" onClick={() => setIsOpen(false)} className={mobileActiveStyle} aria-label={t('nav.admin')}>
              {t('nav.admin')}
            </NavLink>
          )}
          
          <div className="h-px bg-stone-100 dark:bg-stone-800 my-2"></div>
          
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-4 py-2">
                <User className="w-5 h-5 text-harvest" />
                <div>
                  <p className="text-sm font-semibold text-stone-850 dark:text-white leading-tight">{user.name}</p>
                  <p className="text-xs text-stone-500 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl font-medium transition-colors"
                aria-label="Log out"
              >
                <span>{t('nav.logout')}</span>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-4 py-3 bg-harvest text-white rounded-xl font-semibold hover:bg-harvest-dark transition-colors"
              aria-label="Go to login page"
            >
              {t('nav.login')}
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
