'use client'

import { User } from '@/types/activity'

interface Friend extends User {
  availability: string
  nextActivity?: {
    title: string
    time: string
    location: string
  } | null
}

interface DiscoverFriend extends User {
  lastActivity: string
  mutualFriends: number
}

interface FriendCardProps {
  friend: Friend
  type?: 'friend'
}

interface DiscoverFriendCardProps {
  friend: DiscoverFriend
  type: 'discover'
  onAddFriend?: (friend: DiscoverFriend) => void
}

type CombinedFriendCardProps = FriendCardProps | DiscoverFriendCardProps

const FriendCard = (props: CombinedFriendCardProps) => {
  if (props.type === 'discover') {
    const { friend, onAddFriend } = props as DiscoverFriendCardProps
    
    return (
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 glass-card hover-scale p-4 sm:p-5 hover:shadow-2xl hover:shadow-indigo-500/10">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-slate-200 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
            {friend.avatar || '👤'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{friend.name}</h4>
            
            <div className="space-y-1 mt-2">
              <div className="text-xs text-slate-600">
                Last activity: {friend.lastActivity}
              </div>
              <div className="text-xs text-gray-500">
                {friend.mutualFriends} mutual friend{friend.mutualFriends > 1 ? 's' : ''}
              </div>
            </div>
            
            <button
              onClick={() => onAddFriend?.(friend)}
              className="mt-3 w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add to Friends
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Regular friend card
  const { friend } = props as FriendCardProps
  
  return (
    <div className="glass-card hover-scale p-4 sm:p-5 hover:shadow-2xl hover:shadow-indigo-500/10">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-200 to-cyan-200 rounded-full flex items-center justify-center text-base sm:text-lg flex-shrink-0">
          {friend.avatar || '👤'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{friend.name}</h3>
          
          <div className="space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
              <span className="text-sm text-green-700 font-medium">{friend.availability}</span>
            </div>
            
            {friend.nextActivity && (
              <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-xl p-4 border border-indigo-100">
                <div className="text-xs text-indigo-600 font-medium mb-1">Next up:</div>
                <div className="text-sm font-semibold text-indigo-800">{friend.nextActivity.title}</div>
                <div className="text-xs text-indigo-600 mt-1">
                  {friend.nextActivity.time} • {friend.nextActivity.location}
                </div>
              </div>
            )}
            
            {!friend.nextActivity && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="text-xs text-gray-500 italic">No upcoming activities</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FriendCard