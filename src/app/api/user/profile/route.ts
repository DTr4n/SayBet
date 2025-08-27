import { NextRequest, NextResponse } from 'next/server'
import { UserService, UpdateUserSchema } from '@/lib/database'
import { requireAuth } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    // Get current user from auth
    const currentUser = await requireAuth()

    const body = await request.json()
    const updateData = UpdateUserSchema.parse(body)

    // Update user profile
    const updatedUser = await UserService.updateUser(currentUser.id, updateData)

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        isVerified: updatedUser.isVerified,
        availabilityStatus: updatedUser.availabilityStatus,
      },
    })
  } catch (error) {
    console.error('Update profile error:', error)
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}