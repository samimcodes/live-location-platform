import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
const AUTH_ROUTES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, Next internals, and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/socket.io') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get('accessToken')?.value ??
    request.headers.get('authorization')?.replace('Bearer ', '');

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isDashboardRoute = pathname.startsWith('/dashboard');

  let isValidToken = false;

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
      await jwtVerify(token, secret);
      isValidToken = true;
    } catch {
      isValidToken = false;
    }
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isValidToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect dashboard routes
  if (isDashboardRoute && !isValidToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
