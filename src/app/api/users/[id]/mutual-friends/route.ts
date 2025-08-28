import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/database'
import { requireAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: otherUserId } = await params

    if (user.id === otherUserId) {
      return NextResponse.json(
        { error: 'Cannot get mutual friends with yourself' },
        { status: 400 }
      )
    }

    // Get mutual friends between current user and other user
    const mutualFriends = await UserService.getMutualFriends(user.id, otherUserId)
    const mutualFriendCount = mutualFriends.length

    return NextResponse.json({
      mutualFriends: mutualFriends.map(friend => ({
        id: friend.id,
        name: friend.name,
        avatar: friend.avatar,
        phone: friend.phone,
      })),
      count: mutualFriendCount,
    })
  } catch (error) {
    console.error('Get mutual friends error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get mutual friends' },
      { status: 500 }
    )
  }
}