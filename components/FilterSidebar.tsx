'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function FilterSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    budgetType: searchParams.get('budgetType') || '',
    location: searchParams.get('location') || '',
  })

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (filters.category && filters.category !== 'all') params.set('category', filters.category)
    if (filters.budgetType) params.set('budgetType', filters.budgetType)
    if (filters.location) params.set('location', filters.location)

    router.push(`/browse?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({ category: 'all', budgetType: '', location: '' })
    router.push('/browse')
  }

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:underline"
          >
            Clear all
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Categories</option>
            <option value="fashion">Fashion</option>
            <option value="beauty">Beauty</option>
            <option value="tech">Tech</option>
            <option value="food">Food & Drink</option>
            <option value="travel">Travel</option>
            <option value="fitness">Fitness</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="gaming">Gaming</option>
          </select>
        </div>

        {/* Location Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Location</label>
          <input
            type="text"
            placeholder="Enter city or country"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Budget Type Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Budget Type</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="budgetType"
                value=""
                checked={filters.budgetType === ''}
                onChange={(e) => setFilters({ ...filters, budgetType: e.target.value })}
                className="mr-2"
              />
              All Types
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="budgetType"
                value="FIXED"
                checked={filters.budgetType === 'FIXED'}
                onChange={(e) => setFilters({ ...filters, budgetType: e.target.value })}
                className="mr-2"
              />
              Fixed Payment
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="budgetType"
                value="SAMPLE"
                checked={filters.budgetType === 'SAMPLE'}
                onChange={(e) => setFilters({ ...filters, budgetType: e.target.value })}
                className="mr-2"
              />
              Product Sample
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="budgetType"
                value="COMMISSION"
                checked={filters.budgetType === 'COMMISSION'}
                onChange={(e) => setFilters({ ...filters, budgetType: e.target.value })}
                className="mr-2"
              />
              Commission
            </label>
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={applyFilters}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
        >
          Apply Filters
        </button>

        {/* Save Search */}
        <button className="w-full mt-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition">
          💾 Save Search
        </button>
      </div>
    </aside>
  )
}
