import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      
      // Allow access to login page if not logged in
      if (isOnLogin && !isLoggedIn) {
        return true;
      }
      
      // If logged in and trying to access login page, redirect to home
      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl));
      }
      
      // For all other routes, require authentication
      return isLoggedIn;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
