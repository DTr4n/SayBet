'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { Phone, MessageSquare, ArrowRight, Loader2 } from 'lucide-react'

type AuthStep = 'phone' | 'code'

export default function AuthForm() {
  const [step, setStep] = useState<AuthStep>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [codeSent, setCodeSent] = useState(false)

  const router = useRouter()
  const { sendCode, login } = useAuth()

  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 10) {
      setPhone(value)
    }
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    setLoading(true)
    setError('')

    try {
      await sendCode(phone)
      setCodeSent(true)
      setStep('code')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Please enter the 6-digit verification code')
      return
    }

    setLoading(true)
    setError('')

    try {
      await login(phone, code)
      // Redirect to home page after successful login
      window.location.href = '/'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify code')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setLoading(true)
    setError('')

    try {
      await sendCode(phone)
      setCode('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to SayBet</h1>
            <p className="text-white/70">
              {step === 'phone' 
                ? 'Enter your phone number to get started' 
                : 'Enter the verification code sent to your phone'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {step === 'phone' && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-white/80 text-sm font-medium mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    id="phone"
                    type="tel"
                    value={formatPhoneDisplay(phone)}
                    onChange={handlePhoneChange}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'code' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-white/80 text-sm mb-2">
                  Code sent to {formatPhoneDisplay(phone)}
                </p>
                <button
                  onClick={() => setStep('phone')}
                  className="text-blue-300 hover:text-blue-200 text-sm underline"
                >
                  Change number
                </button>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div>
                  <label htmlFor="code" className="block text-white/80 text-sm font-medium mb-2">
                    Verification Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center">
                <p className="text-white/60 text-sm mb-2">Didn't receive a code?</p>
                <button
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-blue-300 hover:text-blue-200 text-sm underline disabled:opacity-50"
                >
                  Resend Code
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-white/60 text-xs text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy.
              Standard message and data rates may apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}