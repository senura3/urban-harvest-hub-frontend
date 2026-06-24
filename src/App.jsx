import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useLang } from './context/LanguageContext'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Products from './pages/Products'
import Workshops from './pages/Workshops'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Book from './pages/Book'
import Admin from './pages/Admin'
import Login from './pages/Login'
import NotFound from './components/NotFound'
import { CloudLightning, Wifi } from 'lucide-react'

// Private route wrapper for admin protection
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  return user && user.role === 'admin' ? children : <Navigate to="/" />
}

export const App = () => {
  const { isOffline, subscribeUserToPush } = useAuth()
  const { t } = useLang()
  const [showOnlineBanner, setShowOnlineBanner] = useState(false)

  // Listen to connection restorations to show a positive success confirmation
  useEffect(() => {
    if (!isOffline) {
      // If was previously offline, display a quick "Back Online" message
      setShowOnlineBanner(true)
      const timer = setTimeout(() => setShowOnlineBanner(false), 3000)
      
      // Auto-trigger PWA Push Subscription check when online
      subscribeUserToPush()

      // Flush offline bookings queue automatically!
      flushOfflineBookings()

      return () => clearTimeout(timer)
    }
  }, [isOffline])

  // Sync offline bookings to backend
  const flushOfflineBookings = async () => {
    const queue = JSON.parse(localStorage.getItem('offline-bookings') || '[]')
    if (queue.length === 0) return

    console.log(`Connection restored. Syncing ${queue.length} offline bookings...`)
    
    for (const booking of queue) {
      try {
        await api.post('/bookings', {
          itemId: booking.itemId,
          itemType: booking.type === 'product' ? 'Item' : booking.type === 'workshop' ? 'Item' : 'Event',
          date: booking.date,
          tickets: booking.tickets,
          notes: booking.notes,
          name: booking.name,
          email: booking.email
        })
      } catch (err) {
        console.error("Failed to sync offline booking:", booking, err)
      }
    }
    
    // Clear queue
    localStorage.removeItem('offline-bookings')
    console.log("Offline booking queue synced and cleared successfully.")
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        
        {/* Offline Banner */}
        {isOffline && (
          <div className="bg-amber-600 dark:bg-amber-700 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 select-none" role="alert" aria-live="assertive">
            <CloudLightning className="w-4 h-4 animate-pulse" />
            <span>{t('offline.banner')}: {t('offline.message')}</span>
          </div>
        )}

        {/* Re-connection Banner */}
        {showOnlineBanner && (
          <div className="bg-emerald-650 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn" role="alert">
            <Wifi className="w-4 h-4" />
            <span>Back online! Synchronizing background sync queues...</span>
          </div>
        )}

        {/* Global Nav */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-grow">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<Products />} />
              <Route path="/workshops" element={<Workshops />} />
              <Route path="/workshops/:id" element={<Workshops />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/book/:id" element={<Book />} />
              <Route path="/login" element={<Login />} />
              
              {/* Admin Panel Protection */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                } 
              />
              
              {/* Fallback routing */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </main>

        {/* Footer */}
        <Footer />

      </div>
    </Router>
  )
}

export default App
