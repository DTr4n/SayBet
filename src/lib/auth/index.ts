import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { UserService } from '@/lib/database'

export interface AuthUser {
  id: string
  phone: string
  name?: string | null
  avatar?: string | null
  isVerified: boolean
  availabilityStatus: string
}

export async function getServerSession(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
      userId: string
      phone: string
      isVerified: boolean
    }

    // Get current user data
    const user = await UserService.getUserById(decoded.userId)

    if (!user) {
      return null
    }

    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      avatar: user.avatar,
      isVerified: user.isVerified,
      availabilityStatus: user.availabilityStatus,
    }
  } catch (error) {
    console.error('Get server session error:', error)
    return null
  }
}

export async function requireAuth(): Promise<AuthUser> {
  // DEVELOPMENT MODE: Return mock user for testing
  if (process.env.NODE_ENV === 'development') {
    return {
      id: 'cmeui1jgv0003ro4if40284zp', // Use existing user ID from seed data
      phone: '+1234567890',
      name: 'Dev User (Bob Smith)',
      avatar: null,
      isVerified: true,
      availabilityStatus: 'available'
    }
  }

  const user = await getServerSession()
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

export function isValidPhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // Basic validation for US phone numbers (10 digits)
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))
}