import { NextRequest, NextResponse } from 'next/server'
import { UserService, FriendshipService } from '@/lib/database'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Get all people the user has hung out with before
    const previousConnections = await UserService.getPreviousConnections(user.id)

    // Get current friends to filter them out
    const friends = await UserService.getFriends(user.id)
    const friendIds = new Set(friends.map(friend => friend.id))

    // Get pending friend requests to filter those out too
    const [receivedRequests, sentRequests] = await Promise.all([
      FriendshipService.getFriendRequests(user.id),
      FriendshipService.getSentFriendRequests(user.id)
    ])
    
    const pendingRequestUserIds = new Set([
      ...receivedRequests.map(req => req.sender.id),
      ...sentRequests.map(req => req.receiver.id)
    ])

    // Filter out current friends and pending requests
    const discoverableConnections = previousConnections.filter(connection => 
      !friendIds.has(connection.id) && !pendingRequestUserIds.has(connection.id)
    )

    // Format the response with mutual friend counts
    const formattedConnections = await Promise.all(
      discoverableConnections.map(async (connection) => {
        const mutualFriendCount = await UserService.getMutualFriendCount(user.id, connection.id)
        
        return {
          id: connection.id,
          name: connection.name,
          phone: connection.phone,
          avatar: connection.avatar,
          mutualFriendCount,
        }
      })
    )

    return NextResponse.json({
      connections: formattedConnections,
      total: formattedConnections.length
    })
  } catch (error) {
    console.error('Get previous connections error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get previous connections' },
      { status: 500 }
    )
  }
}