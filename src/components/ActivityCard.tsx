'use client'

import { useState } from 'react'
import { Clock, MapPin, Users, Heart, AlertCircle, Zap, ChevronDown, ChevronUp, Shield, Eye, Globe, Share2, ExternalLink } from 'lucide-react'
import { Activity, ActivityResponse } from '@/types/activity'
import { ActivityWithDetails } from '@/lib/api/activities'
import { analyzeActivityTiming } from '@/lib/utils/activityUtils'
import SocialProofBadge from './SocialProofBadge'
import FriendParticipants from './FriendParticipants'

interface ActivityCardProps {
  activity: Activity | ActivityWithDetails
  currentUserId?: string
  onJoinInterest?: (activityId: string | number, response: ActivityResponse) => void
  isResponding?: boolean
  onShare?: (activityId: string | number) => void
  showSocialProof?: boolean
}

const ActivityCard = ({ activity, currentUserId, onJoinInterest, isResponding = false, onShare, showSocialProof = true }: ActivityCardProps) => {
  const [showParticipants, setShowParticipants] = useState(false)
  const isCompleted = activity.type === 'completed'
  const timeInfo = analyzeActivityTiming(activity)
  const isImmediate = timeInfo.isImmediate && !timeInfo.isPast
  
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
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'planned':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'completed':
        return 'bg-gray-100 text-gray-600 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spontaneous':
        return <Zap className="w-3 h-3" />
      case 'planned':
        return <Clock className="w-3 h-3" />
      default:
        return null
    }
  }

  const userResponse = activity.joinRequests[parseInt(currentUserId?.toString()) || 0]

  const getVisibilityInfo = (visibility: string) => {
    switch (visibility) {
      case 'friends':
        return {
          icon: Shield,
          label: 'Friends Only',
          color: 'bg-blue-100 text-blue-700',
          description: 'Only your friends can see this activity'
        }
      case 'previous':
        return {
          icon: Eye,
          label: 'Previous Hangouts',
          color: 'bg-purple-100 text-purple-700',
          description: 'People you\'ve hung out with before can see this'
        }
      case 'open':
        return {
          icon: Globe,
          label: 'Open to All',
          color: 'bg-green-100 text-green-700',
          description: 'Anyone in your area can see and join this activity'
        }
      default:
        return {
          icon: Shield,
          label: 'Private',
          color: 'bg-gray-100 text-gray-700',
          description: 'Visibility setting unknown'
        }
    }
  }

  const visibilityInfo = getVisibilityInfo(activity.visibility)

  const handleShare = () => {
    const activityId = typeof activity.id === 'number' ? activity.id.toString() : activity.id
    onShare?.(activityId)
  }

  const handleViewDetail = () => {
    const activityId = typeof activity.id === 'number' ? activity.id.toString() : activity.id
    window.open(`/activity/${activityId}`, '_blank')
  }

  return (
    <div className={`glass-card hover-scale p-6 hover:shadow-2xl ${
      isImmediate 
        ? 'border-orange-200/80 bg-gradient-to-r from-orange-50/80 to-white/70 hover:shadow-orange-500/20'
        : isCompleted 
          ? 'bg-gray-50/70 backdrop-blur-sm border-gray-200/60 hover:shadow-indigo-500/5' 
          : 'bg-white/70 backdrop-blur-sm border-slate-200/60 hover:shadow-indigo-500/10'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isImmediate && (
            <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white animate-pulse mb-2 w-fit">
              <Zap className="w-3 h-3" />
              <span>HAPPENING SOON</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2 mb-2 flex-wrap">
            <h3 className={`font-bold text-lg ${isCompleted ? 'text-gray-600' : 'text-gray-800'}`}>
              {activity.title}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getTypeColor(activity.type)}`}>
              {getTypeIcon(activity.type)}
              <span>{activity.type}</span>
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVibeColor(activity.vibe)}`}>
              {activity.vibe}
            </span>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${visibilityInfo.color}`} title={visibilityInfo.description}>
              <visibilityInfo.icon className="w-3 h-3" />
              <span>{visibilityInfo.label}</span>
            </div>
          </div>
          
          <p className={`mb-3 ${isCompleted ? 'text-gray-500' : 'text-gray-600'}`}>
            {activity.description}
          </p>
          
          {/* Social Proof Badge */}
          {showSocialProof && 'responses' in activity && (
            <div className="mb-3">
              <SocialProofBadge 
                activity={activity as ActivityWithDetails} 
                currentUserId={currentUserId}
                onClick={() => setShowParticipants(!showParticipants)}
              />
            </div>
          )}
          
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
          
          {/* Response Summary */}
          <div className="flex flex-wrap gap-2 mb-3">
            {activity.interested.length > 0 && (
              <div className={`flex items-center text-sm px-2 py-1 rounded-full ${
                isCompleted 
                  ? 'text-gray-500 bg-gray-100' 
                  : 'text-green-700 bg-green-100'
              }`}>
                <Heart className="w-4 h-4 mr-1" />
                <span className="font-medium">{activity.interested.length}</span>
                <span className="ml-1">{isCompleted ? 'went' : "I'm in!"}</span>
              </div>
            )}
            {Object.values(activity.joinRequests).filter(r => r === 'maybe').length > 0 && (
              <div className={`flex items-center text-sm px-2 py-1 rounded-full ${
                isCompleted 
                  ? 'text-gray-500 bg-gray-100' 
                  : 'text-yellow-700 bg-yellow-100'
              }`}>
                <AlertCircle className="w-4 h-4 mr-1" />
                <span className="font-medium">{Object.values(activity.joinRequests).filter(r => r === 'maybe').length}</span>
                <span className="ml-1">maybe</span>
              </div>
            )}
            {(activity.interested.length > 0 || Object.values(activity.joinRequests).filter(r => r === 'maybe').length > 0) && (
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center transition-colors"
              >
                <Users className="w-3 h-3 mr-1" />
                {activity.interested.length + Object.values(activity.joinRequests).filter(r => r === 'maybe').length} responses
                {showParticipants ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
              </button>
            )}
          </div>
          
          {/* Enhanced Participant List with Friend Highlighting */}
          {showParticipants && 'responses' in activity && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <FriendParticipants 
                activity={activity as ActivityWithDetails} 
                currentUserId={currentUserId}
                compact={false}
              />
            </div>
          )}
          
          {/* Legacy participant list for old activity format */}
          {showParticipants && !('responses' in activity) && (activity.interested.length > 0 || Object.values(activity.joinRequests).filter(r => r === 'maybe').length > 0) && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="space-y-2">
                {activity.interested.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-1">Going ({activity.interested.length})</h4>
                    <div className="flex flex-wrap gap-1">
                      {activity.interested.map((userId) => (
                        <div key={userId} className="flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                          <div className="w-4 h-4 bg-green-200 rounded-full flex items-center justify-center">
                            👤
                          </div>
                          <span>
                            {userId === (parseInt(currentUserId?.toString()) || 0).toString() ? 'You' : `User ${userId}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {Object.values(activity.joinRequests).filter(r => r === 'maybe').length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-yellow-700 mb-1">
                      Maybe ({Object.values(activity.joinRequests).filter(r => r === 'maybe').length})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(activity.joinRequests)
                        .filter(([_, response]) => response === 'maybe')
                        .map(([userId]) => (
                        <div key={userId} className="flex items-center space-x-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs">
                          <div className="w-4 h-4 bg-yellow-200 rounded-full flex items-center justify-center">
                            👤
                          </div>
                          <span>
                            {parseInt(userId) === (parseInt(currentUserId?.toString()) || 0) ? 'You' : `User ${userId}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-2">
          {/* Share and View Detail buttons */}
          <div className="flex items-center space-x-2 mb-2">
            <button
              onClick={handleViewDetail}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
              title="View full details"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Details</span>
            </button>
            
            {onShare && (
              <button
                onClick={handleShare}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                title="Share this activity"
              >
                <Share2 className="w-3 h-3" />
                <span>Share</span>
              </button>
            )}
          </div>
          
          {!isCompleted ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
              <button
                onClick={() => onJoinInterest?.(activity.id, 'interested')}
                disabled={isResponding}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  userResponse === 'interested' 
                    ? 'bg-green-500 text-white shadow-md hover:bg-green-600' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200 hover:scale-105'
                } ${isResponding ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isResponding ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                ) : (
                  <Heart className={`w-4 h-4 ${userResponse === 'interested' ? 'fill-current' : ''}`} />
                )}
                <span className="font-medium">
                  {userResponse === 'interested' ? "You're in!" : "I'm in!"}
                </span>
              </button>
              
              <button
                onClick={() => onJoinInterest?.(activity.id, 'maybe')}
                disabled={isResponding}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  userResponse === 'maybe' 
                    ? 'bg-yellow-500 text-white shadow-md hover:bg-yellow-600' 
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 hover:scale-105'
                } ${isResponding ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isResponding ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                ) : (
                  <AlertCircle className={`w-4 h-4 ${userResponse === 'maybe' ? 'fill-current' : ''}`} />
                )}
                <span className="font-medium">
                  {userResponse === 'maybe' ? 'Maybe going' : 'Maybe'}
                </span>
              </button>
              </div>
              
              {userResponse && !isResponding && (
                <button
                  onClick={() => onJoinInterest?.(activity.id, userResponse)}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors self-start"
                >
                  Click again to remove response
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center px-3 py-2 rounded-lg bg-gray-100 text-gray-600">
              <span className="font-medium">
                {userResponse === 'interested' ? '✅ You went' : '📝 Completed'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ActivityCard