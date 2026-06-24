import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/api'
import seedData from '../data/seedData.json'
import CategoryFilter from '../components/CategoryFilter'
import MasterDetail from '../components/MasterDetail'
import ReviewList from '../components/ReviewList'
import LoadingSpinner from '../components/LoadingSpinner'
import { useLang } from '../context/LanguageContext'
import { Search, ArrowLeft, Calendar, MapPin, Tag, GraduationCap } from 'lucide-react'

export const Workshops = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLang()

  const [workshops, setWorkshops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Search and Filter states
  const [category, setCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setLoading(true)
        setError(null)
        // Request items of type 'workshop'
        const response = await api.get('/items?type=workshop')
        setWorkshops(response.data)
      } catch (err) {
        console.warn("Backend API not reachable. Loading static workshops seed data.")
        setWorkshops(seedData.workshops)
      } finally {
        setLoading(false)
      }
    }
    fetchWorkshops()
  }, [])

  // Process data with filters
  const processedWorkshops = useMemo(() => {
    let result = [...workshops]

    // Category Filter
    if (category !== 'all') {
      result = result.filter(item => item.category === category)
    }

    // Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(
        item => 
          item.name.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query)
      )
    }

    // Sort by date (upcoming first)
    result.sort((a, b) => new Date(a.date) - new Date(b.date))

    return result
  }, [workshops, category, searchQuery])

  const handleSelectWorkshop = (workshopId) => {
    navigate(`/workshops/${workshopId}`)
  }

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

  // Render detail inside right panel
  const renderWorkshopDetail = (workshop) => {
    const categoryLabels = {
      food: t('categories.food'),
      lifestyle: t('categories.lifestyle'),
      education: t('categories.education'),
      garden: t('categories.garden')
    }

    return (
      <div className="space-y-6 text-left">
        {/* Mobile Back Button */}
        <button
          onClick={() => navigate('/workshops')}
          className="lg:hidden flex items-center gap-1.5 text-stone-500 font-bold text-sm hover:text-stone-850 mb-4"
          aria-label="Back to workshops list"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('buttons.back')}</span>
        </button>

        <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800">
          <img
            src={workshop.imageUrl}
            alt={workshop.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-3">
          <span className="px-3 py-1 bg-harvest/10 dark:bg-harvest/20 text-harvest-dark dark:text-earthen text-xs font-bold uppercase tracking-wider rounded-full inline-block">
            {categoryLabels[workshop.category] || workshop.category}
          </span>
          <h2 className="text-3xl font-extrabold text-stone-900 dark:text-white leading-tight">
            {workshop.name}
          </h2>
          <div className="text-xl font-bold text-harvest dark:text-earthen">
            {workshop.price > 0 ? `$${workshop.price.toFixed(2)}` : t('common.free')}
          </div>
        </div>

        <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
          {workshop.description}
        </p>

        {/* Schedule Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-100 dark:border-stone-850 text-sm">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-stone-400">Date & Time</span>
            <div className="flex items-start gap-2 text-stone-700 dark:text-stone-250">
              <Calendar className="w-4 h-4 text-harvest mt-0.5 shrink-0" />
              <span className="font-semibold">{formatDate(workshop.date)}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-stone-400">Location</span>
            <div className="flex items-start gap-2 text-stone-700 dark:text-stone-250">
              <MapPin className="w-4 h-4 text-harvest mt-0.5 shrink-0" />
              <span className="font-semibold">{workshop.location}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-stone-55 border border-stone-100 dark:border-stone-850 rounded-2xl text-sm">
          <span className="text-stone-550 dark:text-stone-400 font-semibold">Spots Available:</span>
          <span className={`font-bold ${workshop.availability > 0 ? 'text-harvest dark:text-earthen' : 'text-red-500'}`}>
            {workshop.availability > 0 ? `${workshop.availability} remaining` : 'Full'}
          </span>
        </div>

        <div className="pt-2">
          <Link
            to={`/book/${workshop.id || workshop._id}?type=workshop`}
            className="w-full btn-primary font-bold shadow-md shadow-harvest/15 flex items-center justify-center gap-2"
            aria-label="Register for this workshop"
          >
            <GraduationCap className="w-5 h-5" />
            <span>Register for Workshop</span>
          </Link>
        </div>

        <hr className="border-stone-100 dark:border-stone-850 my-8" />

        {/* Review list */}
        <ReviewList itemId={workshop.id || workshop._id} initialReviews={[]} />
      </div>
    )
  }

  // Render list items
  const renderWorkshopListItem = (workshop) => {
    const isSelected = (workshop.id || workshop._id) === id
    return (
      <div
        key={workshop.id || workshop._id}
        onClick={() => handleSelectWorkshop(workshop.id || workshop._id)}
        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
          isSelected
            ? 'bg-harvest/5 border-harvest dark:bg-earthen/5 dark:border-earthen shadow-sm'
            : 'bg-white hover:bg-stone-50 border-stone-200/60 dark:bg-stone-900 dark:hover:bg-stone-850 dark:border-stone-800'
        }`}
        role="button"
        aria-label={`View details of workshop ${workshop.name}`}
      >
        <div className="flex gap-4">
          <img
            src={workshop.imageUrl}
            alt={workshop.name}
            className="w-16 h-16 object-cover rounded-xl bg-stone-100"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-stone-900 dark:text-white truncate">{workshop.name}</h4>
            <p className="text-xs text-stone-550 dark:text-stone-400 line-clamp-1 mt-0.5">{workshop.description}</p>
            <div className="flex items-center justify-between mt-2.5">
              <span className="text-xs font-bold text-harvest dark:text-earthen">
                {workshop.price > 0 ? `$${workshop.price.toFixed(2)}` : t('common.free')}
              </span>
              <span className="text-[10px] font-semibold text-stone-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(workshop.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header controls (Only shown if details not active on mobile) */}
      <div className={`space-y-6 mb-8 ${id ? 'hidden lg:block' : 'block'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              Regenerative Workshops
            </h1>
            <p className="text-stone-500 mt-1">
              Acquire green skills ranging from home soil composting to zero-waste plant-based cuisine.
            </p>
          </div>

          {/* Search box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('common.search')}
              className="pl-9 pr-4 py-2 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-harvest max-w-[240px] text-stone-850 dark:text-white"
              aria-label="Search workshops"
            />
          </div>
        </div>

        <CategoryFilter selectedCategory={category} onSelectCategory={setCategory} />
      </div>

      {loading ? (
        <LoadingSpinner message="Prepping soil for workshops..." />
      ) : (
        <MasterDetail
          items={processedWorkshops}
          selectedId={id}
          renderListItem={renderWorkshopListItem}
          renderDetail={renderWorkshopDetail}
          placeholderText="Select a workshop from the left menu to view program content, schedules, and student remarks."
        />
      )}
    </div>
  )
}

export default Workshops
