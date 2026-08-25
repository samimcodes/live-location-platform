import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Routes where authenticated users should be redirected away to /dashboard
const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

const DASHBOARD_PREFIX = '/dashboard';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API calls, Next.js internals, static files, and socket path
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/socket.io') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Read token: httpOnly cookie first, then Authorization header
  const token =
    request.cookies.get('accessToken')?.value ??
    request.headers.get('authorization')?.replace('Bearer ', '');

  let isValidToken = false;

  if (token) {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        isValidToken = false;
      } else {
        await jwtVerify(token, new TextEncoder().encode(secret));
        isValidToken = true;
      }
    } catch {
      isValidToken = false;
    }
  }

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isDashboard = pathname.startsWith(DASHBOARD_PREFIX);

  // Logged-in users → redirect away from login / register / forgot-password
  if (isAuthRoute && isValidToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protected dashboard routes → redirect to login with ?from= for post-login redirect
  if (isDashboard && !isValidToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
