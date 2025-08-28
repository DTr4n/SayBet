'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, MapPin, Users, Clock, Activity, User } from 'lucide-react'
import { getFriendProfile, FriendProfile as FriendProfileType, FriendActivity, getMutualFriends } from '@/lib/api/friends'
import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'
import MutualFriends from './MutualFriends'

interface FriendProfileProps {
  friendId: string
  onBack: () => void
}

const FriendProfile = ({ friendId, onBack }: FriendProfileProps) => {
  const [profile, setProfile] = useState<FriendProfileType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'created' | 'participated' | 'shared'>('created')
  const [showMutualFriends, setShowMutualFriends] = useState(false)
  const [mutualFriendCount, setMutualFriendCount] = useState<number>(0)

  useEffect(() => {
    loadProfile()
  }, [friendId])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [profileData, mutualFriendsData] = await Promise.all([
        getFriendProfile(friendId),
        getMutualFriends(friendId)
      ])
      setProfile(profileData)
      setMutualFriendCount(mutualFriendsData.count)
    } catch (err) {
      console.error('Failed to load friend profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load friend profile')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  const formatTime = (time?: string | null) => {
    if (!time) return null
    return time
  }

  const getAvailabilityColor = (status?: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200'
      case 'busy': return 'bg-red-100 text-red-800 border-red-200'
      case 'invisible': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const ActivityCard = ({ activity }: { activity: FriendActivity }) => (
    <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-gray-800 flex-1">{activity.title}</h4>
          <span className={`px-2 py-1 text-xs rounded-full ${
            activity.category === 'spontaneous' 
              ? 'bg-orange-100 text-orange-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {activity.category}
          </span>
        </div>

        {activity.description && (
          <p className="text-sm text-gray-600">{activity.description}</p>
        )}

        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
          {activity.location && (
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{activity.location}</span>
            </div>
          )}
          {activity.date && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(activity.date)}</span>
            </div>
          )}
          {activity.time && (
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatTime(activity.time)}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{activity.participantCount} participant{activity.participantCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {activity.creator && activity.creator.id !== friendId && (
          <div className="text-sm text-gray-500">
            Created by <span className="font-medium">{activity.creator.name || 'Unknown'}</span>
          </div>
        )}
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Friends</span>
        </button>
        <div className="text-center py-12">
          <EmptyState
            icon={<User className="w-12 h-12 text-gray-400" />}
            title="Profile not available"
            description={error || "This friend's profile could not be loaded"}
          />
        </div>
      </div>
    )
  }

  const currentActivities = activeTab === 'created' 
    ? profile.recentActivities 
    : activeTab === 'participated' 
      ? profile.participatedActivities 
      : profile.sharedActivities

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Friends</span>
        </button>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-cyan-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">
              {profile.name ? profile.name[0].toUpperCase() : '👤'}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">
              {profile.name || 'Unknown User'}
            </h1>
            <p className="text-gray-500">{profile.phone}</p>
            <div className="mt-2 flex items-center space-x-4">
              <div className={`px-3 py-1 text-sm rounded-lg border ${getAvailabilityColor(profile.availabilityStatus)}`}>
                {profile.availabilityStatus || 'Unknown'}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Friends since {formatDate(profile.createdAt)}</span>
                {mutualFriendCount > 0 && (
                  <button
                    onClick={() => setShowMutualFriends(true)}
                    className="text-indigo-600 hover:text-indigo-800 underline"
                  >
                    {mutualFriendCount} mutual {mutualFriendCount === 1 ? 'friend' : 'friends'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Tabs */}
      <div className="bg-white rounded-lg border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('created')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'created'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Created Activities ({profile.recentActivities.length})
            </button>
            <button
              onClick={() => setActiveTab('participated')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'participated'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Participated In ({profile.participatedActivities.length})
            </button>
            <button
              onClick={() => setActiveTab('shared')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'shared'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Shared Activities ({profile.sharedActivities.length})
            </button>
          </nav>
        </div>

        {/* Activities Content */}
        <div className="p-6">
          {currentActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <EmptyState
                icon={<Activity className="w-12 h-12 text-gray-400" />}
                title="No activities found"
                description={
                  activeTab === 'created' 
                    ? "This friend hasn't created any activities yet" 
                    : activeTab === 'participated' 
                      ? "This friend hasn't participated in any activities yet"
                      : "You haven't shared any activities with this friend yet"
                }
                compact
              />
            </div>
          )}
        </div>
      </div>

      {/* Mutual Friends Modal */}
      <MutualFriends
        userId={friendId}
        userName={profile.name || undefined}
        isOpen={showMutualFriends}
        onClose={() => setShowMutualFriends(false)}
      />
    </div>
  )
}

export default FriendProfile