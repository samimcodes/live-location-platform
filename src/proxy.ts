import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const AUTH_ROUTES = ['/login', '/register'];
const DASHBOARD_PREFIX = '/dashboard';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API, Next internals, static files, socket
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/socket.io') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Get token from cookie or header
  const token =
    request.cookies.get('accessToken')?.value ??
    request.headers.get('authorization')?.replace('Bearer ', '');

  let isValidToken = false;

  if (token) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET ?? 'fallback_secret'
      );
      await jwtVerify(token, secret);
      isValidToken = true;
    } catch {
      isValidToken = false;
    }
  }

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isDashboard = pathname.startsWith(DASHBOARD_PREFIX);

  // Logged-in users → redirect away from login/register
  if (isAuthRoute && isValidToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protected routes → redirect to login
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
