import React, { createContext, useContext, useState } from 'react'
import i18n from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import en from '../i18n/en.json'
import es from '../i18n/es.json'

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es }
    },
    lng: localStorage.getItem('lng') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  })

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
  const { t } = useTranslation()
  const [language, setLanguage] = useState(i18n.language)

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    setLanguage(lng)
    localStorage.setItem('lng', lng)
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLang must be used within a LanguageProvider')
  }
  return context
}
export default i18n
