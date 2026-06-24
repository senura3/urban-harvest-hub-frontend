import React from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { ArrowRight, Leaf } from 'lucide-react'

export const HeroSection = () => {
  const { t } = useLang()

  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-[#f5ebd7] via-[#f9f6f0] to-[#e7f0e9] dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 border-b border-stone-200/50 dark:border-stone-850 py-20 lg:py-32" aria-label="Welcome banner">
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none" aria-hidden="true">
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="absolute right-0 top-0 -mt-24 -mr-24 w-96 h-96 bg-harvest/10 dark:bg-harvest/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>
      <div className="absolute left-0 bottom-0 -mb-24 -ml-24 w-96 h-96 bg-earthen/10 dark:bg-earthen/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Info */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-harvest/10 dark:bg-harvest/20 text-harvest-dark dark:text-earthen text-xs font-semibold uppercase tracking-wider">
              <Leaf className="w-3.5 h-3.5" />
              <span>Eco Community Project</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-tight">
              {t('hero.title')}
            </h1>
            
            <p className="text-lg text-stone-600 dark:text-stone-300 max-w-xl leading-relaxed">
              {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/products" className="btn-primary flex items-center gap-2" aria-label="Go to product exploration">
                <span>{t('hero.cta_products')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/events" className="btn-secondary" aria-label="Go to community events list">
                {t('hero.cta_events')}
              </Link>
            </div>
          </div>

          {/* Graphics/Illustrative Image Grid */}
          <div className="lg:col-span-5 relative" aria-hidden="true">
            <div className="relative mx-auto max-w-[400px] aspect-square lg:max-w-none">
              {/* Card 1 */}
              <div className="absolute top-4 left-4 w-4/5 aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/40 dark:border-stone-850 hover:scale-[1.03] transition-transform duration-350 z-20">
                <img
                  src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=600&auto=format&fit=crop"
                  alt="Lush green garden box with hands planting organic sprouts"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Card 2 */}
              <div className="absolute bottom-4 right-4 w-3/5 aspect-[1/1] rounded-3xl overflow-hidden shadow-xl border border-white/40 dark:border-stone-850 hover:scale-[1.03] transition-transform duration-350 z-30">
                <img
                  src="https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=500&auto=format&fit=crop"
                  alt="Compost bin showing rich organic dark soil details"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Background badge */}
              <div className="absolute top-1/2 left-0 -translate-x-1/3 -translate-y-1/2 p-5 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-100 dark:border-stone-800 z-40 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-earthen/20 text-earthen rounded-xl flex items-center justify-center font-bold">
                    100%
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-950 dark:text-white leading-none">Organic & Native</h4>
                    <p className="text-[10px] text-stone-500 mt-1">Community Sourced</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  )
}

export default HeroSection
