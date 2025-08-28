'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Check, X, Phone } from 'lucide-react'
import { getFriendRequests, sendFriendRequest, respondToFriendRequest, FriendRequest } from '@/lib/api/friends'
import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'

interface FriendsManagerProps {
  onFriendAdded?: () => void
}

const FriendsManager = ({ onFriendAdded }: FriendsManagerProps) => {
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([])
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    loadFriendRequests()
  }, [])

  const loadFriendRequests = async () => {
    try {
      setIsLoading(true)
      const [received, sent] = await Promise.all([
        getFriendRequests('received'),
        getFriendRequests('sent')
      ])
      setPendingRequests(received.filter(req => req.status === 'pending'))
      setSentRequests(sent.filter(req => req.status === 'pending'))
    } catch (err) {
      console.error('Failed to load friend requests:', err)
      setError('Failed to load friend requests')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber.trim()) return

    try {
      setIsSubmitting(true)
      setError(null)
      await sendFriendRequest(phoneNumber.trim())
      setSuccessMessage('Friend request sent!')
      setPhoneNumber('')
      setShowAddFriend(false)
      await loadFriendRequests()
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send friend request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRespondToRequest = async (requestId: string, response: 'accepted' | 'blocked') => {
    try {
      setError(null)
      await respondToFriendRequest(requestId, response)
      setPendingRequests(pendingRequests.filter(req => req.id !== requestId))
      if (response === 'accepted') {
        setSuccessMessage('Friend request accepted!')
        onFriendAdded?.()
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to respond to friend request')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Add Friend Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Friend Requests</h3>
        <button
          onClick={() => setShowAddFriend(!showAddFriend)}
          className="flex items-center space-x-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Friend</span>
        </button>
      </div>

      {/* Add Friend Form */}
      {showAddFriend && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <form onSubmit={handleSendRequest} className="space-y-3">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <LoadingSpinner size="sm" /> : <UserPlus className="w-4 h-4" />}
                <span>Send Request</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddFriend(false)}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pending Friend Requests */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3">
          Received ({pendingRequests.length})
        </h4>
        {pendingRequests.length > 0 ? (
          <div className="space-y-2">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between bg-white p-4 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">
                      {request.sender.name ? request.sender.name[0].toUpperCase() : '👤'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {request.sender.name || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-500">{request.sender.phone}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRespondToRequest(request.id, 'accepted')}
                    className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleRespondToRequest(request.id, 'blocked')}
                    className="flex items-center space-x-1 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <EmptyState
              icon={<span className="text-gray-400">👥</span>}
              title="No pending requests"
              description="You're all caught up!"
              compact
            />
          </div>
        )}
      </div>

      {/* Sent Friend Requests */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3">
          Sent ({sentRequests.length})
        </h4>
        {sentRequests.length > 0 ? (
          <div className="space-y-2">
            {sentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold">
                      {request.receiver?.name ? request.receiver.name[0].toUpperCase() : '👤'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {request.receiver?.name || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-500">{request.receiver?.phone}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Pending...
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <EmptyState
              icon={<span className="text-gray-400">📤</span>}
              title="No pending sent requests"
              description="Add friends by their phone number"
              compact
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default FriendsManager