import { NextRequest, NextResponse } from 'next/server'
import { ActivityService } from '@/lib/database'
import { requireAuth } from '@/lib/auth'
import { UpdateActivitySchema } from '@/lib/database/schema'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const activity = await ActivityService.getActivityById(id)

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      activity: {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        location: activity.location,
        date: activity.date,
        time: activity.time,
        category: activity.category,
        visibility: activity.visibility,
        maxParticipants: activity.maxParticipants,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
        creator: {
          id: activity.creator.id,
          name: activity.creator.name,
          avatar: activity.creator.avatar,
        },
        responses: activity.responses.map(response => ({
          id: response.id,
          response: response.response,
          createdAt: response.createdAt,
          user: {
            id: response.user.id,
            name: response.user.name,
            avatar: response.user.avatar,
          },
        })),
      },
    })
  } catch (error) {
    console.error('Get activity error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get activity' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await request.json()

    // Validate the request body
    const validatedData = UpdateActivitySchema.parse(body)

    const activity = await ActivityService.updateActivity(id, user.id, validatedData)

    return NextResponse.json({
      activity: {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        location: activity.location,
        date: activity.date,
        time: activity.time,
        category: activity.category,
        visibility: activity.visibility,
        maxParticipants: activity.maxParticipants,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
        creator: {
          id: activity.creator.id,
          name: activity.creator.name,
          avatar: activity.creator.avatar,
        },
        responses: activity.responses.map(response => ({
          id: response.id,
          response: response.response,
          createdAt: response.createdAt,
          user: {
            id: response.user.id,
            name: response.user.name,
            avatar: response.user.avatar,
          },
        })),
      },
    })
  } catch (error) {
    console.error('Update activity error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message === 'Activity not found or unauthorized') {
      return NextResponse.json(
        { error: 'Activity not found or unauthorized' },
        { status: 404 }
      )
    }

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid activity data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update activity' },
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

    await ActivityService.deleteActivity(id, user.id)

    return NextResponse.json(
      { message: 'Activity deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete activity error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message === 'Activity not found or unauthorized') {
      return NextResponse.json(
        { error: 'Activity not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete activity' },
      { status: 500 }
    )
  }
}