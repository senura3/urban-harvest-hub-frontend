import React from 'react'
import { useLang } from '../context/LanguageContext'

export const CategoryFilter = ({ selectedCategory, onSelectCategory }) => {
  const { t } = useLang()

  const categories = [
    { id: 'all', label: t('categories.all') },
    { id: 'food', label: t('categories.food') },
    { id: 'lifestyle', label: t('categories.lifestyle') },
    { id: 'education', label: t('categories.education') },
    { id: 'garden', label: t('categories.garden') }
  ]

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none" role="tablist" aria-label="Filter by category">
      <div className="flex gap-2.5 min-w-max px-1">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              role="tab"
              aria-selected={isSelected}
              aria-controls="items-grid"
              id={`category-tab-${category.id}`}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-harvest focus:ring-offset-2 ${
                isSelected
                  ? 'bg-harvest text-white shadow-md shadow-harvest/15 scale-102'
                  : 'bg-white hover:bg-stone-50 text-stone-600 dark:bg-stone-900 dark:hover:bg-stone-850 dark:text-stone-300 border border-stone-200/60 dark:border-stone-800'
              }`}
            >
              {category.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CategoryFilter
