import React from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'

export const NotFound = () => {
  const { t } = useLang()

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-24 h-24 bg-harvest/10 dark:bg-harvest/20 rounded-full flex items-center justify-center text-harvest mb-8">
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-5xl font-extrabold text-stone-900 dark:text-stone-100 mb-4 tracking-tight">404</h1>
      <h2 className="text-2xl font-semibold text-stone-700 dark:text-stone-300 mb-4">
        Page Not Found
      </h2>
      <p className="text-stone-500 dark:text-stone-400 max-w-md mb-8 leading-relaxed">
        The branch you are looking for has been pruned or never existed. Let's get you back to the fertile soils of our home base.
      </p>
      <Link
        to="/"
        className="btn-primary"
        aria-label="Go back to the homepage"
      >
        {t('buttons.back')} {t('nav.home')}
      </Link>
    </div>
  )
}

export default NotFound
