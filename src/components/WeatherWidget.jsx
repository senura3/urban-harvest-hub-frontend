import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useLang } from '../context/LanguageContext'
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Thermometer } from 'lucide-react'

export const WeatherWidget = () => {
  const { t } = useLang()
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError(false)
        const response = await axios.get(
          'https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1&current_weather=true'
        )
        setWeather(response.data.current_weather)
      } catch (err) {
        console.error("Weather load failed:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchWeather()
  }, [])

  // Map WMO codes to description and icons
  const getWeatherDetails = (code) => {
    if (code === 0) return { desc: 'Clear Sky', icon: Sun, color: 'text-amber-550' }
    if ([1, 2, 3].includes(code)) return { desc: 'Partly Cloudy', icon: Cloud, color: 'text-stone-400' }
    if ([45, 48].includes(code)) return { desc: 'Foggy', icon: Cloud, color: 'text-stone-300' }
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { desc: 'Rainy', icon: CloudRain, color: 'text-blue-400' }
    if ([71, 73, 75, 85, 86].includes(code)) return { desc: 'Snowy', icon: CloudSnow, color: 'text-sky-300' }
    if ([95, 96, 99].includes(code)) return { desc: 'Thunderstorm', icon: CloudLightning, color: 'text-purple-400' }
    return { desc: 'Cloudy', icon: Cloud, color: 'text-stone-400' }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-3xl p-6 shadow-sm animate-pulse flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-stone-200 dark:bg-stone-850 rounded"></div>
          <div className="h-8 w-16 bg-stone-200 dark:bg-stone-850 rounded"></div>
        </div>
        <div className="w-10 h-10 bg-stone-200 dark:bg-stone-850 rounded-full"></div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-3xl p-6 shadow-sm text-center">
        <p className="text-xs font-semibold text-red-500">{t('weather.error')}</p>
        <p className="text-[10px] text-stone-500 mt-1">{t('weather.desc')}</p>
      </div>
    )
  }

  const { desc, icon: WeatherIcon, color } = getWeatherDetails(weather.weathercode)

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-850 rounded-3xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          {t('weather.title')}
        </span>
        <div className="flex items-center gap-1">
          <Thermometer className="w-5 h-5 text-harvest shrink-0" />
          <span className="text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            {weather.temperature}°C
          </span>
        </div>
        <p className="text-[11px] text-stone-500 dark:text-stone-400">
          London, UK • {desc}
        </p>
      </div>

      <div className={`p-3 bg-stone-50 dark:bg-stone-950 rounded-2xl ${color}`}>
        <WeatherIcon className="w-10 h-10 fill-current/10" aria-hidden="true" />
      </div>
    </div>
  )
}

export default WeatherWidget
