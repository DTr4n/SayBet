'use client'

import { Clock, MapPin, Users, Heart, AlertCircle } from 'lucide-react'
import { Activity, ActivityResponse } from '@/types/activity'

interface ActivityCardProps {
  activity: Activity
  currentUserId?: number
  onJoinInterest?: (activityId: number, response: ActivityResponse) => void
}

const ActivityCard = ({ activity, currentUserId = 0, onJoinInterest }: ActivityCardProps) => {
  const isCompleted = activity.type === 'completed'
  
  const getVibeColor = (vibe: string) => {
    switch (vibe) {
      case 'active':
        return 'bg-orange-100 text-orange-700'
      case 'casual':
        return 'bg-green-100 text-green-700'
      case 'social':
        return 'bg-purple-100 text-purple-700'
      case 'chill':
        return 'bg-blue-100 text-blue-700'
      case 'foodie':
        return 'bg-red-100 text-red-700'
      case 'competitive':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'spontaneous':
        return 'bg-red-100 text-red-700'
      case 'planned':
        return 'bg-blue-100 text-blue-700'
      case 'completed':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const userResponse = activity.joinRequests[currentUserId]

  return (
    <div className={`glass-card hover-scale p-6 hover:shadow-2xl hover:shadow-indigo-500/10 ${
      isCompleted 
        ? 'bg-gray-50/70 backdrop-blur-sm border-gray-200/60' 
        : 'bg-white/70 backdrop-blur-sm border-slate-200/60'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className={`font-bold text-lg ${isCompleted ? 'text-gray-600' : 'text-gray-800'}`}>
              {activity.title}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(activity.type)}`}>
              {activity.type}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVibeColor(activity.vibe)}`}>
              {activity.vibe}
            </span>
            {activity.visibility === 'previous' && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                from hangouts
              </span>
            )}
          </div>
          
          <p className={`mb-3 ${isCompleted ? 'text-gray-500' : 'text-gray-600'}`}>
            {activity.description}
          </p>
          
          <div className="space-y-1 mb-4">
            <div className={`flex items-center text-sm ${isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>
              <Clock className="w-4 h-4 mr-2" />
              {activity.timeframe}
            </div>
            <div className={`flex items-center text-sm ${isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>
              <MapPin className="w-4 h-4 mr-2" />
              {activity.location}
            </div>
            <div className={`flex items-center text-sm ${isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>
              <Users className="w-4 h-4 mr-2" />
              Posted by {activity.host.name}
            </div>
          </div>
          
          {activity.interested.length > 0 && (
            <div className={`flex items-center text-sm mb-2 ${
              isCompleted ? 'text-gray-500' : 'text-indigo-600'
            }`}>
              <Heart className="w-4 h-4 mr-1" />
              {activity.interested.length} {isCompleted ? 'went' : 'interested'}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {!isCompleted ? (
            !userResponse || userResponse === 'pending' ? (
              <>
                <button
                  onClick={() => onJoinInterest?.(activity.id, 'interested')}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  <span>I'm in!</span>
                </button>
                <button
                  onClick={() => onJoinInterest?.(activity.id, 'maybe')}
                  className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Maybe</span>
                </button>
              </>
            ) : (
              <div className={`px-3 py-1 rounded-lg font-medium ${
                userResponse === 'interested' ? 'bg-green-100 text-green-700' :
                userResponse === 'maybe' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {userResponse === 'interested' ? "You're in!" : 
                 userResponse === 'maybe' ? 'Maybe going' : 'Not interested'}
              </div>
            )
          ) : (
            <div className="px-3 py-1 rounded-lg font-medium bg-gray-100 text-gray-600">
              {userResponse === 'interested' ? 'You went' : 'Completed'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ActivityCard