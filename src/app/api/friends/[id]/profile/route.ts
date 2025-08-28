import { NextRequest, NextResponse } from 'next/server'
import { UserService, FriendshipService } from '@/lib/database'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/database/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: friendId } = await params

    // Verify friendship exists and is accepted
    const friendship = await FriendshipService.getFriendshipStatus(user.id, friendId)
    
    if (!friendship || friendship.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Friend not found or not connected' },
        { status: 404 }
      )
    }

    // Get friend's basic information
    const friend = await UserService.getUserById(friendId)
    
    if (!friend) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get friend's recent activities (as creator)
    const recentActivities = await prisma.activity.findMany({
      where: {
        creatorId: friendId,
        // Only show activities that the current user can see based on visibility rules
        OR: [
          { visibility: 'friends' },
          { visibility: 'previous' },
          { visibility: 'open' },
        ],
      },
      include: {
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Limit to last 10 activities
    })

    // Get activities where the friend participated (responded "in")
    const participatedActivities = await prisma.activity.findMany({
      where: {
        responses: {
          some: {
            userId: friendId,
            response: 'in',
          },
        },
        // Only show activities that the current user can see
        OR: [
          { creatorId: user.id }, // Current user's activities
          { visibility: 'friends' },
          { visibility: 'previous' },
          { visibility: 'open' },
        ],
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    })

    // Get shared activities (activities where both users participated)
    const sharedActivities = await prisma.activity.findMany({
      where: {
        AND: [
          {
            responses: {
              some: {
                userId: friendId,
                response: 'in',
              },
            },
          },
          {
            OR: [
              { creatorId: user.id },
              {
                responses: {
                  some: {
                    userId: user.id,
                    response: 'in',
                  },
                },
              },
            ],
          },
        ],
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    })

    const friendProfile = {
      id: friend.id,
      name: friend.name,
      phone: friend.phone,
      avatar: friend.avatar,
      availabilityStatus: friend.availabilityStatus,
      createdAt: friend.createdAt,
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        location: activity.location,
        date: activity.date,
        time: activity.time,
        category: activity.category,
        visibility: activity.visibility,
        createdAt: activity.createdAt,
        participantCount: activity.responses.filter(r => r.response === 'in').length + 1, // +1 for creator
        participants: activity.responses
          .filter(r => r.response === 'in')
          .map(r => ({
            id: r.user.id,
            name: r.user.name,
            avatar: r.user.avatar,
          })),
      })),
      participatedActivities: participatedActivities.map(activity => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        location: activity.location,
        date: activity.date,
        time: activity.time,
        category: activity.category,
        createdAt: activity.createdAt,
        creator: activity.creator,
        participantCount: activity.responses.filter(r => r.response === 'in').length + 1,
      })),
      sharedActivities: sharedActivities.map(activity => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        location: activity.location,
        date: activity.date,
        time: activity.time,
        category: activity.category,
        createdAt: activity.createdAt,
        creator: activity.creator,
        participantCount: activity.responses.filter(r => r.response === 'in').length + 1,
      })),
    }

    return NextResponse.json({
      profile: friendProfile,
    })
  } catch (error) {
    console.error('Get friend profile error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get friend profile' },
      { status: 500 }
    )
  }
}