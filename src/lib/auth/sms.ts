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
    try {
      const message = await client.messages.create({
        body: `Your SayBet verification code is: ${code}. This code will expire in 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      })

      console.log(`SMS sent successfully. SID: ${message.sid}`)
    } catch (error) {
      console.error('Failed to send SMS:', error)
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