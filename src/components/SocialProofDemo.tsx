'use client'

import { useState } from 'react'
import SocialProofBadge from './SocialProofBadge'
import FriendParticipants from './FriendParticipants'
import { ActivityWithDetails } from '@/lib/api/activities'

// Demo data showing different social proof scenarios
const demoActivities: ActivityWithDetails[] = [
  {
    id: '1',
    title: 'Coffee at Blue Bottle',
    description: 'Quick coffee break downtown',
    location: 'Blue Bottle Coffee, Mission St',
    category: 'spontaneous',
    visibility: 'friends',
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: {
      id: 'friend1',
      name: 'Sarah Chen',
      avatar: null
    },
    responses: [
      {
        id: 'r1',
        response: 'in',
        createdAt: new Date(),
        user: { id: 'friend2', name: 'Mike Johnson', avatar: null }
      },
      {
        id: 'r2',
        response: 'maybe',
        createdAt: new Date(),
        user: { id: 'friend3', name: 'Emma Davis', avatar: null }
      }
    ]
  },
  {
    id: '2',
    title: 'Evening Basketball',
    description: 'Pickup game at the park',
    location: 'Golden Gate Park Courts',
    category: 'planned',
    visibility: 'open',
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: {
      id: 'user123',
      name: 'Alex Rivera',
      avatar: null
    },
    responses: [
      {
        id: 'r3',
        response: 'in',
        createdAt: new Date(),
        user: { id: 'friend1', name: 'Sarah Chen', avatar: null }
      },
      {
        id: 'r4',
        response: 'in',
        createdAt: new Date(),
        user: { id: 'friend4', name: 'David Kim', avatar: null }
      },
      {
        id: 'r5',
        response: 'in',
        createdAt: new Date(),
        user: { id: 'other1', name: 'Jason Wong', avatar: null }
      },
      {
        id: 'r6',
        response: 'maybe',
        createdAt: new Date(),
        user: { id: 'friend5', name: 'Lisa Zhang', avatar: null }
      }
    ]
  }
]

const SocialProofDemo = () => {
  const [selectedActivity, setSelectedActivity] = useState<number>(0)
  const [showDetails, setShowDetails] = useState(false)
  
  const currentUserId = 'user123'
  const activity = demoActivities[selectedActivity]

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Social Proof Components Demo</h2>
        
        {/* Activity Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Demo Activity:
          </label>
          <div className="flex gap-2">
            {demoActivities.map((act, index) => (
              <button
                key={act.id}
                onClick={() => setSelectedActivity(index)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedActivity === index 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {act.title}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Info */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-gray-800">{activity.title}</h3>
          <p className="text-gray-600 text-sm">{activity.description}</p>
          <p className="text-xs text-gray-500 mt-1">
            Created by: {activity.creator.name} | 
            {activity.responses.length} responses
          </p>
        </div>

        {/* Social Proof Badge */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Social Proof Badge:</h4>
            <SocialProofBadge 
              activity={activity}
              currentUserId={currentUserId}
              onClick={() => setShowDetails(!showDetails)}
            />
          </div>

          {/* Detailed Participants View */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2">
              Friend Participants (Full View):
            </h4>
            <div className="border border-gray-200 rounded-lg p-4">
              <FriendParticipants 
                activity={activity}
                currentUserId={currentUserId}
                compact={false}
              />
            </div>
          </div>

          {/* Compact View */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2">
              Friend Participants (Compact):
            </h4>
            <div className="border border-gray-200 rounded-lg p-4">
              <FriendParticipants 
                activity={activity}
                currentUserId={currentUserId}
                compact={true}
              />
            </div>
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Features Demonstrated:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Friend highlighting in participant lists</li>
            <li>• Smart social proof messaging based on participation</li>
            <li>• Avatar stacks with overflow indicators</li>
            <li>• Separate friend vs. non-friend participant sections</li>
            <li>• Clickable badges that reveal detailed participant info</li>
            <li>• Compact mode for space-constrained layouts</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SocialProofDemo