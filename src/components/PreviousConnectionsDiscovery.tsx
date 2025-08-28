'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Users } from 'lucide-react'
import { getPreviousConnections, PreviousConnection } from '@/lib/api/discover'
import { sendFriendRequest } from '@/lib/api/friends'
import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'

interface PreviousConnectionsDiscoveryProps {
  onFriendRequestSent?: () => void
}

const PreviousConnectionsDiscovery = ({ onFriendRequestSent }: PreviousConnectionsDiscoveryProps) => {
  const [connections, setConnections] = useState<PreviousConnection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sendingRequestTo, setSendingRequestTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    loadPreviousConnections()
  }, [])

  const loadPreviousConnections = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getPreviousConnections()
      setConnections(data)
    } catch (err) {
      console.error('Failed to load previous connections:', err)
      setError('Failed to load previous connections')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendFriendRequest = async (connection: PreviousConnection) => {
    if (!connection.phone) return

    try {
      setSendingRequestTo(connection.id)
      setError(null)
      
      await sendFriendRequest(connection.phone)
      
      // Remove from connections list since request is now sent
      setConnections(prev => prev.filter(c => c.id !== connection.id))
      
      setSuccessMessage(`Friend request sent to ${connection.name || 'Unknown User'}!`)
      setTimeout(() => setSuccessMessage(null), 3000)
      
      onFriendRequestSent?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send friend request')
    } finally {
      setSendingRequestTo(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (connections.length === 0) {
    return (
      <div className="text-center py-8">
        <EmptyState
          icon={<Users className="w-12 h-12 text-gray-400" />}
          title="No previous connections found"
          description="When you participate in activities with other users, they'll appear here as potential friends to connect with!"
          compact
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
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

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">People You've Hung Out With</h3>
        <span className="text-sm text-gray-500">
          {connections.length} {connections.length === 1 ? 'person' : 'people'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {connections.map((connection) => (
          <div key={connection.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-lg">
                    {connection.name ? connection.name[0].toUpperCase() : '👤'}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">
                    {connection.name || 'Unknown User'}
                  </h4>
                  <p className="text-sm text-gray-500">{connection.phone}</p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-xs text-purple-600">Previous hangout</span>
                    </div>
                    {connection.mutualFriendCount !== undefined && connection.mutualFriendCount > 0 && (
                      <span className="text-xs text-indigo-600">
                        {connection.mutualFriendCount} mutual
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleSendFriendRequest(connection)}
                disabled={sendingRequestTo === connection.id}
                className="flex items-center space-x-1 bg-indigo-500 text-white px-3 py-2 rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
              >
                {sendingRequestTo === connection.id ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                <span className="text-sm">Add</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={loadPreviousConnections}
          disabled={isLoading}
          className="text-sm text-indigo-600 hover:text-indigo-800 underline"
        >
          Refresh
        </button>
      </div>
    </div>
  )
}

export default PreviousConnectionsDiscovery