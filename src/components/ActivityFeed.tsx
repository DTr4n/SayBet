'use client'

import { Clock, Calendar, Zap, Archive } from 'lucide-react'
import { Activity, ActivityResponse } from '@/types/activity'
import { categorizeActivities } from '@/lib/utils/activityUtils'
import ActivityCard from './ActivityCard'
import EmptyState from './EmptyState'
import LoadingSpinner from './LoadingSpinner'

interface ActivityFeedProps {
  activities: Activity[]
  currentUserId?: number
  isLoading?: boolean
  onJoinInterest?: (activityId: string, response: ActivityResponse) => void
  onCreateActivity?: () => void
  respondingToActivity?: string | null
  onShare?: (activityId: string) => void
  showSocialProof?: boolean
}

interface ActivitySection {
  title: string
  activities: Activity[]
  icon: React.ReactNode
  emptyTitle: string
  emptyDescription: string
  emptyAction?: React.ReactNode
}

const ActivityFeed = ({ 
  activities, 
  currentUserId = 0, 
  isLoading = false,
  onJoinInterest,
  onCreateActivity,
  respondingToActivity,
  onShare,
  showSocialProof = true
}: ActivityFeedProps) => {
  
  // Use the enhanced categorization utility
  const { current: currentActivities, past: pastActivities } = categorizeActivities(activities)
  
  // Count immediate activities for special highlighting
  const immediateCount = currentActivities.filter(activity => {
    const timeframe = activity.timeframe?.toLowerCase() || ''
    return timeframe.includes('now') || timeframe.includes('30 min') || timeframe.includes('1 hour')
  }).length

  const sections: ActivitySection[] = [
    {
      title: `Current Activities${immediateCount > 0 ? ' • ' + immediateCount + ' happening soon!' : ''}`,
      activities: currentActivities,
      icon: immediateCount > 0 ? <Zap className="w-5 h-5 text-orange-500" /> : <Clock className="w-5 h-5" />,
      emptyTitle: 'No current activities',
      emptyDescription: 'Be the first to post something fun to do! Share what you\'re up to and see who wants to join.',
      emptyAction: onCreateActivity ? (
        <button
          onClick={onCreateActivity}
          className="button-gradient text-white px-6 py-3 rounded-xl font-medium hover-scale"
        >
          Post Your First Activity
        </button>
      ) : undefined
    },
    {
      title: 'Past Activities',
      activities: pastActivities,
      icon: <Archive className="w-5 h-5 text-gray-500" />,
      emptyTitle: 'No past activities yet',
      emptyDescription: 'Your completed activities and past hangouts will appear here.',
    }
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        icon={<span className="text-4xl">⚡</span>}
        title="No activities yet"
        description="Be the first to post something fun to do! Share what you're up to and see who wants to join."
        action={onCreateActivity ? (
          <button
            onClick={onCreateActivity}
            className="button-gradient text-white px-6 py-3 rounded-xl font-medium hover-scale"
          >
            Post Your First Activity
          </button>
        ) : undefined}
      />
    )
  }

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.title} className="space-y-4">
          {/* Section Header */}
          <div className="flex items-center space-x-3 border-b border-gray-200 pb-3">
            <div className={`${section.title.includes('happening soon') ? 'text-orange-500' : 'text-indigo-600'}`}>
              {section.icon}
            </div>
            <h2 className={`text-xl font-bold ${section.title.includes('Past') ? 'text-gray-600' : 'text-gray-800'}`}>
              {section.title.split('•')[0].trim()}
              {section.title.includes('•') && (
                <span className="text-sm font-medium text-orange-600 ml-2">
                  • {section.title.split('•')[1].trim()}
                </span>
              )}
            </h2>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${
              section.activities.length > 0 
                ? section.title.includes('Past') 
                  ? 'text-gray-600 bg-gray-100' 
                  : 'text-indigo-700 bg-indigo-100'
                : 'text-gray-400 bg-gray-50'
            }`}>
              {section.activities.length}
            </span>
          </div>

          {/* Section Content */}
          {section.activities.length > 0 ? (
            <div className="space-y-4">
              {section.activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  currentUserId={currentUserId?.toString()}
                  onJoinInterest={onJoinInterest}
                  isResponding={respondingToActivity === activity.id}
                  onShare={onShare}
                  showSocialProof={showSocialProof}
                />
              ))}
            </div>
          ) : (
            <div className="py-8">
              <EmptyState
                icon={<div className="text-gray-400">{section.icon}</div>}
                title={section.emptyTitle}
                description={section.emptyDescription}
                action={section.emptyAction}
                compact
              />
            </div>
          )}
        </div>
      ))}
      
      {/* Activity Stats */}
      {activities.length > 0 && (
        <div className="glass-card p-4 mt-8">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Total Activities: {activities.length}</span>
            <div className="flex space-x-4">
              <span>Current: {currentActivities.length}</span>
              <span>Past: {pastActivities.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivityFeed