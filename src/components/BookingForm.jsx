import React, { useState } from 'react'
import { useLang } from '../context/LanguageContext'
import { Calendar, User, Mail, CreditCard, ClipboardList } from 'lucide-react'

export const BookingForm = ({ item, onSubmitBooking, isSubmitting = false }) => {
  const { t } = useLang()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    tickets: 1,
    notes: ''
  })
  
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [successMsg, setSuccessMsg] = useState('')

  // Validate form fields
  const validate = (data) => {
    const tempErrors = {}
    
    if (!data.name.trim()) {
      tempErrors.name = t('forms.validationRequired')
    }
    
    if (!data.email.trim()) {
      tempErrors.email = t('forms.validationRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      tempErrors.email = t('forms.validationEmail')
    }
    
    if (!data.date) {
      tempErrors.date = t('forms.validationRequired')
    } else {
      const selectedDate = new Date(data.date)
      const today = new Date()
      // Reset hours to compare only days
      today.setHours(0,0,0,0)
      if (selectedDate <= today) {
        tempErrors.date = t('forms.validationDate')
      }
    }
    
    if (!data.tickets || data.tickets < 1) {
      tempErrors.tickets = "Tickets must be at least 1"
    } else if (item.availability && data.tickets > item.availability) {
      tempErrors.tickets = `Only ${item.availability} spots available`
    }
    
    return tempErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const updated = {
      ...formData,
      [name]: name === 'tickets' ? parseInt(value) || 0 : value
    }
    setFormData(updated)
    
    if (touched[name]) {
      setErrors(validate(updated))
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched({ ...touched, [name]: true })
    setErrors(validate(formData))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({
      name: true,
      email: true,
      date: true,
      tickets: true
    })
    
    const validationErrors = validate(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      await onSubmitBooking(formData)
      
      if (!navigator.onLine) {
        setSuccessMsg(t('forms.offlineSuccessBooking'))
      } else {
        setSuccessMsg(t('forms.successBooking'))
      }

      setFormData({
        name: '',
        email: '',
        date: '',
        tickets: 1,
        notes: ''
      })
      setErrors({})
      setTouched({})
    } catch (err) {
      setErrors({ submit: err.message || "Failed to submit booking. Please try again." })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <h3 className="text-2xl font-bold text-stone-900 dark:text-white font-display mb-2">
        {t('buttons.bookNow')}
      </h3>
      <p className="text-xs text-stone-500 dark:text-stone-400">
        Registering for: <span className="font-semibold text-harvest dark:text-earthen">{item.name || item.title}</span>
      </p>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-350 border border-emerald-250 rounded-2xl text-sm font-medium animate-fadeIn">
          {successMsg}
        </div>
      )}

      {errors.submit && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-350 border border-red-200 rounded-2xl text-sm font-medium">
          {errors.submit}
        </div>
      )}

      {/* Name Input */}
      <div>
        <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2">
          {t('forms.name')} *
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-450 pointer-events-none">
            <User className="w-5 h-5" />
          </span>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`input-field pl-11 ${
              touched.name && errors.name 
                ? 'border-red-400 focus:ring-red-400' 
                : touched.name && !errors.name 
                  ? 'border-emerald-300 focus:ring-emerald-300' 
                  : ''
            }`}
            placeholder="John Doe"
            disabled={isSubmitting}
            required
            aria-describedby={errors.name ? "name-error" : undefined}
          />
        </div>
        {touched.name && errors.name && (
          <p id="name-error" className="mt-1.5 text-xs font-semibold text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Email Input */}
      <div>
        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2">
          {t('forms.email')} *
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-450 pointer-events-none">
            <Mail className="w-5 h-5" />
          </span>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`input-field pl-11 ${
              touched.email && errors.email 
                ? 'border-red-400 focus:ring-red-400' 
                : touched.email && !errors.email 
                  ? 'border-emerald-300 focus:ring-emerald-300' 
                  : ''
            }`}
            placeholder="john@example.com"
            disabled={isSubmitting}
            required
            aria-describedby={errors.email ? "email-error" : undefined}
          />
        </div>
        {touched.email && errors.email && (
          <p id="email-error" className="mt-1.5 text-xs font-semibold text-red-500">{errors.email}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date Input */}
        <div>
          <label htmlFor="date" className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2">
            {t('forms.date')} *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-450 pointer-events-none">
              <Calendar className="w-5 h-5" />
            </span>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input-field pl-11 ${
                touched.date && errors.date 
                  ? 'border-red-400 focus:ring-red-400' 
                  : touched.date && !errors.date 
                    ? 'border-emerald-300 focus:ring-emerald-300' 
                    : ''
              }`}
              disabled={isSubmitting}
              required
              aria-describedby={errors.date ? "date-error" : undefined}
            />
          </div>
          {touched.date && errors.date && (
            <p id="date-error" className="mt-1.5 text-xs font-semibold text-red-500">{errors.date}</p>
          )}
        </div>

        {/* Tickets Input */}
        <div>
          <label htmlFor="tickets" className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2">
            {t('forms.tickets')} *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-450 pointer-events-none">
              <CreditCard className="w-5 h-5" />
            </span>
            <input
              type="number"
              id="tickets"
              name="tickets"
              value={formData.tickets}
              onChange={handleChange}
              onBlur={handleBlur}
              min="1"
              max={item.availability || 100}
              className={`input-field pl-11 ${
                touched.tickets && errors.tickets 
                  ? 'border-red-400 focus:ring-red-400' 
                  : touched.tickets && !errors.tickets 
                    ? 'border-emerald-300 focus:ring-emerald-300' 
                    : ''
              }`}
              disabled={isSubmitting}
              required
              aria-describedby={errors.tickets ? "tickets-error" : undefined}
            />
          </div>
          {touched.tickets && errors.tickets && (
            <p id="tickets-error" className="mt-1.5 text-xs font-semibold text-red-500">{errors.tickets}</p>
          )}
        </div>
      </div>

      {/* Special notes */}
      <div>
        <label htmlFor="notes" className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2">
          {t('forms.notes')}
        </label>
        <div className="relative">
          <span className="absolute top-3.5 left-3.5 text-stone-455 pointer-events-none">
            <ClipboardList className="w-5 h-5" />
          </span>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="input-field pl-11 resize-none"
            placeholder="Let us know about dietary restrictions, accessibility queries, etc."
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full btn-primary font-bold shadow-md shadow-harvest/10 flex items-center justify-center gap-2"
        aria-label="Confirm booking details"
      >
        <span>
          {isSubmitting ? t('buttons.submitting') : t('buttons.submit')}
        </span>
      </button>
    </form>
  )
}

export default BookingForm
