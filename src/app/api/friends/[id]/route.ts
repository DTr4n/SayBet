import { NextRequest, NextResponse } from 'next/server'
import { FriendshipService } from '@/lib/database'
import { requireAuth } from '@/lib/auth'
import { UpdateFriendshipSchema } from '@/lib/database/schema'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await request.json()

    const validatedData = UpdateFriendshipSchema.parse(body)
    const friendship = await FriendshipService.respondToFriendRequest(id, user.id, validatedData)

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
    })
  } catch (error) {
    console.error('Respond to friend request error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message === 'Friend request not found or unauthorized') {
      return NextResponse.json(
        { error: 'Friend request not found or unauthorized' },
        { status: 404 }
      )
    }

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to respond to friend request' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    await FriendshipService.removeFriend(id, user.id)

    return NextResponse.json(
      { message: 'Friend removed successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Remove friend error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message === 'Friendship not found or unauthorized') {
      return NextResponse.json(
        { error: 'Friendship not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to remove friend' },
      { status: 500 }
    )
  }
}