'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import AuthForm from '@/components/AuthForm'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function AuthPage() {
  const { user, loading } = useAuth()
  const router = useRouter()


  // useEffect(() => {
  //   // Redirect authenticated users to home page (only once)
  //   if (!loading && user) {
  //     console.log('AuthPage: User authenticated, redirecting to home')
  //     // Use setTimeout to prevent immediate redirect loop
  //     setTimeout(() => {
  //       window.location.href = '/'
  //     }, 100)
  //   }
  // }, [user, loading])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // If user is authenticated, show go to home button
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-4">You're already signed in!</h1>
          <p className="text-white/70 mb-6">Welcome back, {user.name || user.phone}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200"
          >
            <span>Go to Home</span>
          </button>
        </div>
      </div>
    )
  }

  return <AuthForm />
}