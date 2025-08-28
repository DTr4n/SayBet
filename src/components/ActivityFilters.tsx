'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { ActivityFilters } from '@/lib/api/activities'

interface ActivityFiltersProps {
  filters: ActivityFilters
  onFiltersChange: (filters: ActivityFilters) => void
  onClear: () => void
}

const ActivityFiltersComponent = ({ filters, onFiltersChange, onClear }: ActivityFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key: keyof ActivityFilters, value: string | null) => {
    const newFilters = { ...filters }
    if (value === null || value === '') {
      delete newFilters[key]
    } else {
      newFilters[key] = value as any
    }
    onFiltersChange(newFilters)
  }

  const getActiveFilterCount = () => {
    return Object.keys(filters).length
  }

  const hasActiveFilters = getActiveFilterCount() > 0

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
          hasActiveFilters 
            ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Filter className="w-4 h-4" />
        <span>Filter</span>
        {hasActiveFilters && (
          <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">
            {getActiveFilterCount()}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Filter Activities</h3>
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    onClear()
                    setIsOpen(false)
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="spontaneous">Spontaneous</option>
                <option value="planned">Planned</option>
              </select>
            </div>

            {/* Visibility Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <select
                value={filters.visibility || ''}
                onChange={(e) => handleFilterChange('visibility', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Visibility</option>
                <option value="friends">Friends Only</option>
                <option value="previous">Previous Connections</option>
                <option value="open">Open to Everyone</option>
              </select>
            </div>

            {/* Creator Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created By
              </label>
              <select
                value={filters.creatorType || ''}
                onChange={(e) => handleFilterChange('creatorType', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Everyone</option>
                <option value="me">Me</option>
                <option value="friends">Friends</option>
                <option value="connections">Previous Connections</option>
              </select>
            </div>

            {/* Participation Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                My Participation
              </label>
              <select
                value={filters.participationStatus || ''}
                onChange={(e) => handleFilterChange('participationStatus', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Activities</option>
                <option value="participating">I'm Participating</option>
                <option value="not_participating">Not Participating</option>
              </select>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivityFiltersComponent