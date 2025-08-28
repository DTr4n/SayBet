import { NextRequest, NextResponse } from 'next/server'
import { UserService, FriendshipService } from '@/lib/database'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const SearchSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { phone } = SearchSchema.parse(body)

    // Search for user by phone
    const foundUser = await UserService.getUserByPhone(phone)

    if (!foundUser) {
      return NextResponse.json(
        { error: 'User not found with this phone number' },
        { status: 404 }
      )
    }

    if (foundUser.id === user.id) {
      return NextResponse.json(
        { error: 'Cannot search for yourself' },
        { status: 400 }
      )
    }

    // Check if friendship already exists
    const existingFriendship = await FriendshipService.getFriendshipStatus(user.id, foundUser.id)

    let relationshipStatus: 'none' | 'pending' | 'accepted' | 'blocked' = 'none'
    if (existingFriendship) {
      relationshipStatus = existingFriendship.status as 'pending' | 'accepted' | 'blocked'
    }

    // Get mutual friend count
    const mutualFriendCount = await UserService.getMutualFriendCount(user.id, foundUser.id)

    return NextResponse.json({
      user: {
        id: foundUser.id,
        name: foundUser.name,
        phone: foundUser.phone,
        avatar: foundUser.avatar,
        relationshipStatus,
        mutualFriendCount,
      },
    })
  } catch (error) {
    console.error('User search error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to search for user' },
      { status: 500 }
    )
  }
}