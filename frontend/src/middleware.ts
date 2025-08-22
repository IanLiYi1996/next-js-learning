import { auth } from './app/(auth)/auth';

export default auth;

export const config = {
  // Match all request paths except for the ones starting with:
  // - api/auth (NextAuth API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};