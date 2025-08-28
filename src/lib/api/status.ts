export interface StatusUpdate {
  id: string
  status: 'available' | 'busy' | 'invisible'
  message?: string | null
  createdAt: Date
  user: {
    id: string
    name?: string | null
    avatar?: string | null
  }
}

export interface FriendStatus {
  id: string
  name?: string | null
  avatar?: string | null
  availabilityStatus: string
  statusMessage?: string | null
  lastUpdated: Date
}

export async function createStatusUpdate(status: 'available' | 'busy' | 'invisible', message?: string): Promise<StatusUpdate> {
  const response = await fetch('/api/status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ status, message }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create status update')
  }

  const data = await response.json()
  return data.statusUpdate
}

export async function getMyStatusUpdates(): Promise<StatusUpdate[]> {
  const response = await fetch('/api/status?type=my', {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch status updates')
  }

  const data = await response.json()
  return data.statusUpdates
}

export async function getFriendsStatusUpdates(): Promise<StatusUpdate[]> {
  const response = await fetch('/api/status?type=friends', {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch friends status updates')
  }

  const data = await response.json()
  return data.statusUpdates
}

export async function getFriendsCurrentStatus(): Promise<FriendStatus[]> {
  const response = await fetch('/api/friends/status', {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch friends status')
  }

  const data = await response.json()
  return data.friends
}