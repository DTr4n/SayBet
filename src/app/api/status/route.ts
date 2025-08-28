import { NextRequest, NextResponse } from 'next/server'
import { StatusUpdateService } from '@/lib/database'
import { requireAuth } from '@/lib/auth'
import { CreateStatusUpdateSchema } from '@/lib/database/schema'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const validatedData = CreateStatusUpdateSchema.parse(body)
    
    const statusUpdate = await StatusUpdateService.createStatusUpdate(
      user.id,
      validatedData.status,
      validatedData.message
    )

    return NextResponse.json({
      statusUpdate: {
        id: statusUpdate.id,
        status: statusUpdate.status,
        message: statusUpdate.message,
        createdAt: statusUpdate.createdAt,
        user: statusUpdate.user,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Create status update error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid status update data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create status update' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'my' | 'friends'
    
    let statusUpdates
    if (type === 'friends') {
      statusUpdates = await StatusUpdateService.getFriendsStatusUpdates(user.id)
    } else {
      statusUpdates = await StatusUpdateService.getRecentStatusUpdates(user.id)
    }

    return NextResponse.json({
      statusUpdates: statusUpdates.map(update => ({
        id: update.id,
        status: update.status,
        message: update.message,
        createdAt: update.createdAt,
        user: update.user,
      })),
    })
  } catch (error) {
    console.error('Get status updates error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get status updates' },
      { status: 500 }
    )
  }
}