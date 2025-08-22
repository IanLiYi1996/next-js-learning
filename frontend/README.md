# Next.js Learning - Frontend

This is the frontend application built with Next.js 15, featuring AWS Cognito authentication, AI chat functionality, and a blog system.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn package manager

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update the values in `.env.local` with your AWS Cognito configuration and API keys.

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── api/               # API routes
│   │   ├── blog/              # Blog pages
│   │   └── ...                # Other pages
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn/ui components
│   │   ├── blog/             # Blog-specific components
│   │   └── ...               # Other components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   └── stores/               # State management
├── content/                  # Blog content (Markdown)
├── public/                   # Static assets
└── ...                      # Configuration files
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔐 Authentication

The application uses **NextAuth.js v5** with AWS Cognito:

- **Provider**: AWS Cognito User Pool
- **Session Strategy**: JWT-based sessions
- **Session Duration**: 30 days
- **Protected Routes**: Automatic redirect to login for authenticated pages

### Environment Variables

Required environment variables for authentication:

```bash
AUTH_SECRET=your_32_character_random_string
AUTH_COGNITO_ID=your_cognito_client_id
AUTH_COGNITO_SECRET=your_cognito_client_secret
AUTH_COGNITO_ISSUER=your_cognito_issuer_url
```

## 🤖 AI Features

The application includes AI chat functionality with support for:

- **Amazon Bedrock**: AWS managed AI service
- **OpenAI**: Alternative AI provider
- **Agent System**: Multiple AI agents with different capabilities
- **Chat Sessions**: Persistent conversation history

### AI Configuration

```bash
# For Amazon Bedrock
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# For OpenAI (optional)
OPENAI_API_KEY=your_openai_api_key
```

## 📝 Blog System

The blog system features:

- **Markdown Content**: Blog posts written in Markdown with frontmatter
- **Dynamic Routes**: SEO-friendly URLs with `[slug]` routing
- **Table of Contents**: Auto-generated TOC with smooth scrolling
- **Reading Progress**: Visual progress indicator
- **Responsive Design**: Mobile-first responsive layout

### Adding Blog Posts

1. Create a new `.md` file in `content/blog/`
2. Add frontmatter metadata:
   ```markdown
   ---
   title: "Your Post Title"
   date: "2024-01-15"
   tags: ["nextjs", "react"]
   category: "tutorial"
   description: "Post description"
   ---
   
   Your markdown content here...
   ```

## 🎨 UI Framework

- **Shadcn/ui**: Modern component library
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless component primitives
- **Lucide React**: Icon library
- **Framer Motion**: Animation library

## 🐳 Docker Deployment

The application includes a multi-stage Dockerfile optimized for production:

```bash
# Build the Docker image
docker build -t nextjs-app .

# Run the container
docker run -p 3000:3000 nextjs-app
```

## 🔧 Configuration Files

- **`next.config.ts`**: Next.js configuration with standalone output
- **`tailwind.config.mjs`**: Tailwind CSS configuration
- **`tsconfig.json`**: TypeScript configuration with path aliases
- **`eslint.config.mjs`**: ESLint configuration
- **`components.json`**: Shadcn/ui component configuration

## 🚀 Deployment

This frontend is designed to be deployed using the AWS CDK infrastructure in the `../infrastructure` directory, which sets up:

- ECS Fargate for container orchestration
- Application Load Balancer for traffic routing
- CloudFront for global CDN
- Automatic SSL/TLS certificates

For local development and testing, you can also deploy to:

- **Vercel**: `npx vercel`
- **Netlify**: Connect your GitHub repository
- **AWS Amplify**: Connect your GitHub repository

## 🛠️ Development

### Code Organization

- **Server Components**: Default for better performance
- **Client Components**: Marked with `'use client'` directive
- **API Routes**: Located in `src/app/api/`
- **Middleware**: Authentication and routing in `src/middleware.ts`

### Best Practices

- Use TypeScript for type safety
- Follow Next.js App Router patterns
- Implement proper error boundaries
- Use proper loading states
- Optimize images with `next/image`
- Follow accessibility guidelines

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.