'use client'

import { useState } from 'react'
import { Wifi, WifiOff, AlertCircle, MessageSquare, X } from 'lucide-react'
import { createStatusUpdate } from '@/lib/api/status'
import LoadingSpinner from './LoadingSpinner'

interface StatusUpdateFormProps {
  currentStatus?: string
  isOpen: boolean
  onClose: () => void
  onStatusUpdated: (status: string, message?: string) => void
}

const StatusUpdateForm = ({ currentStatus = 'available', isOpen, onClose, onStatusUpdated }: StatusUpdateFormProps) => {
  const [selectedStatus, setSelectedStatus] = useState<'available' | 'busy' | 'invisible'>(currentStatus as any)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const statusOptions = [
    {
      value: 'available' as const,
      label: 'Available',
      icon: <Wifi className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: "I'm free and looking for things to do",
    },
    {
      value: 'busy' as const,
      label: 'Busy',
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: "I'm busy but might be free later",
    },
    {
      value: 'invisible' as const,
      label: 'Invisible',
      icon: <WifiOff className="w-5 h-5" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      description: "Don't show my activity to others",
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      setError(null)
      
      await createStatusUpdate(selectedStatus, message || undefined)
      
      onStatusUpdated(selectedStatus, message || undefined)
      onClose()
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Update Status</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Status Options */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Availability Status
            </label>
            {statusOptions.map((option) => (
              <div
                key={option.value}
                className={`relative rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                  selectedStatus === option.value
                    ? `${option.borderColor} ${option.bgColor}`
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
                onClick={() => setSelectedStatus(option.value)}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={selectedStatus === option.value}
                    onChange={() => setSelectedStatus(option.value)}
                    className="sr-only"
                  />
                  <div className={option.color}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${selectedStatus === option.value ? option.color : 'text-gray-800'}`}>
                      {option.label}
                    </p>
                    <p className="text-sm text-gray-500">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Status Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Status Message (Optional)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="What are you up to?"
                rows={3}
                maxLength={100}
              />
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">
              {message.length}/100
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Updating...</span>
                </>
              ) : (
                'Update Status'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StatusUpdateForm