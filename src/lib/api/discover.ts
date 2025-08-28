export interface PreviousConnection {
  id: string
  name?: string | null
  phone?: string | null
  avatar?: string | null
  mutualFriendCount?: number
}

export async function getPreviousConnections(): Promise<PreviousConnection[]> {
  const response = await fetch('/api/discover/previous-connections', {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch previous connections')
  }

  const data = await response.json()
  return data.connections
}