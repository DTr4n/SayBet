import { NextRequest, NextResponse } from 'next/server'
import { ActivityService } from '@/lib/database'
import { requireAuth } from '@/lib/auth'
import { CreateActivityResponseSchema } from '@/lib/database/schema'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const responses = await ActivityService.getActivityResponses(id)

    return NextResponse.json({
      responses: responses.map(response => ({
        id: response.id,
        response: response.response,
        createdAt: response.createdAt,
        user: {
          id: response.user.id,
          name: response.user.name,
          avatar: response.user.avatar,
        },
      })),
    })
  } catch (error) {
    console.error('Get activity responses error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get activity responses' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await request.json()

    // Validate the request body and ensure activityId matches the route
    const validatedData = CreateActivityResponseSchema.parse({
      ...body,
      activityId: id,
    })

    const response = await ActivityService.respondToActivity(user.id, validatedData)

    return NextResponse.json({
      response: {
        id: response.id,
        response: response.response,
        createdAt: response.createdAt,
        user: {
          id: response.user.id,
          name: response.user.name,
          avatar: response.user.avatar,
        },
        activity: {
          id: response.activity.id,
          title: response.activity.title,
        },
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Create activity response error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid response data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create activity response' },
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

    await ActivityService.removeActivityResponse(user.id, id)

    return NextResponse.json(
      { message: 'Activity response removed successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Remove activity response error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to remove activity response' },
      { status: 500 }
    )
  }
}