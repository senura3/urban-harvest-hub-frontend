import React from 'react'
import { MapPin } from 'lucide-react'

export const MapEmbed = ({ latitude = 51.5074, longitude = -0.1278, locationName }) => {
  // Compute bounding box around coordinates for OpenStreetMap iframe embed
  const delta = 0.005
  const minLon = longitude - delta
  const minLat = latitude - delta
  const maxLon = longitude + delta
  const maxLat = latitude + delta

  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${latitude}%2C${longitude}`
  const directionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=%3B${latitude}%2C${longitude}`

  return (
    <div className="w-full bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm flex flex-col">
      {/* Header Info */}
      <div className="p-4 bg-stone-50 dark:bg-stone-950 border-b border-stone-100 dark:border-stone-850 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-harvest shrink-0" />
        <span className="text-sm font-semibold text-stone-850 dark:text-stone-250 truncate">
          {locationName || 'Event Location'}
        </span>
      </div>

      {/* Map Iframe */}
      <div className="w-full aspect-[16/9] relative min-h-[250px] bg-stone-100 dark:bg-stone-850">
        <iframe
          title={`Map showing location of ${locationName}`}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={osmUrl}
          className="border-none filter dark:invert dark:hue-rotate-180 dark:opacity-85"
        />
      </div>

      {/* Footer Info */}
      <div className="p-4 flex justify-between items-center text-xs">
        <span className="text-stone-500">Coords: {latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-harvest hover:text-harvest-dark hover:underline flex items-center gap-1"
          aria-label={`Get directions to ${locationName}`}
        >
          <span>Get Directions</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  )
}

export default MapEmbed
