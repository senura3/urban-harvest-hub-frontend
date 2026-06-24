import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/api'
import seedData from '../data/seedData.json'
import MapEmbed from '../components/MapEmbed'
import WeatherWidget from '../components/WeatherWidget'
import ReviewList from '../components/ReviewList'
import LoadingSpinner from '../components/LoadingSpinner'
import { useLang } from '../context/LanguageContext'
import { ArrowLeft, Calendar, MapPin, Users, Ticket } from 'lucide-react'

export const EventDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLang()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get(`/events/${id}`)
        setEvent(response.data)
      } catch (err) {
        console.warn("Backend API not reachable. Loading event from seed data.")
        const found = seedData.events.find(e => e.id === id)
        if (found) {
          setEvent(found)
        } else {
          setError("Event not found.")
        }
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [id])

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <LoadingSpinner message="Setting up event maps..." />
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Event Not Found</h2>
        <p className="text-stone-500 mt-2">The event might have been removed or rescheduled.</p>
        <Link to="/events" className="btn-primary mt-6 inline-block">
          Back to Events
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back to Events list */}
      <button
        onClick={() => navigate('/events')}
        className="flex items-center gap-1.5 text-stone-550 font-bold text-sm hover:text-stone-850 dark:hover:text-white mb-6"
        aria-label="Back to events catalog"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('buttons.back')} {t('nav.events')}</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left main details */}
        <div className="lg:col-span-8 space-y-8">
          <div className="aspect-[16/9] w-full rounded-3xl overflow-hidden bg-stone-100 dark:bg-stone-800 shadow-sm">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              {event.title}
            </h1>
            
            <p className="text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
              {event.description}
            </p>
          </div>

          <hr className="border-stone-200 dark:border-stone-800" />

          {/* Dynamic Reviews Section */}
          <ReviewList itemId={event.id || event._id} initialReviews={[]} />
        </div>

        {/* Right widgets panel */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24" aria-label="Event sidebar widgets">
          
          {/* Booking Card */}
          <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-stone-900 dark:text-white font-display">
              Event Details
            </h3>

            <div className="space-y-4 text-sm text-stone-600 dark:text-stone-300">
              <div className="flex items-start gap-3">
                <Calendar className="w-4.5 h-4.5 text-harvest mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-stone-850 dark:text-white">Date & Time</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{formatDate(event.date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4.5 h-4.5 text-harvest mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-stone-850 dark:text-white">Location</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{event.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-4.5 h-4.5 text-harvest mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-stone-850 dark:text-white">Capacity limit</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    {event.maxAttendees ? `${event.maxAttendees} attendees max` : 'Open event'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to={`/book/${event.id || event._id}?type=event`}
                className="w-full btn-primary font-bold shadow-md shadow-harvest/15 flex items-center justify-center gap-2"
                aria-label="Book a slot at this event"
              >
                <Ticket className="w-4 h-4" />
                <span>Register for Event</span>
              </Link>
            </div>
          </div>

          {/* Weather Widget */}
          <WeatherWidget />

          {/* Map Embed (Loads OpenStreetMap iframe centered around coords) */}
          <MapEmbed
            latitude={event.latitude || 51.5074}
            longitude={event.longitude || -0.1278}
            locationName={event.location}
          />

        </aside>

      </div>
    </div>
  )
}

export default EventDetail
