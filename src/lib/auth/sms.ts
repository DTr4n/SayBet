import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export class SMSService {
  static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  static async sendVerificationCode(phoneNumber: string, code: string): Promise<void> {
    // Development mode: Skip actual SMS sending if no verified Twilio setup
    if (process.env.NODE_ENV === 'development' || !process.env.TWILIO_VERIFIED) {
      console.log('📱 DEVELOPMENT: Verification code is:', code)
      console.log('⚙️  To enable real SMS: Set TWILIO_VERIFIED=true in .env.local')
      return
    }
    
    console.log('Twilio Phone Number:', process.env.TWILIO_PHONE_NUMBER)
    console.log('Twilio Account SID:', process.env.TWILIO_ACCOUNT_SID?.substring(0, 10) + '...')
    console.log('Twilio Auth Token present:', !!process.env.TWILIO_AUTH_TOKEN)
    
    try {
      console.log('Creating Twilio message...')
      const message = await client.messages.create({
        body: `Your SayBet verification code is: ${code}. This code will expire in 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      })

      console.log(`SMS sent successfully!`)
      console.log('Message SID:', message.sid)
      console.log('Message Status:', message.status)
      console.log('Message Direction:', message.direction)
    } catch (error) {
      console.error('=== TWILIO ERROR ===')
      console.error('Error details:', error)
      if (error.code) {
        console.error('Twilio Error Code:', error.code)
      }
      if (error.moreInfo) {
        console.error('More Info:', error.moreInfo)
      }
      throw new Error('Failed to send verification code')
    }
  }

  static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '')
    
    // Add country code if not present (assuming US)
    if (digits.length === 10) {
      return `+1${digits}`
    } else if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`
    } else if (digits.startsWith('+')) {
      return phoneNumber
    }
    
    return `+${digits}`
  }

  static validatePhoneNumber(phoneNumber: string): boolean {
    const formatted = this.formatPhoneNumber(phoneNumber)
    // Basic validation for US phone numbers (can be extended for international)
    const phoneRegex = /^\+1[2-9]\d{9}$/
    return phoneRegex.test(formatted)
  }
}