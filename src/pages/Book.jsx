import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/api'
import seedData from '../data/seedData.json'
import BookingForm from '../components/BookingForm'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, CheckCircle2, CloudLightning } from 'lucide-react'

export const Book = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type') || 'event' // default
  const navigate = useNavigate()
  const { user } = useAuth()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true)
        setError(null)
        
        let response
        if (type === 'event') {
          response = await api.get(`/events/${id}`)
        } else {
          response = await api.get(`/items/${id}`)
        }
        setItem(response.data)
      } catch (err) {
        console.warn("Backend API not reachable. Checking static seed data for booking info.")
        // Fallback checks
        let found
        if (type === 'event') {
          found = seedData.events.find(e => e.id === id)
        } else if (type === 'product') {
          found = seedData.products.find(p => p.id === id)
        } else if (type === 'workshop') {
          found = seedData.workshops.find(w => w.id === id)
        }

        if (found) {
          setItem(found)
        } else {
          setError("Item or event not found.")
        }
      } finally {
        setLoading(false)
      }
    }
    fetchItem()
  }, [id, type])

  const handleBookingSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      const payload = {
        itemId: id,
        itemName: item.name || item.title,
        type: type,
        name: formData.name,
        email: formData.email,
        date: formData.date,
        tickets: formData.tickets,
        notes: formData.notes
      }

      const token = localStorage.getItem('token')
      const isMockToken = token && token.startsWith('mock-')

      if (!navigator.onLine || isMockToken) {
        // PWA Offline mode or mock mode: Queue booking in localStorage
        const offlineQueue = JSON.parse(localStorage.getItem('offline-bookings') || '[]')
        offlineQueue.push(payload)
        localStorage.setItem('offline-bookings', JSON.stringify(offlineQueue))
        
        // Trigger Service Worker Sync if available (skip for mock token sync to avoid spamming backend)
        if (!isMockToken && 'serviceWorker' in navigator && 'SyncManager' in window) {
          const registration = await navigator.serviceWorker.ready
          try {
            await registration.sync.register('sync-bookings')
            console.log("Background sync tag 'sync-bookings' registered.")
          } catch (e) {
            console.warn("Background sync registration failed, falling back to window online handler.", e)
          }
        }
        
        setBookingSuccess(true)
      } else {
        // Online: post to express backend
        try {
          await api.post('/bookings', {
            itemId: id,
            itemType: type === 'product' ? 'Item' : type === 'workshop' ? 'Item' : 'Event',
            date: formData.date,
            tickets: formData.tickets,
            notes: formData.notes,
            name: formData.name,
            email: formData.email
          })
          setBookingSuccess(true)
        } catch (err) {
          // If backend server is down/unreachable, fall back to queuing locally
          if (!err.response) {
            console.warn("Backend server is unreachable. Saving booking locally.")
            const offlineQueue = JSON.parse(localStorage.getItem('offline-bookings') || '[]')
            offlineQueue.push(payload)
            localStorage.setItem('offline-bookings', JSON.stringify(offlineQueue))
            setBookingSuccess(true)
          } else {
            throw err
          }
        }
      }
    } catch (err) {
      console.error(err)
      throw new Error(err.response?.data?.message || "Booking submission failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner message="Securing reservation portals..." />
  }

  if (error || !item) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Booking Item Not Found</h2>
        <p className="text-stone-500 mt-2">Check the URL or return to listings.</p>
        <Link to="/" className="btn-primary mt-6 inline-block">Back Home</Link>
      </div>
    )
  }

  const backLink = type === 'event' ? `/events/${id}` : type === 'product' ? `/products/${id}` : `/workshops/${id}`

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      
      {/* Back button */}
      <Link
        to={backLink}
        className="flex items-center gap-1.5 text-stone-550 font-bold text-sm hover:text-stone-850 dark:hover:text-white mb-6 w-max"
        aria-label="Back to details"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Details</span>
      </Link>

      {bookingSuccess ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-3xl p-8 shadow-xl text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-stone-900 dark:text-white font-display">
              Booking Reserved!
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
              {!navigator.onLine 
                ? "Saved offline! Your request is cached on this device and will automatically sync as soon as you reconnect to internet."
                : `Your reservation for "${item.name || item.title}" has been confirmed. A receipt was sent to your email.`
              }
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(type === 'event' ? '/events' : type === 'product' ? '/products' : '/workshops')}
              className="btn-primary py-2.5 px-6"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-3xl p-6 md:p-8 shadow-xl">
          {/* Offline reminder */}
          {!navigator.onLine && (
            <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-250 rounded-2xl flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <CloudLightning className="w-4.5 h-4.5 text-amber-500 animate-pulse shrink-0" />
              <span>Offline Mode Active. Bookings will queue locally and upload upon reconnecting.</span>
            </div>
          )}

          <BookingForm
            item={item}
            onSubmitBooking={handleBookingSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      )}
    </div>
  )
}

export default Book
