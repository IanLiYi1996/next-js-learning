# Next.js Learning Project

A full-stack application demonstrating modern web development with Next.js frontend and AWS infrastructure deployment using CDK.

## 🏗️ Project Structure

This project is organized as a monorepo with clear separation of concerns:

```
next-js-learning/
├── frontend/           # Next.js application
│   ├── src/           # Application source code
│   ├── public/        # Static assets
│   ├── content/       # Blog content
│   ├── Dockerfile     # Container configuration
│   └── README.md      # Frontend documentation
├── infrastructure/    # AWS CDK infrastructure code
│   ├── lib/          # CDK stack definitions
│   ├── bin/          # CDK app entry point
│   └── README.md     # Infrastructure documentation
└── README.md         # This file
```

## 🚀 Quick Start

### Frontend Development

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Configure your environment variables
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).

### Infrastructure Deployment

```bash
cd infrastructure
npm install
npm run bootstrap  # First time only
npm run deploy
```

## 🔧 Technologies Used

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library
- **NextAuth.js v5** - Authentication library
- **AWS Cognito** - User management and authentication
- **Amazon Bedrock** - AI/ML services
- **Framer Motion** - Animation library

### Infrastructure
- **AWS CDK (TypeScript)** - Infrastructure as Code
- **Amazon ECS Fargate** - Containerized application hosting
- **Application Load Balancer** - Traffic routing and SSL termination
- **Amazon CloudFront** - Global CDN and caching
- **Amazon Cognito** - User authentication
- **AWS Secrets Manager** - Secure credential storage
- **Amazon VPC** - Network isolation and security

## 📋 Features

### 🎯 Core Features
- **User Authentication**: Complete auth flow with AWS Cognito
- **AI Chat Interface**: Integration with Amazon Bedrock and OpenAI
- **Blog System**: Markdown-based blog with dynamic routing
- **Responsive Design**: Mobile-first responsive layout
- **Dark/Light Theme**: Theme switching capability

### 🛡️ Security Features
- **JWT-based Sessions**: Secure session management
- **Protected Routes**: Automatic authentication checks
- **Custom Headers**: CloudFront to ALB security
- **Secrets Management**: AWS Secrets Manager integration
- **Network Security**: VPC with private subnets

### 🚀 Production Features
- **Containerized Deployment**: Docker-based deployment
- **Auto Scaling**: ECS Fargate with automatic scaling
- **Health Checks**: Application and infrastructure monitoring
- **CDN**: Global content delivery via CloudFront
- **SSL/TLS**: Automatic HTTPS enforcement

## 🏃‍♂️ Getting Started

### Prerequisites

- **Node.js** 18.x or later
- **Docker** (for local container testing)
- **AWS CLI** configured with appropriate permissions
- **AWS CDK** installed globally (`npm install -g aws-cdk`)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd next-js-learning
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.local.example .env.local
   # Configure environment variables
   ```

3. **Setup Infrastructure**
   ```bash
   cd ../infrastructure
   npm install
   ```

### Development Workflow

1. **Frontend Development**
   ```bash
   cd frontend
   npm run dev     # Start development server
   npm run build   # Build for production
   npm run lint    # Run linting
   ```

2. **Infrastructure Management**
   ```bash
   cd infrastructure
   npm run diff    # Preview changes
   npm run deploy  # Deploy to AWS
   npm run destroy # Clean up resources
   ```

## 🎛️ Configuration

### Frontend Configuration

Key environment variables in `frontend/.env.local`:

```bash
# Authentication
AUTH_SECRET=your_32_character_secret
AUTH_COGNITO_ID=your_cognito_client_id
AUTH_COGNITO_SECRET=your_cognito_client_secret
AUTH_COGNITO_ISSUER=your_cognito_issuer_url

# AI Services
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
OPENAI_API_KEY=your_openai_key  # Optional
```

### Infrastructure Configuration

Modify `infrastructure/config.ts` for:
- Resource sizing (CPU, memory)
- Network configuration (VPC CIDR)
- Stack naming and tagging
- Security settings

## 🚀 Deployment Guide

### Local Development
```bash
# Terminal 1: Frontend
cd frontend && npm run dev

# Terminal 2: Infrastructure (optional)
cd infrastructure && npm run synth
```

### Production Deployment
```bash
# 1. Deploy infrastructure
cd infrastructure
npm run bootstrap  # First time only
npm run deploy

# 2. Update Cognito settings with CloudFront URL (manual step)
# 3. Frontend is automatically deployed via ECS
```

## 🔍 Monitoring & Troubleshooting

### Logs
- **ECS Logs**: CloudWatch `/aws/ecs/NextJSApp-container`
- **ALB Access Logs**: CloudWatch (if enabled)
- **CDK Deployment**: Local terminal output

### Health Checks
- **Application**: `https://your-domain.com/api/health`
- **Load Balancer**: AWS Console → EC2 → Target Groups
- **ECS Service**: AWS Console → ECS → Services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use conventional commit messages
- Update documentation for new features
- Add tests for new functionality
- Ensure security best practices

## 📚 Documentation

- [Frontend Documentation](./frontend/README.md) - Next.js application details
- [Infrastructure Documentation](./infrastructure/README.md) - AWS CDK deployment guide

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **AWS CDK**: [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- **Next.js**: [Next.js Documentation](https://nextjs.org/docs)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ using Next.js and AWS CDK
</p>
