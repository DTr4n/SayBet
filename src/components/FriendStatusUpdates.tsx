'use client'

import { useState, useEffect } from 'react'
import { Clock, Users, Wifi, WifiOff, AlertCircle } from 'lucide-react'
import { getFriendsStatusUpdates, getFriendsCurrentStatus, StatusUpdate, FriendStatus } from '@/lib/api/status'
import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'

interface FriendStatusUpdatesProps {
  showRecentUpdates?: boolean
}

const FriendStatusUpdates = ({ showRecentUpdates = true }: FriendStatusUpdatesProps) => {
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([])
  const [currentStatus, setCurrentStatus] = useState<FriendStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'current' | 'recent'>('current')

  useEffect(() => {
    loadFriendStatus()
  }, [])

  const loadFriendStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [current, updates] = await Promise.all([
        getFriendsCurrentStatus(),
        showRecentUpdates ? getFriendsStatusUpdates() : Promise.resolve([])
      ])
      
      setCurrentStatus(current)
      setStatusUpdates(updates)
    } catch (err) {
      console.error('Failed to load friend status:', err)
      setError(err instanceof Error ? err.message : 'Failed to load friend status')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <Wifi className="w-4 h-4 text-green-500" />
      case 'busy':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'invisible':
        return <WifiOff className="w-4 h-4 text-gray-500" />
      default:
        return <Users className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-green-600'
      case 'busy':
        return 'text-red-600'
      case 'invisible':
        return 'text-gray-600'
      default:
        return 'text-gray-400'
    }
  }

  const formatTime = (date: Date | string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return d.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 text-sm">{error}</div>
        <button
          onClick={loadFriendStatus}
          className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Friend Status</h3>
        {showRecentUpdates && (
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveView('current')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeView === 'current'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Current
            </button>
            <button
              onClick={() => setActiveView('recent')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeView === 'recent'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Recent
            </button>
          </div>
        )}
      </div>

      {/* Current Status View */}
      {(!showRecentUpdates || activeView === 'current') && (
        <div className="space-y-3">
          {currentStatus.length > 0 ? (
            currentStatus.map((friend) => (
              <div key={friend.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 font-semibold">
                    {friend.name ? friend.name[0].toUpperCase() : '👤'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-800 truncate">
                      {friend.name || 'Unknown User'}
                    </p>
                    {getStatusIcon(friend.availabilityStatus)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className={`text-sm capitalize ${getStatusColor(friend.availabilityStatus)}`}>
                      {friend.availabilityStatus}
                    </p>
                    {friend.statusMessage && (
                      <>
                        <span className="text-gray-300">•</span>
                        <p className="text-sm text-gray-600 truncate">{friend.statusMessage}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {formatTime(friend.lastUpdated)}
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={<Users className="w-8 h-8 text-gray-400" />}
              title="No friends to show"
              description="Add some friends to see their availability status"
              compact
            />
          )}
        </div>
      )}

      {/* Recent Updates View */}
      {showRecentUpdates && activeView === 'recent' && (
        <div className="space-y-3">
          {statusUpdates.length > 0 ? (
            statusUpdates.map((update) => (
              <div key={update.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 font-semibold text-sm">
                    {update.user.name ? update.user.name[0].toUpperCase() : '👤'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium text-gray-800 text-sm">
                      {update.user.name || 'Unknown User'}
                    </p>
                    {getStatusIcon(update.status)}
                    <p className={`text-sm capitalize ${getStatusColor(update.status)}`}>
                      {update.status}
                    </p>
                  </div>
                  {update.message && (
                    <p className="text-sm text-gray-600">{update.message}</p>
                  )}
                  <div className="flex items-center space-x-1 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {formatTime(update.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={<Clock className="w-8 h-8 text-gray-400" />}
              title="No recent updates"
              description="Your friends haven't updated their status recently"
              compact
            />
          )}
        </div>
      )}

      <div className="text-center">
        <button
          onClick={loadFriendStatus}
          className="text-sm text-indigo-600 hover:text-indigo-800 underline"
        >
          Refresh
        </button>
      </div>
    </div>
  )
}

export default FriendStatusUpdates