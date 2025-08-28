export interface User {
  id: number
  name: string
  avatar?: string
}

export interface Activity {
  id: string
  title: string
  description: string
  timeframe: string
  location: string
  host: User
  type: 'spontaneous' | 'planned' | 'completed'
  interested: number[]
  joinRequests: Record<number, 'interested' | 'maybe' | 'not_interested'>
  vibe: 'active' | 'casual' | 'social' | 'chill' | 'foodie' | 'competitive'
  visibility: 'friends' | 'previous' | 'open'
}

export type ActivityResponse = 'interested' | 'maybe' | 'not_interested'

export interface Friend extends User {
  availability: string
  nextActivity?: {
    title: string
    time: string
    location: string
  } | null
}

export interface DiscoverFriend extends User {
  lastActivity: string
  mutualFriends: number
}