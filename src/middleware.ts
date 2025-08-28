import { NextRequest, NextResponse } from 'next/server'
// import jwt from 'jsonwebtoken' // TODO: Re-enable when authentication middleware is restored

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for all API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // TEMPORARILY DISABLE AUTH CHECK FOR DEVELOPMENT
  return NextResponse.next()

  // // Public routes that don't require authentication
  // const publicRoutes = ['/auth']
  
  // // Check if the current path is a public route
  // const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // if (isPublicRoute) {
  //   return NextResponse.next()
  // }

  // // Get the auth token from cookies
  // const token = request.cookies.get('auth-token')?.value

  // if (!token) {
  //   // Redirect to auth page if no token
  //   console.log('Middleware: No token found, redirecting to auth')
  //   return NextResponse.redirect(new URL('/auth', request.url))
  // }

  // try {
  //   // Verify the JWT token
  //   jwt.verify(token, process.env.NEXTAUTH_SECRET!)
  //   console.log('Middleware: Token valid, allowing access to', pathname)
  //   return NextResponse.next()
  // } catch (error) {
  //   // Redirect to auth page if token is invalid
  //   console.log('Middleware: Token invalid:', error instanceof Error ? error.message : 'Unknown error')
  //   return NextResponse.redirect(new URL('/auth', request.url))
  // }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}