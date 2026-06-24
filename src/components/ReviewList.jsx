import React, { useState } from 'react'
import ReviewCard from './ReviewCard'
import { useAuth } from '../context/AuthContext'
import { Star, MessageSquarePlus } from 'lucide-react'

export const ReviewList = ({ itemId, initialReviews = [], onAddReview }) => {
  const { user } = useAuth()
  const [reviews, setReviews] = useState(initialReviews)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!comment.trim()) {
      setError('Please write a review comment.')
      return
    }

    const newReview = {
      id: 'r-' + Date.now(),
      name: user ? user.name : 'Anonymous Eco Friend',
      rating,
      comment,
      createdAt: new Date().toISOString()
    }

    const updated = [newReview, ...reviews]
    setReviews(updated)
    
    if (onAddReview) {
      onAddReview(newReview)
    }

    // Reset Form
    setComment('')
    setRating(5)
    setError('')
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <h3 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white font-display">
          Community Reviews ({reviews.length})
        </h3>
      </div>

      {/* Write a Review Section */}
      {user ? (
        <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-3xl space-y-4 shadow-sm">
          <h4 className="font-semibold text-stone-900 dark:text-white flex items-center gap-2 text-base">
            <MessageSquarePlus className="w-5 h-5 text-harvest" />
            <span>Write a review</span>
          </h4>

          {error && <p className="text-xs font-semibold text-red-500">{error}</p>}

          {/* Star selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-stone-600 dark:text-stone-400 mr-2">Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none transition-transform active:scale-110"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-450 fill-yellow-450'
                      : 'text-stone-300 dark:text-stone-700'
                  }`}
                />
              </button>
            ))}
          </div>

          <div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="3"
              className="input-field"
              placeholder="Share your experience with this item..."
              required
            />
          </div>

          <button type="submit" className="btn-primary py-2 px-5 text-sm">
            Submit Review
          </button>
        </form>
      ) : (
        <div className="p-5 bg-stone-100 dark:bg-stone-900 rounded-2xl text-center text-sm text-stone-600 dark:text-stone-400">
          Please <a href="/login" className="text-harvest hover:underline font-semibold">login</a> to write a review.
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => <ReviewCard key={review.id || review._id} review={review} />)
        ) : (
          <p className="text-sm text-stone-500 italic py-4">No reviews yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </div>
  )
}

export default ReviewList
