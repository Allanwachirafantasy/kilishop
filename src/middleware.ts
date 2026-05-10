import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for Next.js internal RSC/prefetch requests to prevent fetch failures
  const isRSCRequest =
    request.headers.get('RSC') === '1' ||
    request.headers.get('Next-Router-Prefetch') === '1' ||
    request.nextUrl.searchParams.has('_rsc');

  if (isRSCRequest) {
    return NextResponse.next({ request });
  }

  // Redirect root to homepage (no auth needed)
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/homepage';
    return NextResponse.redirect(url);
  }

  // Only run Supabase auth for protected routes
  const isProtectedRoute =
    pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

  if (!isProtectedRoute) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser();

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Check role from user_profiles table
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = profile?.role ||
        user.user_metadata?.role ||
        user.app_metadata?.role ||
        'customer';

      if (role !== 'admin') {
        const url = request.nextUrl.clone();
        url.pathname = '/homepage';
        return NextResponse.redirect(url);
      }
    } catch {
      // If DB check fails, fall back to metadata role
      const role = user.user_metadata?.role || user.app_metadata?.role || 'customer';
      if (role !== 'admin') {
        const url = request.nextUrl.clone();
        url.pathname = '/homepage';
        return NextResponse.redirect(url);
      }
    }
  }

  // Protect customer dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
