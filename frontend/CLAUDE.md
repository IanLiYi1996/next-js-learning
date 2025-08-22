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
- **Blog System**: Blog routes organized under `src/app/blog/` with dynamic `[slug]` pages
- **Component Library**: Shadcn/ui components in `src/components/ui/`
- **Custom Components**: Main components in `src/components/`
- **Blog Components**: Blog-specific components in `src/components/blog/`
- **Content**: Blog markdown files stored in `/content/blog/`
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
- **Tailwind Typography**: Enhanced typography styles for blog content using `prose` classes
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
- **Client/Server Split**: Clear separation between server components and client components

### Blog System
- **Markdown Content**: Blog posts stored as markdown files with frontmatter metadata
- **Dynamic Routes**: Blog posts accessed via dynamic `[slug]` routing
- **Metadata Support**: Title, date, tags, category, and description supported
- **React Portal**: Advanced technique for fixed UI elements using createPortal
- **Sticky Table of Contents**: Fixed position TOC that follows page scroll
- **Reading Progress**: Visual indicator of reading position
- **Mobile Adaptation**: Responsive design with drawer-style TOC on mobile
- **Auto-highlighting**: Active section highlighting in the TOC