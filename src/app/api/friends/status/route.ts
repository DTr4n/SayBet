import { NextRequest, NextResponse } from 'next/server'
import { StatusUpdateService } from '@/lib/database'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const friendsStatus = await StatusUpdateService.getFriendsCurrentStatus(user.id)

    return NextResponse.json({
      friends: friendsStatus.map(friend => ({
        id: friend.id,
        name: friend.name,
        avatar: friend.avatar,
        availabilityStatus: friend.availabilityStatus,
        statusMessage: friend.statusMessage,
        lastUpdated: friend.updatedAt,
      })),
    })
  } catch (error) {
    console.error('Get friends status error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get friends status' },
      { status: 500 }
    )
  }
}