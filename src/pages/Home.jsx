import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import HeroSection from '../components/HeroSection'
import ItemCard from '../components/ItemCard'
import WeatherWidget from '../components/WeatherWidget'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../api/api'
import seedData from '../data/seedData.json'
import { useLang } from '../context/LanguageContext'
import { Calendar, Tag, ArrowRight, Sun } from 'lucide-react'

export const Home = () => {
  const { t } = useLang()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [upcomingWorkshops, setUpcomingWorkshops] = useState([])
  const [latestEvents, setLatestEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true)
        const [itemsRes, eventsRes] = await Promise.all([
          api.get('/items'),
          api.get('/events')
        ])
        
        const allItems = itemsRes.data
        const products = allItems.filter(i => i.type === 'product').slice(0, 3)
        const workshops = allItems.filter(i => i.type === 'workshop').slice(0, 3)
        const events = eventsRes.data.slice(0, 2)
        
        setFeaturedProducts(products)
        setUpcomingWorkshops(workshops)
        setLatestEvents(events)
      } catch (err) {
        console.warn("Backend API not reachable. Loading static home seed data.")
        // Fallback to static seed data
        setFeaturedProducts(seedData.products.slice(0, 3))
        setUpcomingWorkshops(seedData.workshops.slice(0, 3))
        setLatestEvents(seedData.events.slice(0, 2))
      } finally {
        setLoading(false)
      }
    }
    fetchHomeData()
  }, [])

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Header */}
      <HeroSection />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Weather & Intro Row */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center" aria-label="Introductory info">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-tight">
              Grow Your Own. Composting Made Simple.
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              Welcome to the Hub! We are a localized group of backyard growers, soil enthusiasts, and zero-waste practitioners. We swap seeds, purchase compost starters, bake sourdough, and learn regenerative permaculture practices side-by-side. Check the local conditions below and see what's happening at the allotments today!
            </p>
          </div>
          <div className="lg:col-span-5">
            <WeatherWidget />
          </div>
        </section>

        {loading ? (
          <LoadingSpinner message="Nurturing community catalogs..." />
        ) : (
          <>
            {/* Showcase: Featured Harvest Products */}
            <section className="space-y-6" aria-labelledby="featured-products-title">
              <div className="flex justify-between items-end">
                <div>
                  <h2 id="featured-products-title" className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white font-display">
                    Featured Harvest Products
                  </h2>
                  <p className="text-sm text-stone-500 mt-1">
                    Organic compost, heirloom seeds, and green lifestyle supplies.
                  </p>
                </div>
                <Link to="/products" className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-harvest hover:text-harvest-dark hover:underline">
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProducts.map(product => (
                  <ItemCard key={product.id || product._id} item={product} type="product" />
                ))}
              </div>
            </section>

            {/* Showcase: Upcoming Workshops */}
            <section className="space-y-6" aria-labelledby="upcoming-workshops-title">
              <div className="flex justify-between items-end">
                <div>
                  <h2 id="upcoming-workshops-title" className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white font-display">
                    Upcoming Green Workshops
                  </h2>
                  <p className="text-sm text-stone-500 mt-1">
                    Earn certifications in composting, farming, and zero-waste kitchens.
                  </p>
                </div>
                <Link to="/workshops" className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-harvest hover:text-harvest-dark hover:underline">
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingWorkshops.map(workshop => (
                  <ItemCard key={workshop.id || workshop._id} item={workshop} type="workshop" />
                ))}
              </div>
            </section>

            {/* Showcase: Latest Community Gatherings */}
            <section className="space-y-6" aria-labelledby="latest-events-title">
              <div className="flex justify-between items-end">
                <div>
                  <h2 id="latest-events-title" className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white font-display">
                    Gatherings & Festivals
                  </h2>
                  <p className="text-sm text-stone-500 mt-1">
                    Join hands on seed swap days and help maintain community garden allotment setups.
                  </p>
                </div>
                <Link to="/events" className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-harvest hover:text-harvest-dark hover:underline">
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {latestEvents.map(event => (
                  <ItemCard key={event.id || event._id} item={event} type="event" />
                ))}
              </div>
            </section>
          </>
        )}

      </div>
    </div>
  )
}

export default Home
