import { CreateFriendshipInput, UpdateFriendshipInput } from '@/lib/database/schema'

export interface FriendRequest {
  id: string
  status: 'pending' | 'accepted' | 'blocked'
  createdAt: Date
  sender: {
    id: string
    name?: string | null
    phone?: string | null
    avatar?: string | null
  }
  receiver?: {
    id: string
    name?: string | null
    phone?: string | null
    avatar?: string | null
  }
}

export async function getFriendRequests(type: 'received' | 'sent' = 'received'): Promise<FriendRequest[]> {
  const response = await fetch(`/api/friends?type=${type}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch friend requests')
  }

  const data = await response.json()
  return data.friendRequests
}

export async function sendFriendRequest(receiverPhone: string): Promise<FriendRequest> {
  const response = await fetch('/api/friends', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ receiverPhone }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to send friend request')
  }

  const data = await response.json()
  return data.friendship
}

export async function respondToFriendRequest(friendshipId: string, status: 'accepted' | 'blocked'): Promise<FriendRequest> {
  const response = await fetch(`/api/friends/${friendshipId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to respond to friend request')
  }

  const data = await response.json()
  return data.friendship
}

export async function removeFriend(friendshipId: string): Promise<void> {
  const response = await fetch(`/api/friends/${friendshipId}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to remove friend')
  }
}

// Helper function to get all accepted friends
export async function getFriends(): Promise<FriendRequest[]> {
  const [received, sent] = await Promise.all([
    getFriendRequests('received'),
    getFriendRequests('sent')
  ])

  // Filter only accepted friendships and combine them
  return [
    ...received.filter(req => req.status === 'accepted'),
    ...sent.filter(req => req.status === 'accepted')
  ]
}

// Legacy compatibility functions
export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  await respondToFriendRequest(friendshipId, 'accepted')
}

export async function addFriend(userId: string, friendPhone: string): Promise<FriendRequest> {
  return await sendFriendRequest(friendPhone)
}

export interface SearchUser {
  id: string
  name?: string | null
  phone?: string | null
  avatar?: string | null
  relationshipStatus: 'none' | 'pending' | 'accepted' | 'blocked'
  mutualFriendCount?: number
}

export async function searchUserByPhone(phone: string): Promise<SearchUser> {
  const response = await fetch('/api/users/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ phone }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to search for user')
  }

  const data = await response.json()
  return data.user
}

export interface FriendActivity {
  id: string
  title: string
  description?: string | null
  location?: string | null
  date?: Date | null
  time?: string | null
  category: string
  visibility?: string
  createdAt: Date
  participantCount: number
  participants?: Array<{
    id: string
    name?: string | null
    avatar?: string | null
  }>
  creator?: {
    id: string
    name?: string | null
    avatar?: string | null
  }
}

export interface FriendProfile {
  id: string
  name?: string | null
  phone?: string | null
  avatar?: string | null
  availabilityStatus?: string
  createdAt: Date
  recentActivities: FriendActivity[]
  participatedActivities: FriendActivity[]
  sharedActivities: FriendActivity[]
}

export async function getFriendProfile(friendId: string): Promise<FriendProfile> {
  const response = await fetch(`/api/friends/${friendId}/profile`, {
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch friend profile')
  }

  const data = await response.json()
  return data.profile
}

export interface MutualFriend {
  id: string
  name?: string | null
  avatar?: string | null
  phone?: string | null
}

export interface MutualFriendsResponse {
  mutualFriends: MutualFriend[]
  count: number
}

export async function getMutualFriends(userId: string): Promise<MutualFriendsResponse> {
  const response = await fetch(`/api/users/${userId}/mutual-friends`, {
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch mutual friends')
  }

  const data = await response.json()
  return data
}