import { NextRequest, NextResponse } from 'next/server'
import { SMSService } from '@/lib/auth/sms'
import { UserService } from '@/lib/database'
import { z } from 'zod'

const SendCodeSchema = z.object({
  phone: z.string().min(10, 'Phone number is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = SendCodeSchema.parse(body)

    // Format and validate phone number
    const formattedPhone = SMSService.formatPhoneNumber(phone)
    
    if (!SMSService.validatePhoneNumber(formattedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Generate verification code
    const verificationCode = SMSService.generateVerificationCode()

    // Store verification code in database
    await UserService.setVerificationCode(formattedPhone, verificationCode)

    // Send SMS
    await SMSService.sendVerificationCode(formattedPhone, verificationCode)

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
    })
  } catch (error) {
    console.error('Send code error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}