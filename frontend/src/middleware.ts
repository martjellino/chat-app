// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add paths that don't require authentication
const publicPaths = ['/login', '/register'];

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Get the token from cookies
  const sessionCookie = request.cookies.get('session');

  // If the path is public and user is logged in, redirect to /chat
  if (isPublicPath && sessionCookie) {
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  // If the path is private and user is not logged in, redirect to /login
  if (!isPublicPath && !sessionCookie) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    
    // Add ?from= parameter to redirect back after login
    response.cookies.delete('session');
    return response;
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
    matcher: [
      "/((?!.+\\.[\\w]+$|_next).*)",
      "/",
      "/(api|trpc)(.*)",
      "/chat",
    ],
  };