'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { CreateActivitySchema, CreateActivityInput } from '@/lib/database/schema'
import LoadingSpinner from './LoadingSpinner'
import { z } from 'zod'

// Client-side form schema with string inputs
const ClientActivitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  category: z.enum(['spontaneous', 'planned']).default('spontaneous'),
  visibility: z.enum(['friends', 'previous', 'open']).default('friends'),
  maxParticipants: z.string().optional(),
  timeframe: z.string().min(1, 'Please specify when this activity will happen')
})

type ClientActivityInput = z.infer<typeof ClientActivitySchema>

interface ActivityFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: CreateActivityInput & { timeframe: string }) => void | Promise<void>
  initialData?: Partial<ClientActivityInput>
  isLoading?: boolean
}

const ActivityForm = ({ isOpen, onClose, onSubmit, initialData, isLoading = false }: ActivityFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ClientActivityInput>({
    resolver: zodResolver(ClientActivitySchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      timeframe: initialData?.timeframe || '',
      location: initialData?.location || '',
      visibility: initialData?.visibility || 'friends',
      category: initialData?.category || 'spontaneous',
      date: initialData?.date || '',
      time: initialData?.time || '',
      maxParticipants: initialData?.maxParticipants || '',
    }
  })

  const handleFormSubmit = async (data: ClientActivityInput) => {
    try {
      // Transform the form data to match the API schema
      const apiData: CreateActivityInput & { timeframe: string } = {
        title: data.title,
        description: data.description || undefined,
        location: data.location || undefined,
        date: data.date ? new Date(data.date) : undefined,
        time: data.time || undefined,
        category: data.category || 'spontaneous',
        visibility: data.visibility || 'friends',
        maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants, 10) : undefined,
        timeframe: data.timeframe,
      }
      
      await onSubmit(apiData)
      reset()
      onClose()
    } catch (error) {
      // Error is handled by the parent component
      console.error('Form submission error:', error)
    }
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
          
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What's the plan? *
              </label>
              <input
                type="text"
                {...register('title')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Coffee run, hiking, trying new restaurant..."
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Details
              </label>
              <textarea
                {...register('description')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={3}
                placeholder="Any extra details or context..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                When? *
              </label>
              <input
                type="text"
                {...register('timeframe')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.timeframe ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Right now, in 30 mins, tomorrow evening..."
              />
              {errors.timeframe && (
                <p className="text-red-500 text-sm mt-1">{errors.timeframe.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  {...register('date')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  {...register('time')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.time ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.time && (
                  <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Where?
              </label>
              <input
                type="text"
                {...register('location')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Location or meeting spot"
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Who can join?
                </label>
                <select
                  {...register('visibility')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.visibility ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="friends">Friends Only</option>
                  <option value="previous">Previous Hangout People</option>
                  <option value="open">Open to All</option>
                </select>
                {errors.visibility && (
                  <p className="text-red-500 text-sm mt-1">{errors.visibility.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  {...register('category')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="spontaneous">Spontaneous</option>
                  <option value="planned">Planned</option>
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Participants
              </label>
              <input
                type="number"
                min="1"
                {...register('maxParticipants')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.maxParticipants ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Optional - leave empty for unlimited"
              />
              {errors.maxParticipants && (
                <p className="text-red-500 text-sm mt-1">{errors.maxParticipants.message}</p>
              )}
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  reset()
                  onClose()
                }}
                disabled={isLoading || isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="flex-1 px-4 py-2 button-gradient text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {(isLoading || isSubmitting) ? (
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