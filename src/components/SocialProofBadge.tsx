'use client'

import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import { getFriends, FriendRequest } from '@/lib/api/friends'
import { ActivityWithDetails } from '@/lib/api/activities'

interface SocialProofBadgeProps {
  activity: ActivityWithDetails
  currentUserId?: string
  onClick?: () => void
}

const SocialProofBadge = ({ activity, currentUserId, onClick }: SocialProofBadgeProps) => {
  const [friends, setFriends] = useState<FriendRequest[]>([])
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

  if (isLoading) return null

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

  // Get friend participants
  const friendParticipants = activity.responses.filter(r => 
    friendsMap.has(r.user.id) && r.response === 'in'
  )

  const friendsMaybe = activity.responses.filter(r => 
    friendsMap.has(r.user.id) && r.response === 'maybe'
  )

  const totalFriendParticipants = friendParticipants.length + friendsMaybe.length

  // Check if creator is a friend
  const creatorIsFriend = friendsMap.has(activity.creator.id)
  const totalFriendsInvolved = totalFriendParticipants + (creatorIsFriend ? 1 : 0)

  if (totalFriendsInvolved === 0) return null

  const getProofText = () => {
    if (creatorIsFriend && totalFriendParticipants === 0) {
      return `${activity.creator.name || 'Your friend'} created this`
    }
    
    if (totalFriendParticipants === 1) {
      const participant = friendParticipants[0] || friendsMaybe[0]
      const status = friendParticipants.length > 0 ? 'is going' : 'might go'
      return `${participant.user.name || 'A friend'} ${status}`
    }
    
    if (totalFriendParticipants > 1) {
      const goingCount = friendParticipants.length
      const maybeCount = friendsMaybe.length
      
      if (goingCount > 0 && maybeCount === 0) {
        return `${goingCount} friends are going`
      } else if (goingCount === 0 && maybeCount > 0) {
        return `${maybeCount} friends might go`
      } else {
        return `${totalFriendParticipants} friends interested`
      }
    }
    
    return 'Friends involved'
  }

  const getAvatarStack = () => {
    const allFriendParticipants = [...friendParticipants, ...friendsMaybe]
    const displayParticipants = allFriendParticipants.slice(0, 3)
    
    return (
      <div className="flex -space-x-1">
        {displayParticipants.map((participant) => (
          <div 
            key={participant.user.id}
            className="w-5 h-5 bg-indigo-200 rounded-full flex items-center justify-center text-xs text-indigo-700 ring-1 ring-white"
            title={participant.user.name || 'Unknown'}
          >
            {participant.user.name ? participant.user.name[0].toUpperCase() : '👤'}
          </div>
        ))}
        {allFriendParticipants.length > 3 && (
          <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center text-xs text-indigo-700 ring-1 ring-white">
            +{allFriendParticipants.length - 3}
          </div>
        )}
      </div>
    )
  }

  return (
    <div 
      className={`flex items-center space-x-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg ${
        onClick ? 'cursor-pointer hover:bg-indigo-100 transition-colors' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-1">
        <Users className="w-4 h-4 text-indigo-600" />
        {getAvatarStack()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-indigo-800 truncate">
          {getProofText()}
        </p>
        {totalFriendParticipants > 1 && (
          <p className="text-xs text-indigo-600">
            Click to see who
          </p>
        )}
      </div>
    </div>
  )
}

export default SocialProofBadge