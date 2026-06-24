import React from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { Leaf, Mail, Phone, MapPin } from 'lucide-react'

export const Footer = () => {
  const { t } = useLang()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-850" aria-label="Global Footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Column 1: Info */}
          <div className="md:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-2 group w-max" aria-label="Urban Harvest Hub home">
              <span className="p-2 bg-harvest text-white rounded-xl shadow-sm">
                <Leaf className="w-5 h-5 fill-white/10" />
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Urban Harvest <span className="text-harvest font-sans">Hub</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-stone-400 max-w-sm">
              Empowering local growers, composting enthusiasts, and communities to foster a greener, more sustainable urban landscape.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold tracking-wide uppercase text-xs">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-harvest transition-colors" aria-label="Go to Home">{t('nav.home')}</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-harvest transition-colors" aria-label="Go to Products">{t('nav.products')}</Link>
              </li>
              <li>
                <Link to="/workshops" className="hover:text-harvest transition-colors" aria-label="Go to Workshops">{t('nav.workshops')}</Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-harvest transition-colors" aria-label="Go to Events">{t('nav.events')}</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold tracking-wide uppercase text-xs">Contact Hub</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5 text-stone-400">
                <MapPin className="w-4 h-4 text-harvest mt-0.5 shrink-0" />
                <span>12 Seed Garden Way, London, UK</span>
              </li>
              <li className="flex items-center gap-2.5 text-stone-400">
                <Phone className="w-4 h-4 text-harvest shrink-0" />
                <span>+44 20 7946 0958</span>
              </li>
              <li className="flex items-center gap-2.5 text-stone-400">
                <Mail className="w-4 h-4 text-harvest shrink-0" />
                <span>hello@urbanharvesthub.org</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 text-center md:flex md:justify-between md:items-center">
          <p className="text-xs text-stone-500">
            &copy; {currentYear} Urban Harvest Hub. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex justify-center gap-6 text-xs text-stone-500">
            <a href="#" className="hover:text-stone-400 transition-colors" aria-label="View Privacy Policy">Privacy Policy</a>
            <a href="#" className="hover:text-stone-400 transition-colors" aria-label="View Terms of Service">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
