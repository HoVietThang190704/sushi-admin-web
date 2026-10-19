import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const isAuthenticated = Boolean(accessToken || refreshToken);

  const isAuthPage = pathname === '/';
  const isDashboardPage = pathname.startsWith('/dashboard');

  // 1. Chưa đăng nhập mà cố vào Dashboard -> Đẩy về trang Login (Server-side redirect)
  if (isDashboardPage && !isAuthenticated) {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Đã đăng nhập mà cố vào trang Login -> Đẩy thẳng vào Dashboard
  if (isAuthPage && isAuthenticated) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
