'use client'

import { useState } from 'react'
import { Sparkles, Plus } from 'lucide-react'
import Navigation from '@/components/Navigation'
import ActivityCard from '@/components/ActivityCard'
import ActivityForm from '@/components/ActivityForm'
import FriendCard from '@/components/FriendCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import ErrorBoundary from '@/components/ErrorBoundary'
import { Activity, ActivityResponse, Friend, DiscoverFriend } from '@/types/activity'

export default function Home() {
  const [activeTab, setActiveTab] = useState('activities')
  const [availabilityStatus, setAvailabilityStatus] = useState("Free this evening")
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availabilityOptions = [
    "Free right now",
    "Free this evening", 
    "Free this weekend",
    "Down for coffee this week",
    "Looking for weekend plans",
    "Free for spontaneous hangouts",
    "Busy until Friday"
  ]

  const currentUser = { name: "You", avatar: "👤", id: 0 }

  // Mock activities data
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

  const handleJoinInterest = async (activityId: number, response: ActivityResponse) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setActivities(activities.map(activity => 
        activity.id === activityId 
          ? { 
              ...activity, 
              joinRequests: { ...activity.joinRequests, [currentUser.id]: response },
              interested: response === 'interested' && !activity.interested.includes(currentUser.id) 
                ? [...activity.interested, currentUser.id] 
                : activity.interested.filter(id => id !== currentUser.id)
            }
          : activity
      ))
    } catch (err) {
      setError('Failed to update activity response. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateActivity = async (formData: any) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newActivity: Activity = {
        id: activities.length + 1,
        title: formData.title,
        description: formData.description,
        timeframe: formData.timeframe,
        location: formData.location,
        host: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar },
        type: formData.timeframe.toLowerCase().includes('now') || formData.timeframe.toLowerCase().includes('30') 
          ? 'spontaneous' 
          : 'planned',
        interested: [],
        joinRequests: {},
        vibe: formData.vibe,
        visibility: formData.visibility
      }
      setActivities([newActivity, ...activities])
      setShowActivityForm(false)
    } catch (err) {
      setError('Failed to create activity. Please try again.')
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
              <div className="hidden sm:flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <select 
                  value={availabilityStatus}
                  onChange={(e) => setAvailabilityStatus(e.target.value)}
                  className="bg-transparent text-sm text-green-700 border-none outline-none"
                >
                  {availabilityOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="hidden sm:inline text-sm text-gray-600">Hey,</span>
                <span className="font-semibold text-indigo-700 text-sm sm:text-base">{currentUser.name}</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-200 to-cyan-200 rounded-full flex items-center justify-center">
                  {currentUser.avatar}
                </div>
              </div>
            </div>
          </div>
          {/* Mobile availability status */}
          <div className="sm:hidden mt-3 flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <select 
              value={availabilityStatus}
              onChange={(e) => setAvailabilityStatus(e.target.value)}
              className="bg-transparent text-sm text-green-700 border-none outline-none w-full"
            >
              {availabilityOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
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

        {/* Content Areas */}
        <ErrorBoundary>
        {activeTab === 'activities' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Activity Feed</h2>
              <button 
                onClick={() => setShowActivityForm(true)}
                className="flex items-center justify-center space-x-2 button-gradient text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Post Activity</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Current Activities Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Current Activities
                </h3>
                {activities.filter(activity => activity.type !== 'completed').map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    currentUserId={currentUser.id}
                    onJoinInterest={handleJoinInterest}
                  />
                ))}
              </div>

              {/* Past Activities Section */}
              {activities.filter(activity => activity.type === 'completed').length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-600 border-b border-gray-200 pb-2">
                    Past Activities
                  </h3>
                  {activities.filter(activity => activity.type === 'completed').map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      currentUserId={currentUser.id}
                      onJoinInterest={handleJoinInterest}
                    />
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              )}

              {activities.length === 0 && !isLoading && (
                <EmptyState
                  icon={<span className="text-4xl">⚡</span>}
                  title="No activities yet"
                  description="Be the first to post something fun to do! Share what you're up to and see who wants to join."
                  action={
                    <button
                      onClick={() => setShowActivityForm(true)}
                      className="button-gradient text-white px-6 py-3 rounded-xl font-medium"
                    >
                      Post Your First Activity
                    </button>
                  }
                />
              )}
            </div>
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Your Crew</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <FriendCard key={friend.id} friend={friend} />
              ))}

              {friends.length === 0 && (
                <div className="col-span-full">
                  <EmptyState
                    icon={<span className="text-4xl">👥</span>}
                    title="No friends yet"
                    description="Add people you've hung out with to see their activities and availability!"
                  />
                </div>
              )}
            </div>

            {/* Discover Friends Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">People You've Hung Out With</h3>
                <p className="text-xs sm:text-sm text-gray-500">Add them to see their activities</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {discoverFriends.map((person) => (
                  <FriendCard 
                    key={person.id} 
                    friend={person} 
                    type="discover" 
                    onAddFriend={handleAddFriend}
                  />
                ))}
              </div>
            </div>
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
    </div>
  )
}
