import React from 'react'
import { Star } from 'lucide-react'

export const ReviewCard = ({ review }) => {
  const { name, rating, comment, createdAt } = review

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-stone-50 dark:bg-stone-950 p-5 rounded-2xl border border-stone-200/40 dark:border-stone-850 shadow-sm flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{name}</h4>
          <span className="text-[10px] text-stone-550 dark:text-stone-400 font-medium">
            {formatDate(createdAt)}
          </span>
        </div>
        
        {/* Star Rating */}
        <div className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5 stars`}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < rating 
                  ? 'text-yellow-450 fill-yellow-450' 
                  : 'text-stone-300 dark:text-stone-700'
              }`}
            />
          ))}
        </div>
      </div>
      
      <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed italic">
        "{comment}"
      </p>
    </div>
  )
}

export default ReviewCard
