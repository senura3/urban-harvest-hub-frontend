import React from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { Calendar, MapPin, Tag, ArrowRight } from 'lucide-react'

export const ItemCard = ({ item, type }) => {
  const { t } = useLang()

  // Format date if applicable
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Determine url links
  const detailLink = {
    product: `/products/${item.id || item._id}`,
    workshop: `/workshops/${item.id || item._id}`,
    event: `/events/${item.id || item._id}`
  }[type]

  // Render price or free tag
  const renderPrice = () => {
    if (type === 'event') return null
    if (item.price === 0 || !item.price) {
      return <span className="text-xs font-semibold text-harvest bg-harvest/10 px-2 py-1 rounded">{t('common.free')}</span>
    }
    return <span className="font-semibold text-harvest dark:text-earthen">${item.price.toFixed(2)}</span>
  }

  const categoryLabels = {
    food: t('categories.food'),
    lifestyle: t('categories.lifestyle'),
    education: t('categories.education'),
    garden: t('categories.garden')
  }

  return (
    <article className="group bg-white dark:bg-stone-900 rounded-3xl overflow-hidden border border-stone-100 dark:border-stone-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-350 flex flex-col h-full" aria-labelledby={`item-title-${item.id || item._id}`}>
      
      {/* Visual Image container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0">
        <img
          src={item.imageUrl || `https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=400&fit=crop`}
          alt={item.name || item.title || "Eco item image"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Category badge */}
        {item.category && (
          <div className="absolute top-4 left-4 flex gap-1 items-center px-3 py-1 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm rounded-full shadow-sm text-[10px] font-bold text-stone-850 dark:text-stone-200 uppercase tracking-wider">
            <Tag className="w-2.5 h-2.5 text-harvest shrink-0" />
            <span>{categoryLabels[item.category] || item.category}</span>
          </div>
        )}

        {/* Proximity Distance tag (For location-sorted events) */}
        {type === 'event' && item.distance !== undefined && (
          <div className="absolute top-4 right-4 px-2.5 py-1 bg-harvest/95 dark:bg-harvest/90 text-white rounded-full shadow-sm text-[10px] font-semibold tracking-wider">
            {item.distance.toFixed(1)} km
          </div>
        )}
      </div>

      {/* Info Body */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 id={`item-title-${item.id || item._id}`} className="text-xl font-bold tracking-tight text-stone-900 dark:text-white line-clamp-1 group-hover:text-harvest transition-colors">
            {item.name || item.title}
          </h3>
          {renderPrice()}
        </div>

        <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed mb-4 flex-grow">
          {item.description}
        </p>

        {/* Meta Section */}
        <div className="space-y-2.5 pt-4 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
          {item.date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-harvest shrink-0" />
              <span>{formatDate(item.date)}</span>
            </div>
          )}
          {item.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-harvest shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
          )}
          {/* Availability details */}
          {(type === 'product' || type === 'workshop') && (
            <div className="flex items-center justify-between text-[11px] font-semibold mt-1">
              <span>{t('common.availability')}</span>
              <span className={item.availability > 0 ? 'text-harvest dark:text-earthen' : 'text-red-500'}>
                {item.availability > 0 ? `${item.availability} left` : 'Out of stock'}
              </span>
            </div>
          )}
          {type === 'event' && item.maxAttendees && (
            <div className="flex items-center justify-between text-[11px] font-semibold mt-1">
              <span>{t('common.capacity')}</span>
              <span className="text-stone-700 dark:text-stone-300">
                {item.attendees ? `${item.maxAttendees - item.attendees.length} ${t('common.spotsLeft')}` : `${item.maxAttendees} spots`}
              </span>
            </div>
          )}
        </div>

        {/* Action Link */}
        <div className="pt-5 mt-auto">
          <Link
            to={detailLink}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-50 hover:bg-harvest hover:text-white dark:bg-stone-850 dark:hover:bg-harvest rounded-xl text-xs font-bold text-stone-700 dark:text-stone-250 transition-all duration-200"
            aria-label={`View details about ${item.name || item.title}`}
          >
            <span>Learn More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}

export default ItemCard
