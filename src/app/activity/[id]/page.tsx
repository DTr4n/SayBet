'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Activity } from '@/types/activity'
import { Clock, MapPin, Users, Heart, AlertCircle, Share2, ArrowLeft, Globe, Shield, Eye } from 'lucide-react'
import { analyzeActivityTiming, getRelativeTimeDescription } from '@/lib/utils/activityUtils'
import LoadingSpinner from '@/components/LoadingSpinner'

const ActivityDetailPage = () => {
  const params = useParams()
  const router = useRouter()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const activityId = params.id as string

  useEffect(() => {
    if (!activityId) return

    const fetchActivity = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/activities/${activityId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Activity not found')
          } else {
            setError('Failed to load activity')
          }
          return
        }

        const { activity: activityData } = await response.json()
        
        // Transform API response to match expected Activity format
        const transformedActivity = {
          id: activityData.id,
          title: activityData.title,
          description: activityData.description || '',
          timeframe: activityData.time || (activityData.date ? new Date(activityData.date).toLocaleDateString() : 'No time specified'),
          location: activityData.location || '',
          host: {
            id: parseInt(activityData.creator.id) || 0,
            name: activityData.creator.name || 'Unknown',
            avatar: activityData.creator.avatar
          },
          creator: activityData.creator, // Also keep creator for new references
          type: activityData.category === 'spontaneous' ? 'spontaneous' : 'planned',
          interested: [],
          joinRequests: {},
          vibe: 'chill', // Default since API doesn't have vibe
          visibility: activityData.visibility,
          maxParticipants: activityData.maxParticipants
        }
        
        // Transform responses to legacy format
        if (activityData.responses) {
          activityData.responses.forEach(response => {
            const userId = parseInt(response.user.id.slice(-6), 36) || Math.abs(response.user.id.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0))
            if (response.response === 'in') {
              transformedActivity.interested.push(userId)
              transformedActivity.joinRequests[userId] = 'interested'
            } else if (response.response === 'maybe') {
              transformedActivity.joinRequests[userId] = 'maybe'
            }
          })
        }
        
        setActivity(transformedActivity)
      } catch (err) {
        console.error('Error fetching activity:', err)
        setError('Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [activityId])

  const handleShare = async () => {
    if (!activity) return
    
    setIsSharing(true)
    const shareUrl = `${window.location.origin}/activity/${activity.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: activity.title,
          text: `Join me for ${activity.title}! ${activity.description || ''}`,
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled sharing or sharing failed
        console.log('Sharing cancelled or failed:', err)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (err) {
        console.error('Failed to copy to clipboard:', err)
      }
    }
    
    setIsSharing(false)
  }

  const handleJoinInterest = async (response: 'interested' | 'maybe') => {
    if (!activity) return

    try {
      const res = await fetch(`/api/activities/${activity.id}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response }),
      })

      if (!res.ok) {
        throw new Error('Failed to update response')
      }

      const updatedActivity = await res.json()
      setActivity(updatedActivity)
    } catch (error) {
      console.error('Error updating response:', error)
    }
  }

  const getVisibilityInfo = (visibility: string) => {
    switch (visibility) {
      case 'friends':
        return {
          icon: Shield,
          label: 'Friends Only',
          color: 'bg-blue-100 text-blue-700',
          description: 'Only friends can see this activity'
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
          description: 'Anyone can see and join this activity'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            {error || 'Activity Not Found'}
          </h1>
          <p className="text-gray-600 mb-4">
            This activity might have been removed or you don't have permission to view it.
          </p>
          <button
            onClick={() => router.push('/')}
            className="button-gradient text-white px-6 py-2 rounded-lg font-medium hover:scale-105 transition-transform"
          >
            Go to Activities
          </button>
        </div>
      </div>
    )
  }

  const timeInfo = analyzeActivityTiming(activity)
  const isCompleted = activity.type === 'completed'
  const isImmediate = timeInfo.isImmediate && !timeInfo.isPast
  const visibilityInfo = getVisibilityInfo(activity.visibility)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-50"
          >
            {isSharing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            <span>{copySuccess ? 'Copied!' : 'Share'}</span>
          </button>
        </div>

        {/* Main Activity Card */}
        <div className={`glass-card p-6 mb-6 ${
          isImmediate 
            ? 'border-orange-200/80 bg-gradient-to-r from-orange-50/80 to-white/70'
            : isCompleted 
              ? 'bg-gray-50/70 backdrop-blur-sm border-gray-200/60' 
              : 'bg-white/70 backdrop-blur-sm border-slate-200/60'
        }`}>
          {isImmediate && (
            <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white animate-pulse mb-4 w-fit">
              <AlertCircle className="w-3 h-3" />
              <span>HAPPENING SOON</span>
            </div>
          )}

          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className={`text-2xl font-bold mb-2 ${isCompleted ? 'text-gray-600' : 'text-gray-800'}`}>
                {activity.title}
              </h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activity.type === 'spontaneous' 
                    ? 'bg-orange-100 text-orange-700 border-orange-200' 
                    : 'bg-blue-100 text-blue-700 border-blue-200'
                }`}>
                  {activity.type}
                </span>
                
                {activity.vibe && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                    {activity.vibe}
                  </span>
                )}
                
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${visibilityInfo.color}`} title={visibilityInfo.description}>
                  <visibilityInfo.icon className="w-4 h-4" />
                  <span>{visibilityInfo.label}</span>
                </div>
              </div>
            </div>
          </div>

          {activity.description && (
            <p className={`text-lg mb-6 ${isCompleted ? 'text-gray-500' : 'text-gray-700'}`}>
              {activity.description}
            </p>
          )}

          {/* Enhanced Activity Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">When & Where</h3>
              
              <div className={`flex items-start text-lg ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                <Clock className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div>{activity.timeframe}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {getRelativeTimeDescription(activity)}
                  </div>
                  {timeInfo.isImmediate && !timeInfo.isPast && (
                    <div className="text-xs text-orange-600 font-medium mt-1">
                      🔥 Happening very soon!
                    </div>
                  )}
                </div>
              </div>
              
              {activity.location && (
                <div className={`flex items-start text-lg ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                  <MapPin className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div>{activity.location}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Meeting location
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Activity Info</h3>
              
              <div className={`flex items-start text-lg ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                <Users className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div>Hosted by {activity.creator.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Activity organizer
                  </div>
                </div>
              </div>
              
              {activity.maxParticipants && (
                <div className={`flex items-start text-lg ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                  <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div>Max {activity.maxParticipants} people</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Participant limit
                    </div>
                  </div>
                </div>
              )}
              
              <div className={`flex items-start text-lg ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center">
                  <visibilityInfo.icon className="w-4 h-4" />
                </div>
                <div>
                  <div>{visibilityInfo.label}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {visibilityInfo.description}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Response Summary */}
          <div className="flex flex-wrap gap-3 mb-6">
            {activity.interested.length > 0 && (
              <div className={`flex items-center text-lg px-4 py-2 rounded-lg ${
                isCompleted 
                  ? 'text-gray-500 bg-gray-100' 
                  : 'text-green-700 bg-green-100'
              }`}>
                <Heart className="w-5 h-5 mr-2" />
                <span className="font-medium">{activity.interested.length}</span>
                <span className="ml-2">{isCompleted ? 'went' : 'going'}</span>
              </div>
            )}
            
            {Object.values(activity.joinRequests).filter(r => r === 'maybe').length > 0 && (
              <div className={`flex items-center text-lg px-4 py-2 rounded-lg ${
                isCompleted 
                  ? 'text-gray-500 bg-gray-100' 
                  : 'text-yellow-700 bg-yellow-100'
              }`}>
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">{Object.values(activity.joinRequests).filter(r => r === 'maybe').length}</span>
                <span className="ml-2">maybe</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!isCompleted && (
            <div className="flex space-x-3">
              <button
                onClick={() => handleJoinInterest('interested')}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                <Heart className="w-5 h-5" />
                <span>I'm In!</span>
              </button>
              
              <button
                onClick={() => handleJoinInterest('maybe')}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
              >
                <AlertCircle className="w-5 h-5" />
                <span>Maybe</span>
              </button>
            </div>
          )}
        </div>

        {/* Enhanced Participants List */}
        {(activity.interested.length > 0 || Object.values(activity.joinRequests).filter(r => r === 'maybe').length > 0) && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                Participants ({activity.interested.length + Object.values(activity.joinRequests).filter(r => r === 'maybe').length})
              </h2>
              
              {activity.maxParticipants && (
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    (activity.interested.length + Object.values(activity.joinRequests).filter(r => r === 'maybe').length) >= activity.maxParticipants
                      ? 'bg-red-400' 
                      : 'bg-green-400'
                  }`}></div>
                  <span className="text-sm text-gray-600">
                    {activity.interested.length + Object.values(activity.joinRequests).filter(r => r === 'maybe').length} / {activity.maxParticipants}
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {/* Host Section */}
              <div>
                <h3 className="text-sm font-medium text-indigo-700 mb-2">Host</h3>
                <div className="flex items-center space-x-3 px-3 py-2 bg-indigo-50 rounded-lg">
                  <div className="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center">
                    👤
                  </div>
                  <div className="flex-1">
                    <span className="text-indigo-700 font-medium">{activity.creator.name}</span>
                    <span className="text-xs text-indigo-600 ml-2">(Host)</span>
                  </div>
                </div>
              </div>
              
              {/* Going Section */}
              {activity.interested.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                    <Heart className="w-4 h-4 mr-1" />
                    Going ({activity.interested.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {activity.interested.map((userId) => (
                      <div key={userId} className="flex items-center space-x-3 px-3 py-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                        <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                          👤
                        </div>
                        <div className="flex-1">
                          <span className="text-green-700 font-medium">
                            User {userId}
                          </span>
                          <div className="text-xs text-green-600 mt-0.5">
                            Confirmed attendance
                          </div>
                        </div>
                        <Heart className="w-4 h-4 text-green-500 fill-current" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Maybe Section */}
              {Object.values(activity.joinRequests).filter(r => r === 'maybe').length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-yellow-700 mb-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Maybe ({Object.values(activity.joinRequests).filter(r => r === 'maybe').length})
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(activity.joinRequests)
                      .filter(([_, response]) => response === 'maybe')
                      .map(([userId]) => (
                      <div key={userId} className="flex items-center space-x-3 px-3 py-2 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                        <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
                          👤
                        </div>
                        <div className="flex-1">
                          <span className="text-yellow-700 font-medium">
                            User {userId}
                          </span>
                          <div className="text-xs text-yellow-600 mt-0.5">
                            Might be available
                          </div>
                        </div>
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Activity Statistics */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-green-600">{activity.interested.length}</div>
                    <div className="text-xs text-gray-500">Confirmed</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-yellow-600">
                      {Object.values(activity.joinRequests).filter(r => r === 'maybe').length}
                    </div>
                    <div className="text-xs text-gray-500">Tentative</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-indigo-600">
                      {activity.interested.length + Object.values(activity.joinRequests).filter(r => r === 'maybe').length}
                    </div>
                    <div className="text-xs text-gray-500">Total Interest</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Status & Additional Info */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Activity Details</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {activity.type === 'spontaneous' ? '⚡' : '📅'}
              </div>
              <div className="text-sm font-medium text-blue-700 mt-1">
                {activity.type === 'spontaneous' ? 'Spontaneous' : 'Planned'}
              </div>
              <div className="text-xs text-blue-600 mt-0.5">
                Activity type
              </div>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {activity.vibe === 'active' ? '🏃' : 
                 activity.vibe === 'chill' ? '😌' : 
                 activity.vibe === 'social' ? '🎉' : 
                 activity.vibe === 'foodie' ? '🍽️' : '✨'}
              </div>
              <div className="text-sm font-medium text-purple-700 mt-1 capitalize">
                {activity.vibe}
              </div>
              <div className="text-xs text-purple-600 mt-0.5">
                Vibe
              </div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {activity.interested.length + Object.values(activity.joinRequests).filter(r => r === 'maybe').length}
              </div>
              <div className="text-sm font-medium text-green-700 mt-1">
                Interested
              </div>
              <div className="text-xs text-green-600 mt-0.5">
                Total responses
              </div>
            </div>
            
            <div className="p-3 bg-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                {visibilityInfo.icon === Globe ? '🌍' : 
                 visibilityInfo.icon === Eye ? '👥' : '🛡️'}
              </div>
              <div className="text-sm font-medium text-indigo-700 mt-1">
                {activity.visibility}
              </div>
              <div className="text-xs text-indigo-600 mt-0.5">
                Visibility
              </div>
            </div>
          </div>
          
          {timeInfo.isPast && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
              <div className="text-gray-600 text-sm">
                📝 This activity has already happened
              </div>
            </div>
          )}
          
          {!timeInfo.isPast && activity.maxParticipants && 
           (activity.interested.length + Object.values(activity.joinRequests).filter(r => r === 'maybe').length) >= activity.maxParticipants && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg text-center">
              <div className="text-red-600 text-sm font-medium">
                🔴 Activity is full
              </div>
              <div className="text-red-500 text-xs mt-1">
                Maximum participants reached
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ActivityDetailPage