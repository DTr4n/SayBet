import { NextRequest, NextResponse } from 'next/server'
import { FriendshipService } from '@/lib/database'
import { requireAuth } from '@/lib/auth'
import { CreateFriendshipSchema } from '@/lib/database/schema'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'received' | 'sent'

    let friendRequests
    if (type === 'sent') {
      friendRequests = await FriendshipService.getSentFriendRequests(user.id)
    } else {
      friendRequests = await FriendshipService.getFriendRequests(user.id)
    }

    return NextResponse.json({
      friendRequests: friendRequests.map(request => ({
        id: request.id,
        status: request.status,
        createdAt: request.createdAt,
        sender: 'sender' in request && request.sender ? {
          id: request.sender.id,
          name: request.sender.name,
          phone: request.sender.phone,
          avatar: request.sender.avatar,
        } : (type === 'sent' ? {
          id: user.id,
          name: user.name,
          phone: user.phone,
          avatar: user.avatar,
        } : undefined),
        receiver: 'receiver' in request && request.receiver ? {
          id: request.receiver.id,
          name: request.receiver.name,
          phone: request.receiver.phone,
          avatar: request.receiver.avatar,
        } : undefined,
      })),
    })
  } catch (error) {
    console.error('Get friend requests error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get friend requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const validatedData = CreateFriendshipSchema.parse(body)
    const friendship = await FriendshipService.sendFriendRequest(user.id, validatedData)

    return NextResponse.json({
      friendship: {
        id: friendship.id,
        status: friendship.status,
        createdAt: friendship.createdAt,
        sender: {
          id: friendship.sender.id,
          name: friendship.sender.name,
          phone: friendship.sender.phone,
          avatar: friendship.sender.avatar,
        },
        receiver: {
          id: friendship.receiver.id,
          name: friendship.receiver.name,
          phone: friendship.receiver.phone,
          avatar: friendship.receiver.avatar,
        },
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Send friend request error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && (
      error.message === 'User not found with this phone number' ||
      error.message === 'Cannot send friend request to yourself' ||
      error.message === 'Friendship already exists'
    )) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send friend request' },
      { status: 500 }
    )
  }
}