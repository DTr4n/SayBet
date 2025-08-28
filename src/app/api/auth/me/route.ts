import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/database'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token' },
        { status: 401 }
      )
    }

    // Check if NEXTAUTH_SECRET is set
    if (!process.env.NEXTAUTH_SECRET) {
      console.error('NEXTAUTH_SECRET environment variable is not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET) as {
      userId: string
      phone: string
      isVerified: boolean
    }

    // Get current user data
    const user = await UserService.getUserById(decoded.userId)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        avatar: user.avatar,
        isVerified: user.isVerified,
        availabilityStatus: user.availabilityStatus,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('Get current user error:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get user data' },
      { status: 500 }
    )
  }
}