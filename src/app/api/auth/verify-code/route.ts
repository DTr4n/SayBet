import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/database'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

const VerifyCodeSchema = z.object({
  phone: z.string().min(10, 'Phone number is required'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, code } = VerifyCodeSchema.parse(body)

    // Verify the code
    const user = await UserService.verifyUser({ phone, verificationCode: code })

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        phone: user.phone,
        isVerified: user.isVerified
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '7d' }
    )

    // Create the response with the token as an HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        isVerified: user.isVerified,
        availabilityStatus: user.availabilityStatus,
      },
    })

    // Set HTTP-only cookie for authentication
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Verify code error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}