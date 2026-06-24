import React, { useState, useEffect, useMemo } from 'react'
import api from '../api/api'
import seedData from '../data/seedData.json'
import ItemCard from '../components/ItemCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { useLang } from '../context/LanguageContext'
import { Search, Compass, Calendar, ArrowUpDown } from 'lucide-react'

export const Events = () => {
  const { t } = useLang()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters & User Coords
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('all') // 'all' | 'week' | 'month'
  const [userCoords, setUserCoords] = useState(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState('')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get('/events')
        setEvents(response.data)
      } catch (err) {
        console.warn("Backend API not reachable. Loading static events seed data.")
        setEvents(seedData.events)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  // Geolocation trigger
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.")
      return
    }

    setGeoLoading(true)
    setGeoError('')
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserCoords({ latitude, longitude })
        setGeoLoading(false)
        console.log(`Detected coordinates: Lat ${latitude}, Lon ${longitude}`)
      },
      (err) => {
        console.error("Geolocation error:", err)
        setGeoError("Unable to retrieve your location. Check browser settings.")
        setGeoLoading(false)
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
  }

  // Haversine formula to compute distance in km
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const deg2rad = (deg) => deg * (Math.PI / 180)

  // Compute values and filter dynamically
  const processedEvents = useMemo(() => {
    let result = events.map(event => {
      // If userCoords are loaded, compute distance to the event
      if (userCoords && event.latitude && event.longitude) {
        const distance = getDistance(
          userCoords.latitude,
          userCoords.longitude,
          event.latitude,
          event.longitude
        )
        return { ...event, distance }
      }
      return event
    })

    // Search filter (by title)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(e => e.title.toLowerCase().includes(query))
    }

    // Date range filter
    const now = new Date()
    if (dateFilter === 'week') {
      const oneWeekLater = new Date()
      oneWeekLater.setDate(now.getDate() + 7)
      result = result.filter(e => {
        const ed = new Date(e.date)
        return ed >= now && ed <= oneWeekLater
      })
    } else if (dateFilter === 'month') {
      const oneMonthLater = new Date()
      oneMonthLater.setMonth(now.getMonth() + 1)
      result = result.filter(e => {
        const ed = new Date(e.date)
        return ed >= now && ed <= oneMonthLater
      })
    }

    // Sort by proximity if coordinates are available, otherwise sort by date
    if (userCoords) {
      result.sort((a, b) => {
        if (a.distance === undefined) return 1
        if (b.distance === undefined) return -1
        return a.distance - b.distance
      })
    } else {
      result.sort((a, b) => new Date(a.date) - new Date(b.date))
    }

    return result
  }, [events, searchQuery, dateFilter, userCoords])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header controls */}
      <div className="space-y-6 mb-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              Community Events
            </h1>
            <p className="text-stone-500 mt-1">
              Assemble with local neighbors to seed swap, build community gardens, and share agricultural celebrations.
            </p>
          </div>

          {/* Filtering inputs */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Location Sort Button */}
            <button
              onClick={requestLocation}
              disabled={geoLoading}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                userCoords
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-white hover:bg-stone-50 text-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-850 border border-stone-200 dark:border-stone-800'
              }`}
              aria-label="Request location to sort events by proximity"
            >
              <Compass className={`w-4 h-4 ${geoLoading ? 'animate-spin' : ''}`} />
              <span>
                {geoLoading 
                  ? 'Locating...' 
                  : userCoords 
                    ? 'Sorted by Near Proximity' 
                    : 'Sort by My Location'}
              </span>
            </button>

            {/* Date select */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 pointer-events-none">
                <Calendar className="w-4 h-4" />
              </span>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-harvest text-stone-700 dark:text-stone-300"
                aria-label="Filter events by date range"
              >
                <option value="all">All Dates</option>
                <option value="week">Next 7 Days</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="pl-9 pr-4 py-2.5 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-harvest max-w-[200px] text-stone-850 dark:text-white"
                aria-label="Search event title"
              />
            </div>
          </div>
        </div>

        {geoError && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-350 border border-amber-200/50 rounded-xl text-xs font-semibold">
            {geoError}
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Locating local festivals..." />
      ) : (
        <div id="items-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {processedEvents.map(event => (
            <ItemCard key={event.id || event._id} item={event} type="event" />
          ))}
          {processedEvents.length === 0 && (
            <div className="col-span-full text-center py-16 text-stone-500 dark:text-stone-400">
              No matching events found. Try adjusting filters or search query.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Events
