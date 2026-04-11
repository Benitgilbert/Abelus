import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create the supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // OPTIONAL: Using getUser() is more secure for Server-Side Logic
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // 1. Protect internal routes (but allow public print-portal)
  const protectedRoutes = ['/pos', '/inventory', '/market', '/financials', '/admin', '/management', '/print']
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route) && !pathname.startsWith('/print-portal')
  )

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Prevent logged in users from seeing login/register pages
  if (user && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/management', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth|upload|$).*)',
  ],
}
