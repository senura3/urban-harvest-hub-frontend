import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/api'
import seedData from '../data/seedData.json'
import CategoryFilter from '../components/CategoryFilter'
import MasterDetail from '../components/MasterDetail'
import ReviewList from '../components/ReviewList'
import LoadingSpinner from '../components/LoadingSpinner'
import { useLang } from '../context/LanguageContext'
import { Search, ArrowLeft, ArrowUpDown, ShoppingBag, MapPin, Tag } from 'lucide-react'

export const Products = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLang()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Search, Filter, and Sort states
  const [category, setCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('none') // 'none' | 'price-asc' | 'price-desc'

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        // Request items of type 'product'
        const response = await api.get('/items?type=product')
        setProducts(response.data)
      } catch (err) {
        console.warn("Backend API not reachable. Loading static products seed data.")
        // Fallback to static seed data
        setProducts(seedData.products)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Process data using useMemo for efficiency
  const processedProducts = useMemo(() => {
    let result = [...products]

    // Category Filter
    if (category !== 'all') {
      result = result.filter(item => item.category === category)
    }

    // Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(
        item => 
          item.name.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query)
      )
    }

    // Sort order
    if (sortOrder === 'price-asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortOrder === 'price-desc') {
      result.sort((a, b) => b.price - a.price)
    }

    return result
  }, [products, category, searchQuery, sortOrder])

  const handleSelectProduct = (productId) => {
    navigate(`/products/${productId}`)
  }

  // Render product details inside the right panel (or mobile details screen)
  const renderProductDetail = (product) => {
    const categoryLabels = {
      food: t('categories.food'),
      lifestyle: t('categories.lifestyle'),
      education: t('categories.education'),
      garden: t('categories.garden')
    }

    return (
      <div className="space-y-6 text-left">
        {/* Mobile Back Button */}
        <button
          onClick={() => navigate('/products')}
          className="lg:hidden flex items-center gap-1.5 text-stone-500 font-bold text-sm hover:text-stone-850 mb-4"
          aria-label="Back to products list"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('buttons.back')}</span>
        </button>

        <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="px-3 py-1 bg-harvest/10 dark:bg-harvest/20 text-harvest-dark dark:text-earthen text-xs font-bold uppercase tracking-wider rounded-full">
              {categoryLabels[product.category] || product.category}
            </span>
            <span className="text-sm font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{product.location}</span>
            </span>
          </div>

          <h2 className="text-3xl font-extrabold text-stone-900 dark:text-white leading-tight">
            {product.name}
          </h2>
          
          <div className="text-2xl font-bold text-harvest dark:text-earthen">
            ${product.price.toFixed(2)}
          </div>
        </div>

        <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-950 rounded-2xl text-sm border border-stone-100 dark:border-stone-850">
          <span className="text-stone-550 dark:text-stone-400 font-semibold">Availability:</span>
          <span className={`font-bold ${product.availability > 0 ? 'text-harvest dark:text-earthen' : 'text-red-500'}`}>
            {product.availability > 0 ? `${product.availability} in stock` : 'Out of stock'}
          </span>
        </div>

        <div className="pt-2">
          <Link
            to={`/book/${product.id || product._id}?type=product`}
            className="w-full btn-primary font-bold shadow-md shadow-harvest/15 flex items-center justify-center gap-2"
            aria-label="Order or reserve this product"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order / Book Product</span>
          </Link>
        </div>

        <hr className="border-stone-100 dark:border-stone-800 my-8" />

        {/* Dynamic Reviews Section */}
        <ReviewList itemId={product.id || product._id} initialReviews={[]} />
      </div>
    )
  }

  // Render item inside the left sidebar list
  const renderProductListItem = (product) => {
    const isSelected = (product.id || product._id) === id
    return (
      <div
        key={product.id || product._id}
        onClick={() => handleSelectProduct(product.id || product._id)}
        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
          isSelected
            ? 'bg-harvest/5 border-harvest dark:bg-earthen/5 dark:border-earthen shadow-sm'
            : 'bg-white hover:bg-stone-50 border-stone-200/60 dark:bg-stone-900 dark:hover:bg-stone-850 dark:border-stone-800'
        }`}
        role="button"
        aria-label={`View details of ${product.name}`}
      >
        <div className="flex gap-4">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-16 h-16 object-cover rounded-xl bg-stone-100"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-stone-900 dark:text-white truncate">{product.name}</h4>
            <p className="text-xs text-stone-550 dark:text-stone-400 line-clamp-1 mt-0.5">{product.description}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-bold text-harvest dark:text-earthen">${product.price.toFixed(2)}</span>
              <span className="text-[10px] font-semibold text-stone-400">Qty: {product.availability}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header filters (Only shown if details is not open in mobile) */}
      <div className={`space-y-6 mb-8 ${id ? 'hidden lg:block' : 'block'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              Community Products
            </h1>
            <p className="text-stone-500 mt-1">
              Browse organic harvest and zero-waste household items sourced directly from local growers.
            </p>
          </div>

          {/* Search and Sort controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search')}
                className="pl-9 pr-4 py-2 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-harvest max-w-[240px] text-stone-850 dark:text-white"
                aria-label="Search products"
              />
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(prev => prev === 'price-asc' ? 'price-desc' : 'price-asc')}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 text-sm font-medium rounded-xl hover:bg-stone-50 transition-colors"
              aria-label="Sort by price"
            >
              <ArrowUpDown className="w-4 h-4 text-harvest" />
              <span>{t('buttons.sort')}: {sortOrder === 'price-asc' ? 'Low-High' : sortOrder === 'price-desc' ? 'High-Low' : 'Default'}</span>
            </button>
          </div>
        </div>

        <CategoryFilter selectedCategory={category} onSelectCategory={setCategory} />
      </div>

      {loading ? (
        <LoadingSpinner message="Cultivating product lists..." />
      ) : (
        <MasterDetail
          items={processedProducts}
          selectedId={id}
          renderListItem={renderProductListItem}
          renderDetail={renderProductDetail}
          placeholderText="Select a product from the left menu to view detailed specifications and community reviews."
        />
      )}
    </div>
  )
}

export default Products
