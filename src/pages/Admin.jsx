import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import api from '../api/api'
import seedData from '../data/seedData.json'
import LoadingSpinner from '../components/LoadingSpinner'
import { Plus, Edit2, Trash2, X, PlusCircle, Calendar, Layers, ShieldAlert, Check, Ban } from 'lucide-react'

export const Admin = () => {
  const { user, loading: authLoading, subscribeUserToPush } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()

  // Tab State: 'items' | 'events' | 'bookings' | 'notifications'
  const [activeTab, setActiveTab] = useState('items')
  
  // Data States
  const [items, setItems] = useState([])
  const [events, setEvents] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  // Notification Test States
  const [testPushForm, setTestPushForm] = useState({
    title: 'Urban Harvest Hub',
    body: 'Hello from the Urban Harvest community! Tap to check upcoming events.',
    url: '/events'
  })
  const [isSendingPush, setIsSendingPush] = useState(false)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState('item') // 'item' | 'event'
  const [editingEntity, setEditingEntity] = useState(null) // null if adding

  // Form States
  const [itemForm, setItemForm] = useState({
    name: '', description: '', category: 'garden', type: 'product',
    price: 0, availability: 10, imageUrl: '', date: '', location: ''
  })
  
  const [eventForm, setEventForm] = useState({
    title: '', description: '', date: '', location: '',
    category: 'garden', imageUrl: '', maxAttendees: 100,
    latitude: 51.5, longitude: -0.1
  })

  // Auth Protection Check
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        navigate('/')
      }
    }
  }, [user, authLoading, navigate])

  // Fetch admin dashboard details
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [itemsRes, eventsRes, bookingsRes] = await Promise.all([
        api.get('/items'),
        api.get('/events'),
        api.get('/bookings/me') // fetches admin bookings or all bookings if admin
      ])
      setItems(itemsRes.data)
      setEvents(eventsRes.data)
      setBookings(bookingsRes.data)
    } catch (err) {
      console.warn("Backend API not reachable. Seeding dashboard state from static seedData + local storage.")
      // Load fallback
      const cachedItems = JSON.parse(localStorage.getItem('admin-items') || 'null')
      const cachedEvents = JSON.parse(localStorage.getItem('admin-events') || 'null')
      const cachedBookings = JSON.parse(localStorage.getItem('admin-bookings') || 'null')
      
      setItems(cachedItems || [...seedData.products, ...seedData.workshops])
      setEvents(cachedEvents || seedData.events)
      setBookings(cachedBookings || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadDashboardData()
    }
  }, [user])

  // Sync to local storage on fallback updates
  const updateFallbackCache = (newItems, newEvents, newBookings) => {
    if (newItems) {
      setItems(newItems)
      localStorage.setItem('admin-items', JSON.stringify(newItems))
    }
    if (newEvents) {
      setEvents(newEvents)
      localStorage.setItem('admin-events', JSON.stringify(newEvents))
    }
    if (newBookings) {
      setBookings(newBookings)
      localStorage.setItem('admin-bookings', JSON.stringify(newBookings))
    }
  }

  // Handle CRUD submissions
  const handleItemSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingEntity) {
        // UPDATE
        const id = editingEntity.id || editingEntity._id
        try {
          const res = await api.put(`/items/${id}`, itemForm)
          setItems(items.map(i => (i.id || i._id) === id ? res.data : i))
        } catch (apiErr) {
          // Fallback cache updates
          const updated = items.map(i => (i.id || i._id) === id ? { ...editingEntity, ...itemForm } : i)
          updateFallbackCache(updated, null, null)
        }
      } else {
        // CREATE
        try {
          const res = await api.post('/items', itemForm)
          setItems([...items, res.data])
        } catch (apiErr) {
          // Fallback cache updates
          const newItem = { ...itemForm, id: 'item-' + Date.now(), createdAt: new Date().toISOString() }
          updateFallbackCache([...items, newItem], null, null)
        }
      }
      setIsModalOpen(false)
      resetForms()
    } catch (err) {
      alert("Submission error: " + err.message)
    }
  }

  const handleEventSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingEntity) {
        // UPDATE
        const id = editingEntity.id || editingEntity._id
        try {
          const res = await api.put(`/events/${id}`, eventForm)
          setEvents(events.map(ev => (ev.id || ev._id) === id ? res.data : ev))
        } catch (apiErr) {
          const updated = events.map(ev => (ev.id || ev._id) === id ? { ...editingEntity, ...eventForm } : ev)
          updateFallbackCache(null, updated, null)
        }
      } else {
        // CREATE
        try {
          const res = await api.post('/events', eventForm)
          setEvents([...events, res.data])
        } catch (apiErr) {
          const newEvent = { ...eventForm, id: 'ev-' + Date.now(), attendees: [] }
          updateFallbackCache(null, [...events, newEvent], null)
        }
      }
      setIsModalOpen(false)
      resetForms()
    } catch (err) {
      alert("Submission error: " + err.message)
    }
  }

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return
    try {
      try {
        await api.delete(`/items/${id}`)
        setItems(items.filter(i => (i.id || i._id) !== id))
      } catch (apiErr) {
        const updated = items.filter(i => (i.id || i._id) !== id)
        updateFallbackCache(updated, null, null)
      }
    } catch (err) {
      alert("Delete failed: " + err.message)
    }
  }

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return
    try {
      try {
        await api.delete(`/events/${id}`)
        setEvents(events.filter(ev => (ev.id || ev._id) !== id))
      } catch (apiErr) {
        const updated = events.filter(ev => (ev.id || ev._id) !== id)
        updateFallbackCache(null, updated, null)
      }
    } catch (err) {
      alert("Delete failed: " + err.message)
    }
  }

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      try {
        await api.put(`/bookings/${id}`, { status })
        setBookings(bookings.map(b => (b.id || b._id) === id ? { ...b, status } : b))
      } catch (apiErr) {
        const updated = bookings.map(b => (b.id || b._id) === id ? { ...b, status } : b)
        updateFallbackCache(null, null, updated)
      }
    } catch (err) {
      alert("Status update failed: " + err.message)
    }
  }

  const openAddModal = (type) => {
    setModalType(type)
    setEditingEntity(null)
    resetForms()
    setIsModalOpen(true)
  }

  const openEditModal = (type, entity) => {
    setModalType(type)
    setEditingEntity(entity)
    if (type === 'item') {
      setItemForm({
        name: entity.name || '',
        description: entity.description || '',
        category: entity.category || 'garden',
        type: entity.type || 'product',
        price: entity.price || 0,
        availability: entity.availability || 0,
        imageUrl: entity.imageUrl || '',
        date: entity.date ? entity.date.substring(0, 10) : '',
        location: entity.location || ''
      })
    } else {
      setEventForm({
        title: entity.title || '',
        description: entity.description || '',
        date: entity.date ? entity.date.substring(0, 16) : '',
        location: entity.location || '',
        category: entity.category || 'garden',
        imageUrl: entity.imageUrl || '',
        maxAttendees: entity.maxAttendees || 100,
        latitude: entity.latitude || 51.5,
        longitude: entity.longitude || -0.1
      })
    }
    setIsModalOpen(true)
  }

  const resetForms = () => {
    setItemForm({
      name: '', description: '', category: 'garden', type: 'product',
      price: 0, availability: 10, imageUrl: '', date: '', location: ''
    })
    setEventForm({
      title: '', description: '', date: '', location: '',
      category: 'garden', imageUrl: '', maxAttendees: 100,
      latitude: 51.5, longitude: -0.1
    })
  }

  if (authLoading || loading) {
    return <LoadingSpinner message="Entering security vault..." />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-200 dark:border-stone-850 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight flex items-center gap-2 font-display">
            <span>{t('admin.title')}</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Create, update, and manage community products, workshops, and gatherings.
          </p>
        </div>

        {/* Action button trigger */}
        <div className="flex gap-2.5">
          <button
            onClick={() => openAddModal('item')}
            className="btn-primary py-2 px-4.5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
          <button
            onClick={() => openAddModal('event')}
            className="btn-secondary py-2 px-4.5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-harvest" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-stone-250 dark:border-stone-800 mb-6">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'items'
              ? 'border-harvest text-harvest dark:border-earthen dark:text-earthen'
              : 'border-transparent text-stone-500 hover:text-stone-750'
          }`}
        >
          {t('admin.productsTab')}
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'events'
              ? 'border-harvest text-harvest dark:border-earthen dark:text-earthen'
              : 'border-transparent text-stone-500 hover:text-stone-750'
          }`}
        >
          {t('admin.eventsTab')}
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'bookings'
              ? 'border-harvest text-harvest dark:border-earthen dark:text-earthen'
              : 'border-transparent text-stone-500 hover:text-stone-750'
          }`}
        >
          {t('admin.bookingsTab')}
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'notifications'
              ? 'border-harvest text-harvest dark:border-earthen dark:text-earthen'
              : 'border-transparent text-stone-500 hover:text-stone-750'
          }`}
        >
          Test Notifications
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
        {activeTab === 'items' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 dark:bg-stone-950 border-b border-stone-100 dark:border-stone-850 text-xs font-bold uppercase tracking-wider text-stone-500">
                  <th className="p-4">Name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Qty</th>
                  <th className="p-4 text-center">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-850 text-sm">
                {items.map(item => (
                  <tr key={item.id || item._id} className="hover:bg-stone-50/50 dark:hover:bg-stone-850/50 transition-colors">
                    <td className="p-4 font-semibold text-stone-900 dark:text-white">{item.name}</td>
                    <td className="p-4 capitalize">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.type === 'workshop' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4 capitalize text-stone-550 dark:text-stone-400">{item.category}</td>
                    <td className="p-4 font-medium text-stone-800 dark:text-stone-300">${item.price.toFixed(2)}</td>
                    <td className="p-4 text-stone-600 dark:text-stone-400">{item.availability}</td>
                    <td className="p-4 flex gap-2 justify-center">
                      <button
                        onClick={() => openEditModal('item', item)}
                        className="p-2 text-stone-500 hover:text-harvest hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                        aria-label="Edit item"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id || item._id)}
                        className="p-2 text-stone-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                        aria-label="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 dark:bg-stone-950 border-b border-stone-100 dark:border-stone-850 text-xs font-bold uppercase tracking-wider text-stone-500">
                  <th className="p-4">Title</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Max Attendees</th>
                  <th className="p-4 text-center">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-850 text-sm">
                {events.map(ev => (
                  <tr key={ev.id || ev._id} className="hover:bg-stone-50/50 dark:hover:bg-stone-850/50 transition-colors">
                    <td className="p-4 font-semibold text-stone-900 dark:text-white">{ev.title}</td>
                    <td className="p-4 text-xs font-semibold text-stone-500">
                      {new Date(ev.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 truncate max-w-[150px] text-stone-650 dark:text-stone-300">{ev.location}</td>
                    <td className="p-4 text-stone-600 dark:text-stone-400">{ev.maxAttendees || 'Open'}</td>
                    <td className="p-4 flex gap-2 justify-center">
                      <button
                        onClick={() => openEditModal('event', ev)}
                        className="p-2 text-stone-500 hover:text-harvest hover:bg-stone-100 dark:hover:bg-stone-850 rounded-lg transition-colors"
                        aria-label="Edit event"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(ev.id || ev._id)}
                        className="p-2 text-stone-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                        aria-label="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 dark:bg-stone-950 border-b border-stone-100 dark:border-stone-850 text-xs font-bold uppercase tracking-wider text-stone-500">
                  <th className="p-4">Member Name</th>
                  <th className="p-4">Item/Event Name</th>
                  <th className="p-4">Date Requested</th>
                  <th className="p-4">Tickets</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-850 text-sm">
                {bookings.map(b => (
                  <tr key={b.id || b._id} className="hover:bg-stone-50/50 dark:hover:bg-stone-850/50 transition-colors">
                    <td className="p-4 font-semibold text-stone-900 dark:text-white">{b.name || b.user?.name || 'Eco Member'}</td>
                    <td className="p-4 text-stone-650 dark:text-stone-300 truncate max-w-[150px]">{b.itemName || b.item?.name || b.event?.title || 'Unknown Item'}</td>
                    <td className="p-4 text-xs">{new Date(b.date).toLocaleDateString()}</td>
                    <td className="p-4 font-semibold text-center">{b.tickets || 1}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-850' : 'bg-red-100 text-red-800'
                      }`}>
                        {b.status || 'confirmed'}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2 justify-center">
                      <button
                        onClick={() => handleUpdateBookingStatus(b.id || b._id, 'confirmed')}
                        className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-all"
                        title="Confirm Booking"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleUpdateBookingStatus(b.id || b._id, 'cancelled')}
                        className="p-1.5 bg-red-50 text-red-650 hover:bg-red-650 hover:text-white rounded-lg transition-all"
                        title="Cancel Booking"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="p-6 md:p-8 space-y-8 animate-fadeIn">
            <div className="max-w-2xl">
              <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">Push Notification Testing Suite</h3>
              <p className="text-sm text-stone-500">
                Verify and debug push notification delivery on this client, trigger local testing notifications, or broadcast a web-push notification to all registered subscription endpoints.
              </p>
            </div>

            {/* Diagnostic Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Client Diagnostic Card */}
              <div className="bg-stone-50 dark:bg-stone-950 p-6 rounded-2xl border border-stone-100 dark:border-stone-850 space-y-4">
                <h4 className="font-bold text-stone-850 dark:text-white text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-harvest animate-pulse"></span>
                  <span>Local Client Status</span>
                </h4>
                
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between border-b border-stone-150/40 dark:border-stone-800 pb-2">
                    <span className="text-stone-500">Push Manager Supported:</span>
                    <span className="font-semibold text-stone-700 dark:text-stone-300">{'PushManager' in window ? 'Yes ✅' : 'No ❌'}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-150/40 dark:border-stone-800 pb-2">
                    <span className="text-stone-500">Service Worker Active:</span>
                    <span className="font-semibold text-stone-700 dark:text-stone-300">{'serviceWorker' in navigator ? 'Yes ✅' : 'No ❌'}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-150/40 dark:border-stone-800 pb-2">
                    <span className="text-stone-500">Notification Permission:</span>
                    <span className="font-semibold capitalize text-stone-700 dark:text-stone-300">{Notification.permission}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={async () => {
                      if (subscribeUserToPush) {
                        await subscribeUserToPush();
                        alert("Re-triggered push subscription process! Check browser console logs.");
                      }
                    }}
                    className="w-full btn-secondary text-xs py-2 font-bold"
                  >
                    Subscribe / Check Permission
                  </button>
                </div>
              </div>

              {/* Local Notification Trigger */}
              <div className="bg-stone-50 dark:bg-stone-950 p-6 rounded-2xl border border-stone-100 dark:border-stone-850 space-y-4">
                <h4 className="font-bold text-stone-850 dark:text-white text-sm flex items-center gap-2">
                  <span>Immediate Local Notification</span>
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Trigger an immediate notification directly within this browser window. Excellent for verifying sound, vibration, and display formats locally without sending backend API payloads.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (!("Notification" in window)) {
                        alert("This browser does not support desktop notifications.");
                        return;
                      }
                      
                      if (Notification.permission === "granted") {
                        new Notification("Urban Harvest Local Test", {
                          body: "Great job! Local notifications are fully active and working.",
                          icon: "/icons/icon-192.svg"
                        });
                      } else if (Notification.permission !== "denied") {
                        Notification.requestPermission().then((permission) => {
                          if (permission === "granted") {
                            new Notification("Urban Harvest Local Test", {
                              body: "Great job! Local notifications are fully active and working.",
                              icon: "/icons/icon-192.svg"
                            });
                          }
                        });
                      } else {
                        alert("Notification permission is currently blocked. Please reset site permissions in your browser address bar.");
                      }
                    }}
                    className="w-full btn-secondary text-xs py-2 font-bold"
                  >
                    Trigger Local Test Notification
                  </button>
                </div>
              </div>

            </div>

            {/* Broadcast Form Panel */}
            <div className="bg-stone-50 dark:bg-stone-950 p-6 md:p-8 rounded-3xl border border-stone-100 dark:border-stone-850 space-y-6">
              <div className="border-b border-stone-150/40 dark:border-stone-800 pb-3">
                <h4 className="font-bold text-stone-900 dark:text-white text-base">Broadcast Web-Push Notification</h4>
                <p className="text-xs text-stone-500 mt-0.5">Send a real VAPID-encrypted push payload from the backend to all registered device endpoints.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Notification Title</label>
                  <input
                    type="text"
                    value={testPushForm.title}
                    onChange={(e) => setTestPushForm({ ...testPushForm, title: e.target.value })}
                    className="input-field py-2 text-sm text-stone-850 dark:text-white bg-white dark:bg-stone-900"
                    placeholder="Enter title..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Action Redirect URL</label>
                  <input
                    type="text"
                    value={testPushForm.url}
                    onChange={(e) => setTestPushForm({ ...testPushForm, url: e.target.value })}
                    className="input-field py-2 text-sm text-stone-850 dark:text-white bg-white dark:bg-stone-900"
                    placeholder="/workshops"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Message Body</label>
                <textarea
                  value={testPushForm.body}
                  onChange={(e) => setTestPushForm({ ...testPushForm, body: e.target.value })}
                  className="input-field py-2 text-sm resize-none text-stone-850 dark:text-white bg-white dark:bg-stone-900"
                  rows="3"
                  placeholder="Enter message text..."
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    setIsSendingPush(true);
                    try {
                      const res = await api.post('/auth/broadcast-test', testPushForm);
                      alert(res.data.message || "Push notification broadcast completed successfully!");
                    } catch (err) {
                      console.error(err);
                      alert("Failed to broadcast push notification: " + (err.response?.data?.message || err.message));
                    } finally {
                      setIsSendingPush(false);
                    }
                  }}
                  disabled={isSendingPush}
                  className="btn-primary py-2.5 px-6 font-bold flex items-center justify-center gap-2"
                >
                  <span>{isSendingPush ? 'Broadcasting...' : 'Broadcast Push Notification'}</span>
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* CRUD Overlaid Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 dark:bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-zoomIn">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-850 pb-4">
              <h2 className="text-2xl font-bold text-stone-900 dark:text-white font-display">
                {editingEntity ? 'Edit' : 'Add'} {modalType === 'item' ? 'Product/Workshop' : 'Gathering Event'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl"
                aria-label="Close form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalType === 'item' ? (
              <form onSubmit={handleItemSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Item Type</label>
                    <select
                      value={itemForm.type}
                      onChange={(e) => setItemForm({ ...itemForm, type: e.target.value })}
                      className="input-field py-2 text-sm"
                    >
                      <option value="product">Product</option>
                      <option value="workshop">Workshop</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Category</label>
                    <select
                      value={itemForm.category}
                      onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                      className="input-field py-2 text-sm"
                    >
                      <option value="garden">Garden & Soil</option>
                      <option value="food">Food & Produce</option>
                      <option value="lifestyle">Eco Lifestyle</option>
                      <option value="education">Education</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Name</label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="input-field py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Description</label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    className="input-field py-2 text-sm resize-none"
                    rows="3"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={itemForm.price}
                      onChange={(e) => setItemForm({ ...itemForm, price: parseFloat(e.target.value) || 0 })}
                      className="input-field py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Availability / Slots</label>
                    <input
                      type="number"
                      value={itemForm.availability}
                      onChange={(e) => setItemForm({ ...itemForm, availability: parseInt(e.target.value) || 0 })}
                      className="input-field py-2 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Image URL</label>
                  <input
                    type="url"
                    value={itemForm.imageUrl}
                    onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                    className="input-field py-2 text-sm"
                    placeholder="https://images.unsplash.com/..."
                    required
                  />
                </div>

                {itemForm.type === 'workshop' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Workshop Date</label>
                      <input
                        type="date"
                        value={itemForm.date}
                        onChange={(e) => setItemForm({ ...itemForm, date: e.target.value })}
                        className="input-field py-2 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Workshop Room/Location</label>
                      <input
                        type="text"
                        value={itemForm.location}
                        onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })}
                        className="input-field py-2 text-sm"
                        required
                      />
                    </div>
                  </div>
                )}

                <button type="submit" className="w-full btn-primary py-2.5 text-sm font-semibold">
                  Save Item
                </button>
              </form>
            ) : (
              <form onSubmit={handleEventSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Event Title</label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="input-field py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Description</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className="input-field py-2 text-sm resize-none"
                    rows="3"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Event Date & Time</label>
                    <input
                      type="datetime-local"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="input-field py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Capacity limit</label>
                    <input
                      type="number"
                      value={eventForm.maxAttendees}
                      onChange={(e) => setEventForm({ ...eventForm, maxAttendees: parseInt(e.target.value) || 100 })}
                      className="input-field py-2 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Location Name / Address</label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="input-field py-2 text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Latitude Coords</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={eventForm.latitude}
                      onChange={(e) => setEventForm({ ...eventForm, latitude: parseFloat(e.target.value) || 51.5 })}
                      className="input-field py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Longitude Coords</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={eventForm.longitude}
                      onChange={(e) => setEventForm({ ...eventForm, longitude: parseFloat(e.target.value) || -0.1 })}
                      className="input-field py-2 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Image URL</label>
                  <input
                    type="url"
                    value={eventForm.imageUrl}
                    onChange={(e) => setEventForm({ ...eventForm, imageUrl: e.target.value })}
                    className="input-field py-2 text-sm"
                    required
                  />
                </div>

                <button type="submit" className="w-full btn-primary py-2.5 text-sm font-semibold">
                  Save Event
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default Admin
