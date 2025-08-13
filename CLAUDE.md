# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (runs on http://localhost:3000)
- **Build for production**: `npm run build`
- **Start production server**: `npm start`
- **Lint code**: `npm run lint`

## Project Architecture

This is a Next.js 15 application with the following key architectural elements:

### Directory Structure
- **App Router**: Uses Next.js App Router with the `src/app/` directory
- **Route Groups**: Auth-related routes are organized under `src/app/(auth)/`
- **Component Library**: Shadcn/ui components in `src/components/ui/`
- **Custom Components**: Main components in `src/components/`
- **Utilities**: Helper functions and constants in `src/lib/`
- **Custom Hooks**: React hooks in `src/hooks/`

### Authentication System
- **NextAuth.js v5**: Beta version configured for AWS Cognito authentication
- **Session Strategy**: JWT-based sessions with 30-day expiration
- **Custom Configuration**: Split between `auth.config.ts` and `auth.ts` for environment compatibility
- **Protected Routes**: Authentication handled via route groups and middleware patterns
- **Session Extension**: Custom session interface includes `accessToken` and extended user properties
- **JWT Handling**: Decodes Cognito access tokens to extract user ID from `sub` claim

### UI Framework
- **Shadcn/ui**: Component system configured with "new-york" style
- **Tailwind CSS**: Utility-first CSS with custom configuration
- **Radix UI**: Headless component primitives for accessibility
- **Lucide Icons**: Icon library integration
- **CSS Variables**: Theming system using CSS custom properties

### Key Configuration Files
- **TypeScript**: Path aliases configured (`@/*` → `./src/*`)
- **ESLint**: Next.js TypeScript config with core web vitals
- **Tailwind**: Configured via PostCSS with component path aliases
- **Shadcn**: Component aliases for `@/components`, `@/lib/utils`, etc.

### Environment Variables Required
- `AUTH_COGNITO_ID`: AWS Cognito Client ID
- `AUTH_COGNITO_SECRET`: AWS Cognito Client Secret  
- `AUTH_COGNITO_ISSUER`: AWS Cognito Issuer URL
- `NODE_ENV`: Environment mode (affects auth security checks)

### Key Patterns
- **Component Structure**: Functional components with TypeScript interfaces
- **Styling**: Tailwind classes with `cn()` utility for conditional styling
- **Authentication Flow**: Cognito OAuth with PKCE/nonce in production
- **Type Safety**: Strict TypeScript configuration with Next.js plugin
- **Import Aliases**: Absolute imports using `@/` prefix for src directory