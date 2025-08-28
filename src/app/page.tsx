'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Plus, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { CreateActivityInput } from '@/lib/database/schema'
import { createActivity, getActivities, respondToActivity, removeActivityResponse, ActivityWithDetails, ActivityFilters } from '@/lib/api/activities'
import { getFriends, FriendRequest } from '@/lib/api/friends'
import ProfileSetup from '@/components/ProfileSetup'
import Navigation from '@/components/Navigation'
import ActivityCard from '@/components/ActivityCard'
import ActivityFeed from '@/components/ActivityFeed'
import ActivityForm from '@/components/ActivityForm'
import FriendCard from '@/components/FriendCard'
import FriendsManager from '@/components/FriendsManager'
import PreviousConnectionsDiscovery from '@/components/PreviousConnectionsDiscovery'
import FriendProfile from '@/components/FriendProfile'
import ActivityFiltersComponent from '@/components/ActivityFilters'
import FriendStatusUpdates from '@/components/FriendStatusUpdates'
import StatusUpdateForm from '@/components/StatusUpdateForm'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import ErrorBoundary from '@/components/ErrorBoundary'
import { Activity, ActivityResponse, Friend, DiscoverFriend } from '@/types/activity'

export default function Home() {
  const router = useRouter()
  const { user, loading, logout, updateUser } = useAuth()

  // All state hooks must be called before any conditional returns
  const [activeTab, setActiveTab] = useState('activities')
  const [availabilityStatus, setAvailabilityStatus] = useState(user?.availabilityStatus || "available")
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [respondingToActivity, setRespondingToActivity] = useState<string | null>(null)
  const [realFriends, setRealFriends] = useState<FriendRequest[]>([])
  const [loadingFriends, setLoadingFriends] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null)
  const [activityFilters, setActivityFilters] = useState<ActivityFilters>({})
  const [showStatusForm, setShowStatusForm] = useState(false)

  // Mock activities data - must be initialized before any returns
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: 1,
      title: "Boba run - anyone free? 🧋",
      description: "Getting my usual from Tiger Sugar, lmk if you want to join",
      timeframe: "In 30 mins",
      location: "Tiger Sugar, Main St",
      host: { name: "Sarah Johnson", id: 2 },
      type: "spontaneous" as const,
      interested: [1],
      joinRequests: { 1: "interested" as const },
      vibe: "casual" as const,
      visibility: "friends" as const
    },
    {
      id: 2,
      title: "Hiking Griffith Park tomorrow morning",
      description: "Early bird gets the worm! Beautiful sunrise views 🌅",
      timeframe: "Saturday 7am",
      location: "Griffith Observatory Trail",
      host: { name: "Mike Torres", id: 3 },
      type: "planned" as const,
      interested: [2],
      joinRequests: { 2: "maybe" as const },
      vibe: "active" as const,
      visibility: "friends" as const
    },
    {
      id: 3,
      title: "Coffee catch-up ☕",
      description: "Let's finally catch up! It's been too long",
      timeframe: "Yesterday 3pm",
      location: "Starbucks Downtown",
      host: { name: "Alex Chen", id: 1 },
      type: "completed" as const,
      interested: [0],
      joinRequests: { 0: "interested" as const },
      vibe: "casual" as const,
      visibility: "friends" as const
    },
    {
      id: 4,
      title: "Trivia Night Domination 🧠",
      description: "We absolutely crushed it! 2nd place isn't bad",
      timeframe: "Last Thursday 7pm",
      location: "Murphy's Pub",
      host: { name: "Lisa Park", id: 6 },
      type: "completed" as const,
      interested: [0, 1, 7],
      joinRequests: { 0: "interested" as const, 1: "interested" as const, 7: "interested" as const },
      vibe: "social" as const,
      visibility: "previous" as const
    },
    {
      id: 5,
      title: "Weekend farmers market run 🥕",
      description: "Getting fresh produce and trying new vendors",
      timeframe: "This Sunday 9am",
      location: "Santa Monica Farmers Market",
      host: { name: "Maya Rodriguez", id: 8 },
      type: "planned" as const,
      interested: [6],
      joinRequests: { 6: "maybe" as const },
      vibe: "chill" as const,
      visibility: "previous" as const
    }
  ])

  // Mock friends data
  const [friends, setFriends] = useState<Friend[]>([
    { 
      id: 1, 
      name: "Alex Chen", 
      avatar: "👤",
      availability: "Free this weekend",
      nextActivity: {
        title: "Coffee catch-up",
        time: "Tomorrow 3pm",
        location: "Starbucks Downtown"
      }
    },
    { 
      id: 2, 
      name: "Sarah Johnson", 
      avatar: "👤",
      availability: "Down for anything tonight",
      nextActivity: {
        title: "Trying new sushi place",
        time: "Friday 7pm", 
        location: "Sakura Restaurant"
      }
    }
  ])

  // Mock discover friends
  const [discoverFriends, setDiscoverFriends] = useState<DiscoverFriend[]>([
    { 
      id: 6, 
      name: "Lisa Park", 
      avatar: "👤", 
      lastActivity: "Hiking at Griffith Park", 
      mutualFriends: 2 
    },
    { 
      id: 7, 
      name: "David Kim", 
      avatar: "👤", 
      lastActivity: "Trivia night at Murphy's", 
      mutualFriends: 1 
    },
    { 
      id: 8, 
      name: "Maya Rodriguez", 
      avatar: "👤", 
      lastActivity: "Coffee at Blue Bottle", 
      mutualFriends: 3 
    }
  ])


  // Load activities when user is authenticated or filters change
  const loadActivities = async () => {
    if (!user) return
    
    try {
      setLoadingActivities(true)
      const apiActivities = await getActivities(activityFilters)
      
      // Convert API activities to legacy format for existing components
      const legacyActivities: Activity[] = apiActivities.map(activity => {
        // Convert responses to legacy format
        const interested: number[] = []
        const joinRequests: Record<number, 'interested' | 'maybe' | 'not_interested'> = {}
        
        activity.responses.forEach(response => {
          // Use a hash of the CUID for legacy integer keys (for consistency)
          const userId = response.user.id === 'cmeui1jgv0003ro4if40284zp' ? 999 : 
                        parseInt(response.user.id.slice(-6), 36) || Math.abs(response.user.id.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0))
          if (response.response === 'in') {
            interested.push(userId)
            joinRequests[userId] = 'interested'
          } else if (response.response === 'maybe') {
            joinRequests[userId] = 'maybe'
          }
        })
        
        return {
          id: activity.id,
          title: activity.title,
          description: activity.description || '',
          timeframe: activity.time || (activity.date ? new Date(activity.date).toLocaleDateString() : 'No time specified'),
          location: activity.location || '',
          host: {
            id: parseInt(activity.creator.id) || 0,
            name: activity.creator.name || 'Unknown',
            avatar: activity.creator.avatar || undefined
          },
          type: activity.category === 'spontaneous' ? 'spontaneous' : 'planned',
          interested,
          joinRequests,
          vibe: 'chill', // Default since vibe field was removed
          visibility: activity.visibility
        }
      })
      
      setActivities(legacyActivities)
    } catch (err) {
      console.error('Failed to load activities:', err)
      // Keep existing mock data if API fails
    } finally {
      setLoadingActivities(false)
    }
  }

  useEffect(() => {
    loadActivities()
  }, [user, activityFilters])

  // Load friends when user is authenticated
  useEffect(() => {
    const loadUserFriends = async () => {
      if (!user) return
      
      try {
        setLoadingFriends(true)
        const friendsList = await getFriends()
        setRealFriends(friendsList)
      } catch (err) {
        console.error('Failed to load friends:', err)
      } finally {
        setLoadingFriends(false)
      }
    }

    loadUserFriends()
  }, [user])

  const handleFriendAdded = () => {
    // Reload friends when a new friend is added
    if (user) {
      getFriends().then(setRealFriends).catch(console.error)
    }
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Show auth form if not authenticated
  if (!loading && !user) {
    console.log('Home: No user, showing auth form')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please sign in</h1>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  // Show profile setup if user hasn't set their name
  if (user && !user.name) {
    console.log('Showing ProfileSetup - user:', user)
    return <ProfileSetup />
  }

  const availabilityOptions = [
    { value: "available", label: "Available" },
    { value: "busy", label: "Busy" },
    { value: "invisible", label: "Invisible" }
  ]

  const currentUser = user ? { 
    name: user.name, 
    avatar: "👤", 
    id: user.id === 'cmeui1jgv0003ro4if40284zp' ? '999' : user.id,
    numericId: user.id === 'cmeui1jgv0003ro4if40284zp' ? 999 : (parseInt(user.id.slice(-6), 36) || Math.abs(user.id.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0)))
  } : { name: "You", avatar: "👤", id: "0", numericId: 0 }

  const handleAvailabilityChange = async (newStatus: string) => {
    setAvailabilityStatus(newStatus)
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          availabilityStatus: newStatus,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        updateUser(data.user)
      }
    } catch (error) {
      console.error('Failed to update availability status:', error)
      // Revert on error
      setAvailabilityStatus(user?.availabilityStatus || "available")
    }
  }

  const handleStatusUpdate = (status: string, message?: string) => {
    setAvailabilityStatus(status)
    if (user) {
      updateUser({ ...user, availabilityStatus: status })
    }
  }


  const handleJoinInterest = async (activityId: string | number, response: ActivityResponse) => {
    try {
      const normalizedId = typeof activityId === 'number' ? activityId.toString() : activityId
      setRespondingToActivity(normalizedId)
      setError(null)
      
      // Map the UI response types to API types
      const apiResponse: 'in' | 'maybe' = response === 'interested' ? 'in' : 'maybe'
      
      // Handle removing response (if user clicks same response to toggle off)
      const activity = activities.find(a => a.id == activityId) // Use == to handle string/number comparison
      
      // Check current response using the legacy format (populated from API)
      const currentResponse = activity?.joinRequests[currentUser.numericId]
      
      console.log('Debug - Current response detection:', {
        activityId,
        requestedResponse: response,
        currentResponse,
        userId: currentUser.numericId,
        joinRequests: activity?.joinRequests,
        willRemove: currentResponse === response,
        willAddChange: currentResponse !== response
      })
      
      // Optimistically update the UI first
      const updatedActivities = activities.map(act => {
        if (act.id != activityId) return act
        
        const newJoinRequests = { ...act.joinRequests }
        const newInterested = [...act.interested]
        
        // Remove user from current response
        delete newJoinRequests[currentUser.numericId]
        const interestedIndex = newInterested.indexOf(currentUser.numericId)
        if (interestedIndex > -1) {
          newInterested.splice(interestedIndex, 1)
        }
        
        // If user is clicking the same response, just remove (toggle off)
        if (currentResponse === response) {
          console.log('TOGGLE OFF: Removing response - same button clicked twice')
          // Response already removed above, just don't add it back
        } else {
          // Add new response
          console.log('TOGGLE ON/SWITCH: Adding new response:', response)
          newJoinRequests[currentUser.numericId] = response
          if (response === 'interested') {
            newInterested.push(currentUser.numericId)
          }
        }
        
        return {
          ...act,
          joinRequests: newJoinRequests,
          interested: newInterested
        }
      })
      
      // Update UI immediately
      setActivities(updatedActivities)
      
      // Then sync with backend
      if (currentResponse === response) {
        // User is removing their response
        console.log('Calling removeActivityResponse for activity:', normalizedId)
        await removeActivityResponse(normalizedId)
        console.log('removeActivityResponse completed')
      } else {
        // User is adding/changing their response
        console.log('Calling respondToActivity for activity:', normalizedId, 'with response:', apiResponse)
        await respondToActivity(normalizedId, apiResponse)
        console.log('respondToActivity completed')
      }
      
      // Don't reload - trust the optimistic update
    } catch (err) {
      console.error('Activity response error:', err)
      setError(err instanceof Error ? err.message : 'Failed to update activity response. Please try again.')
      // TODO: Revert optimistic update instead of full reload
    } finally {
      setRespondingToActivity(null)
    }
  }

  const handleShare = async (activityId: string | number) => {
    const activity = activities.find(a => a.id == activityId) // Use == to handle string/number comparison
    if (!activity) return
    
    const normalizedId = typeof activityId === 'number' ? activityId.toString() : activityId
    const shareUrl = `${window.location.origin}/activity/${normalizedId}`
    
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
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 2000)
      } catch (err) {
        console.error('Failed to copy to clipboard:', err)
      }
    }
  }

  const handleCreateActivity = async (formData: CreateActivityInput & { timeframe: string }) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Extract timeframe for client display and remove it for API call
      const { timeframe, ...apiData } = formData
      
      // Create the activity via API
      const newActivity = await createActivity(apiData)
      
      // Convert API response to legacy Activity format for existing components
      const legacyActivity: Activity = {
        id: parseInt(newActivity.id) || activities.length + 1,
        title: newActivity.title,
        description: newActivity.description || '',
        timeframe: timeframe, // Use the timeframe from form data
        location: newActivity.location || '',
        host: { 
          id: parseInt(newActivity.creator.id) || parseInt(currentUser.id) || 1, 
          name: newActivity.creator.name || currentUser.name || 'User', 
          avatar: newActivity.creator.avatar || currentUser.avatar || undefined 
        },
        type: newActivity.category === 'spontaneous' ? 'spontaneous' : 'planned',
        interested: [],
        joinRequests: {},
        vibe: 'chill', // Default since vibe field was removed from schema
        visibility: newActivity.visibility
      }
      
      setActivities([legacyActivity, ...activities])
      setShowActivityForm(false)
    } catch (err) {
      console.error('Create activity error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create activity. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddFriend = (discoverFriend: DiscoverFriend) => {
    const newFriend: Friend = {
      ...discoverFriend,
      availability: "Just joined!",
      nextActivity: null
    }
    setFriends([...friends, newFriend])
    setDiscoverFriends(discoverFriends.filter(f => f.id !== discoverFriend.id))
  }

  return (
    <div className="min-h-screen bg-app-gradient">
      {/* Header */}
      <header className="glass-header shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-gradient rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary-gradient">
                SayBet
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setShowStatusForm(true)}
                className={`hidden sm:flex items-center space-x-2 rounded-lg px-3 py-1 hover:opacity-80 transition-opacity ${
                  availabilityStatus === 'available' ? 'bg-green-50 border border-green-200' :
                  availabilityStatus === 'busy' ? 'bg-red-50 border border-red-200' :
                  'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  availabilityStatus === 'available' ? 'bg-green-400' :
                  availabilityStatus === 'busy' ? 'bg-red-400' :
                  'bg-gray-400'
                }`}></div>
                <span className={`text-sm capitalize ${
                  availabilityStatus === 'available' ? 'text-green-700' :
                  availabilityStatus === 'busy' ? 'text-red-700' :
                  'text-gray-700'
                }`}>
                  {availabilityStatus}
                </span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <span className="hidden sm:inline text-sm text-gray-600">Hey,</span>
                  <span className="font-semibold text-indigo-700 text-sm sm:text-base">{currentUser.name}</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-200 to-cyan-200 rounded-full flex items-center justify-center">
                    {currentUser.avatar}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          {/* Mobile availability status */}
          <button
            onClick={() => setShowStatusForm(true)}
            className={`sm:hidden mt-3 flex items-center space-x-2 rounded-lg px-3 py-2 w-full hover:opacity-80 transition-opacity ${
              availabilityStatus === 'available' ? 'bg-green-50 border border-green-200' :
              availabilityStatus === 'busy' ? 'bg-red-50 border border-red-200' :
              'bg-gray-50 border border-gray-200'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${
              availabilityStatus === 'available' ? 'bg-green-400' :
              availabilityStatus === 'busy' ? 'bg-red-400' :
              'bg-gray-400'
            }`}></div>
            <span className={`text-sm capitalize ${
              availabilityStatus === 'available' ? 'text-green-700' :
              availabilityStatus === 'busy' ? 'text-red-700' :
              'text-gray-700'
            }`}>
              {availabilityStatus} - Tap to update
            </span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        {/* Navigation Tabs */}
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <div className="text-red-600 text-sm">{error}</div>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Share Success Display */}
        {shareSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <div className="text-green-600 text-sm">Activity link copied to clipboard!</div>
          </div>
        )}

        {/* Content Areas */}
        <ErrorBoundary>
        {activeTab === 'activities' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Activity Feed</h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <ActivityFiltersComponent
                  filters={activityFilters}
                  onFiltersChange={setActivityFilters}
                  onClear={() => setActivityFilters({})}
                />
                <button 
                  onClick={() => setShowActivityForm(true)}
                  className="flex items-center justify-center space-x-2 button-gradient text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Post Activity</span>
                </button>
              </div>
            </div>

            <ActivityFeed
              activities={activities}
              currentUserId={currentUser.numericId}
              isLoading={loadingActivities}
              onJoinInterest={handleJoinInterest}
              onCreateActivity={() => setShowActivityForm(true)}
              respondingToActivity={respondingToActivity}
              onShare={handleShare}
            />
          </div>
        )}

        {activeTab === 'discover' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                What should we do?
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4 sm:px-0">
                AI-powered activity ideas for spontaneous hangouts
              </p>
              <button className="button-gradient text-white px-8 py-4 rounded-2xl font-semibold">
                ✨ Get Fresh Ideas
              </button>
            </div>
            
            <div className="glass-card p-6 sm:p-8 text-center">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">AI Suggestions Coming Soon</h3>
              <p className="text-sm sm:text-base text-gray-500">Smart activity recommendations will be added in future tasks</p>
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="space-y-6 sm:space-y-8">
            {selectedFriendId ? (
              <FriendProfile 
                friendId={selectedFriendId}
                onBack={() => setSelectedFriendId(null)}
              />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Your Crew</h2>
                </div>

                {/* Friend Status Updates */}
                <FriendStatusUpdates />

                {/* Friends Manager Component */}
                <FriendsManager onFriendAdded={handleFriendAdded} />

                {/* Current Friends Section */}
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Your Friends ({realFriends.length})
                  </h3>
                  
                  {loadingFriends ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : realFriends.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {realFriends.map((friendReq) => {
                        // Convert FriendRequest to Friend format for legacy component compatibility
                        const friend = friendReq.sender.id === user?.id 
                          ? friendReq.receiver 
                          : friendReq.sender
                        
                        if (!friend) return null
                        
                        return (
                          <button
                            key={friendReq.id}
                            onClick={() => setSelectedFriendId(friend.id)}
                            className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow w-full text-left"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-bold text-lg">
                                  {friend.name ? friend.name[0].toUpperCase() : '👤'}
                                </span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800">
                                  {friend.name || 'Unknown User'}
                                </h4>
                                <p className="text-sm text-gray-500">{friend.phone}</p>
                                <div className="flex items-center space-x-1 mt-1">
                                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                  <span className="text-xs text-green-600">Connected</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <EmptyState
                        icon={<span className="text-4xl">👥</span>}
                        title="No friends yet"
                        description="Add people by their phone number to see their activities and hang out together!"
                      />
                    </div>
                  )}
                </div>

                {/* Previous Connections Discovery */}
                <PreviousConnectionsDiscovery onFriendRequestSent={handleFriendAdded} />

                {/* Legacy Discover Friends Section - Keep for demo purposes */}
                {discoverFriends.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Suggested Connections</h3>
                      <p className="text-xs sm:text-sm text-gray-500">People you might know</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {discoverFriends.slice(0, 3).map((person) => (
                        <FriendCard 
                          key={person.id} 
                          friend={person} 
                          type="discover" 
                          onAddFriend={handleAddFriend}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        </ErrorBoundary>
      </div>

      {/* Activity Form Modal */}
      <ActivityForm
        isOpen={showActivityForm}
        onClose={() => setShowActivityForm(false)}
        onSubmit={handleCreateActivity}
        isLoading={isLoading}
      />

      {/* Status Update Form Modal */}
      <StatusUpdateForm
        currentStatus={availabilityStatus}
        isOpen={showStatusForm}
        onClose={() => setShowStatusForm(false)}
        onStatusUpdated={handleStatusUpdate}
      />
    </div>
  )
}
