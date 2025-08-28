'use client'

import { useState, useEffect } from 'react'
import { Users, X } from 'lucide-react'
import { getMutualFriends, MutualFriend } from '@/lib/api/friends'
import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'

interface MutualFriendsProps {
  userId: string
  userName?: string
  isOpen: boolean
  onClose: () => void
}

const MutualFriends = ({ userId, userName, isOpen, onClose }: MutualFriendsProps) => {
  const [mutualFriends, setMutualFriends] = useState<MutualFriend[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadMutualFriends()
    }
  }, [isOpen, userId])

  const loadMutualFriends = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getMutualFriends(userId)
      setMutualFriends(data.mutualFriends)
    } catch (err) {
      console.error('Failed to load mutual friends:', err)
      setError(err instanceof Error ? err.message : 'Failed to load mutual friends')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Mutual Friends {userName && `with ${userName}`}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-80">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          ) : mutualFriends.length > 0 ? (
            <div className="space-y-3">
              {mutualFriends.map((friend) => (
                <div key={friend.id} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-600 font-semibold">
                      {friend.name ? friend.name[0].toUpperCase() : '👤'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {friend.name || 'Unknown User'}
                    </p>
                    {friend.phone && (
                      <p className="text-sm text-gray-500 truncate">{friend.phone}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <EmptyState
                icon={<Users className="w-8 h-8 text-gray-400" />}
                title="No mutual friends"
                description="You don't have any mutual friends with this person yet."
                compact
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {mutualFriends.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600 text-center">
              {mutualFriends.length} mutual {mutualFriends.length === 1 ? 'friend' : 'friends'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MutualFriends