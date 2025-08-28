'use client'

import { useState, useEffect } from 'react'
import { Users, ChevronDown, ChevronUp } from 'lucide-react'
import { getFriends, FriendRequest } from '@/lib/api/friends'
import { ActivityWithDetails } from '@/lib/api/activities'

interface FriendParticipantsProps {
  activity: ActivityWithDetails
  currentUserId?: string
  compact?: boolean
}

const FriendParticipants = ({ activity, currentUserId, compact = false }: FriendParticipantsProps) => {
  const [friends, setFriends] = useState<FriendRequest[]>([])
  const [showAll, setShowAll] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFriends()
  }, [])

  const loadFriends = async () => {
    try {
      const friendsList = await getFriends()
      setFriends(friendsList)
    } catch (err) {
      console.error('Failed to load friends:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Create a map of user ID to friend info
  const friendsMap = new Map()
  friends.forEach(friendRequest => {
    const friend = friendRequest.sender.id === currentUserId 
      ? friendRequest.receiver 
      : friendRequest.sender
    if (friend) {
      friendsMap.set(friend.id, friend)
    }
  })

  // Get participants who responded "in"
  const participantsIn = activity.responses.filter(r => r.response === 'in')
  const participantsMaybe = activity.responses.filter(r => r.response === 'maybe')

  // Separate friends from non-friends
  const friendsIn = participantsIn.filter(p => friendsMap.has(p.user.id))
  const friendsMaybe = participantsMaybe.filter(p => friendsMap.has(p.user.id))
  const othersIn = participantsIn.filter(p => !friendsMap.has(p.user.id))
  const othersMaybe = participantsMaybe.filter(p => !friendsMap.has(p.user.id))

  // Check if current user is creator or participant
  const isCreator = activity.creator.id === currentUserId
  const userResponse = activity.responses.find(r => r.user.id === currentUserId)

  const totalParticipants = participantsIn.length + participantsMaybe.length + (isCreator ? 1 : 0)
  const totalFriends = friendsIn.length + friendsMaybe.length + (isCreator && friendsMap.has(currentUserId || '') ? 1 : 0)

  if (isLoading) {
    return (
      <div className="flex items-center text-sm text-gray-500">
        <Users className="w-4 h-4 mr-1" />
        <span>Loading participants...</span>
      </div>
    )
  }

  if (totalParticipants === 0) {
    return (
      <div className="flex items-center text-sm text-gray-500">
        <Users className="w-4 h-4 mr-1" />
        <span>No participants yet</span>
      </div>
    )
  }

  const renderParticipant = (participant: any, status: 'in' | 'maybe' | 'creator') => {
    const isFriend = friendsMap.has(participant.id)
    const isCurrentUser = participant.id === currentUserId
    const name = isCurrentUser ? 'You' : participant.name || 'Unknown'
    
    const statusColor = status === 'in' ? 'text-green-700 bg-green-100' 
      : status === 'maybe' ? 'text-yellow-700 bg-yellow-100'
      : 'text-blue-700 bg-blue-100'

    return (
      <div 
        key={`${participant.id}-${status}`}
        className={`flex items-center space-x-2 px-2 py-1 rounded-lg text-xs ${statusColor} ${
          isFriend ? 'ring-1 ring-indigo-200' : ''
        }`}
      >
        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
          isFriend ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-200 text-gray-600'
        }`}>
          {participant.name ? participant.name[0].toUpperCase() : '👤'}
        </div>
        <span className={isFriend ? 'font-medium' : ''}>{name}</span>
        {isFriend && !isCurrentUser && (
          <span className="text-indigo-600">👥</span>
        )}
      </div>
    )
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-1" />
          <span>{totalParticipants} participant{totalParticipants !== 1 ? 's' : ''}</span>
        </div>
        
        {totalFriends > 0 && (
          <div className="flex items-center text-sm text-indigo-600">
            <span className="mr-1">👥</span>
            <span className="font-medium">{totalFriends} friend{totalFriends !== 1 ? 's' : ''}</span>
          </div>
        )}
        
        {friendsIn.length > 0 && (
          <div className="flex -space-x-1">
            {friendsIn.slice(0, 3).map((participant) => (
              <div 
                key={participant.user.id}
                className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs text-green-700 ring-1 ring-white"
                title={participant.user.name || 'Unknown'}
              >
                {participant.user.name ? participant.user.name[0].toUpperCase() : '👤'}
              </div>
            ))}
            {friendsIn.length > 3 && (
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs text-indigo-700 ring-1 ring-white">
                +{friendsIn.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const displayLimit = showAll ? undefined : 5

  return (
    <div className="space-y-3">
      {/* Friends going */}
      {friendsIn.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
            👥 Friends Going ({friendsIn.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {(displayLimit ? friendsIn.slice(0, displayLimit) : friendsIn).map(participant => 
              renderParticipant(participant.user, 'in')
            )}
          </div>
        </div>
      )}

      {/* Friends maybe */}
      {friendsMaybe.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-yellow-700 mb-2 flex items-center">
            👥 Friends Maybe ({friendsMaybe.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {(displayLimit ? friendsMaybe.slice(0, displayLimit) : friendsMaybe).map(participant => 
              renderParticipant(participant.user, 'maybe')
            )}
          </div>
        </div>
      )}

      {/* Others going */}
      {othersIn.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-green-700 mb-2">
            Others Going ({othersIn.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {(displayLimit ? othersIn.slice(0, displayLimit) : othersIn).map(participant => 
              renderParticipant(participant.user, 'in')
            )}
          </div>
        </div>
      )}

      {/* Others maybe */}
      {othersMaybe.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-yellow-700 mb-2">
            Others Maybe ({othersMaybe.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {(displayLimit ? othersMaybe.slice(0, displayLimit) : othersMaybe).map(participant => 
              renderParticipant(participant.user, 'maybe')
            )}
          </div>
        </div>
      )}

      {/* Show more/less button */}
      {totalParticipants > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          {showAll ? (
            <>
              Show Less <ChevronUp className="w-3 h-3 ml-1" />
            </>
          ) : (
            <>
              Show All {totalParticipants} <ChevronDown className="w-3 h-3 ml-1" />
            </>
          )}
        </button>
      )}

      {/* Social proof message */}
      {friendsIn.length > 0 && (
        <div className="text-xs text-indigo-600 bg-indigo-50 p-2 rounded-lg">
          {friendsIn.length === 1 
            ? `${friendsIn[0].user.name || 'A friend'} is going to this activity!`
            : `${friendsIn.length} of your friends are going to this activity!`
          }
        </div>
      )}
    </div>
  )
}

export default FriendParticipants