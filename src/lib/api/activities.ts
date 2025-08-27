import { CreateActivityInput, UpdateActivityInput, CreateActivityResponseInput } from '@/lib/database/schema'

export interface ActivityWithDetails {
  id: string
  title: string
  description?: string | null
  location?: string | null
  date?: Date | null
  time?: string | null
  category: 'spontaneous' | 'planned'
  visibility: 'friends' | 'previous' | 'open'
  maxParticipants?: number | null
  createdAt: Date
  updatedAt: Date
  creator: {
    id: string
    name?: string | null
    avatar?: string | null
  }
  responses: Array<{
    id: string
    response: 'in' | 'maybe'
    createdAt: Date
    user: {
      id: string
      name?: string | null
      avatar?: string | null
    }
  }>
}

export async function getActivities(): Promise<ActivityWithDetails[]> {
  const response = await fetch('/api/activities', {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch activities')
  }

  const data = await response.json()
  return data.activities
}

export async function getActivityById(id: string): Promise<ActivityWithDetails> {
  const response = await fetch(`/api/activities/${id}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch activity')
  }

  const data = await response.json()
  return data.activity
}

export async function createActivity(
  activityData: CreateActivityInput
): Promise<ActivityWithDetails> {
  const response = await fetch('/api/activities', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(activityData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create activity')
  }

  const data = await response.json()
  return data.activity
}

export async function updateActivity(
  id: string,
  updates: UpdateActivityInput
): Promise<ActivityWithDetails> {
  const response = await fetch(`/api/activities/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update activity')
  }

  const data = await response.json()
  return data.activity
}

export async function deleteActivity(id: string): Promise<void> {
  const response = await fetch(`/api/activities/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete activity')
  }
}

export async function respondToActivity(
  activityId: string,
  response: 'in' | 'maybe'
): Promise<{
  id: string
  response: 'in' | 'maybe'
  createdAt: Date
  user: {
    id: string
    name?: string | null
    avatar?: string | null
  }
  activity: {
    id: string
    title: string
  }
}> {
  const apiResponse = await fetch(`/api/activities/${activityId}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ response }),
  })

  if (!apiResponse.ok) {
    const error = await apiResponse.json()
    throw new Error(error.error || 'Failed to respond to activity')
  }

  const data = await apiResponse.json()
  return data.response
}

export async function removeActivityResponse(activityId: string): Promise<void> {
  const response = await fetch(`/api/activities/${activityId}/responses`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to remove activity response')
  }
}