'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Activity } from '@/types/activity'
import LoadingSpinner from './LoadingSpinner'

interface ActivityFormData {
  title: string
  description: string
  timeframe: string
  location: string
  vibe: 'active' | 'casual' | 'social' | 'chill' | 'foodie' | 'competitive'
  visibility: 'friends' | 'previous' | 'open'
}

interface ActivityFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: ActivityFormData) => void | Promise<void>
  initialData?: Partial<ActivityFormData>
  isLoading?: boolean
}

const ActivityForm = ({ isOpen, onClose, onSubmit, initialData, isLoading = false }: ActivityFormProps) => {
  const [formData, setFormData] = useState<ActivityFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    timeframe: initialData?.timeframe || '',
    location: initialData?.location || '',
    vibe: initialData?.vibe || 'chill',
    visibility: initialData?.visibility || 'friends'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title && formData.timeframe && formData.location) {
      onSubmit(formData)
      setFormData({
        title: '',
        description: '',
        timeframe: '',
        location: '',
        vibe: 'chill',
        visibility: 'friends'
      })
    }
  }

  const handleChange = (field: keyof ActivityFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="glass-card w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Post Activity</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What's the plan?
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Coffee run, hiking, trying new restaurant..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Details
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Any extra details or context..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                When?
              </label>
              <input
                type="text"
                value={formData.timeframe}
                onChange={(e) => handleChange('timeframe', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Right now, in 30 mins, tomorrow evening..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Where?
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Location or meeting spot"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Who can join?
              </label>
              <select
                value={formData.visibility}
                onChange={(e) => handleChange('visibility', e.target.value as ActivityFormData['visibility'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="friends">Friends Only</option>
                <option value="previous">Previous Hangout People</option>
                <option value="open">Open to All</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vibe
              </label>
              <select
                value={formData.vibe}
                onChange={(e) => handleChange('vibe', e.target.value as ActivityFormData['vibe'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="chill">Chill</option>
                <option value="active">Active</option>
                <option value="casual">Casual</option>
                <option value="social">Social</option>
                <option value="foodie">Foodie</option>
                <option value="competitive">Competitive</option>
              </select>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 button-gradient text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <span>Post Activity</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ActivityForm