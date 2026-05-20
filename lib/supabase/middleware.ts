import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Fallback if environment variables are not yet set or resolved in CI environment
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        '[Supabase Middleware] Warning: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables are missing! Gracefully passing request through.'
      )
      return supabaseResponse
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Do not delete this! It refreshes the session if expired.
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Route protection
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/profile') || request.nextUrl.pathname.startsWith('/play')
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login')

    if (isProtectedRoute && !user) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    if (isAuthRoute && user) {
      const url = request.nextUrl.clone()
      url.pathname = '/profile'
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error('[Supabase Middleware] Unexpected execution error:', error)
  }

  return supabaseResponse
}
