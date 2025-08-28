import { NextRequest, NextResponse } from 'next/server'
import { ActivityService } from '@/lib/database'
import { requireAuth } from '@/lib/auth'
import { CreateActivitySchema } from '@/lib/database/schema'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    
    // Extract filter parameters
    const filters = {
      category: searchParams.get('category'), // 'spontaneous' | 'planned'
      visibility: searchParams.get('visibility'), // 'friends' | 'previous' | 'open'
      creatorType: searchParams.get('creatorType'), // 'me' | 'friends' | 'connections'
      participationStatus: searchParams.get('participationStatus'), // 'participating' | 'not_participating'
    }
    
    const activities = await ActivityService.getActivitiesForUser(user.id, filters)

    return NextResponse.json({
      activities: activities.map(activity => ({
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
      })),
    })
  } catch (error) {
    console.error('Get activities error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get activities' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    // Transform and validate the request body
    const transformedBody = {
      ...body,
      date: body.date ? new Date(body.date) : undefined,
    }
    
    const validatedData = CreateActivitySchema.parse(transformedBody)

    const activity = await ActivityService.createActivity(user.id, validatedData)

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
    }, { status: 201 })
  } catch (error) {
    console.error('Create activity error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid activity data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    )
  }
}