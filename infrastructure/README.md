# Next.js AWS Infrastructure with CDK

This project contains AWS CDK (Cloud Development Kit) code to deploy a Next.js application with Cognito authentication, ECS Fargate, Application Load Balancer, and CloudFront distribution.

## Architecture Overview

The infrastructure creates the following AWS resources:

- **Amazon Cognito**: User Pool and User Pool Client for authentication
- **Amazon VPC**: Virtual Private Cloud with public and private subnets
- **Amazon ECS**: Fargate cluster running the Next.js application
- **Application Load Balancer**: Routes traffic to ECS tasks with custom header validation
- **Amazon CloudFront**: CDN distribution for global content delivery
- **AWS Secrets Manager**: Stores authentication secrets securely
- **IAM Roles**: Provides necessary permissions for Bedrock access

## Prerequisites

1. **AWS CLI** configured with appropriate permissions
2. **Node.js** 18.x or later
3. **Docker** installed and running
4. **AWS CDK CLI** installed globally:
   ```bash
   npm install -g aws-cdk
   ```

## Required AWS Permissions

Your AWS user/role needs permissions for:
- VPC, EC2, and networking resources
- ECS Fargate and container services
- Cognito User Pools
- CloudFront distributions
- Application Load Balancers
- Secrets Manager
- IAM role creation
- ECR repository access

## Setup Instructions

### 1. Install Dependencies

Navigate to the infrastructure directory and install dependencies:

```bash
cd infrastructure
npm install
```

### 2. Configure Environment

Set your AWS region and account (optional):

```bash
export CDK_DEFAULT_REGION=us-east-1
export CDK_DEFAULT_ACCOUNT=123456789012
```

### 3. Bootstrap CDK (First-time setup)

If this is your first time using CDK in this AWS account/region:

```bash
npm run bootstrap
```

### 4. Build the CDK Application

```bash
npm run build
```

### 5. Review Infrastructure Changes

Before deploying, review what resources will be created:

```bash
npm run diff
```

### 6. Deploy the Infrastructure

Deploy the complete stack:

```bash
npm run deploy
```

The deployment will take approximately 10-15 minutes. You'll be prompted to confirm the creation of IAM resources.

## Post-Deployment Configuration

After successful deployment, you'll see outputs including:

- CloudFront Distribution URL
- Cognito User Pool ID
- Cognito Client ID
- Load Balancer DNS Name

### 1. Update Cognito Callback URLs

You need to update the Cognito User Pool Client with the actual CloudFront URL:

1. Go to AWS Cognito Console
2. Find your User Pool (`NextJSApp-user-pool`)
3. Go to "App integration" → "App clients and analytics"
4. Edit the app client
5. Update callback URLs to include:
   - `https://YOUR_CLOUDFRONT_DOMAIN/api/auth/callback/cognito`
6. Update logout URLs to include:
   - `https://YOUR_CLOUDFRONT_DOMAIN`

### 2. Update Your Application Environment

Update your local `.env.local` file with the deployed resources:

```bash
# Copy these values from CDK outputs
AUTH_COGNITO_ID=your_deployed_cognito_client_id
AUTH_COGNITO_SECRET=your_deployed_cognito_client_secret
AUTH_COGNITO_ISSUER=your_deployed_cognito_issuer_url

# Generate a new AUTH_SECRET
AUTH_SECRET=your_32_character_random_string

# AWS Configuration (if running locally)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### 3. Test the Deployment

1. Visit your CloudFront URL
2. The application should redirect to the Cognito login page
3. Create a new account or login with existing credentials
4. Verify the application loads correctly after authentication

## Monitoring and Troubleshooting

### CloudWatch Logs

The ECS service logs to CloudWatch. You can find logs at:
- Log Group: `/aws/ecs/NextJSApp-container`

### Health Checks

The infrastructure includes health checks at multiple levels:
- ECS task health check: `http://localhost:3000/api/health`
- ALB target group health check: `/api/health`

### Common Issues

1. **ECS Service Failing to Start**
   - Check CloudWatch logs for container errors
   - Verify environment variables are correctly set
   - Ensure Docker image builds successfully

2. **Authentication Not Working**
   - Verify Cognito callback URLs are correctly configured
   - Check that AUTH_SECRET matches between deployment and application
   - Ensure COGNITO_CLIENT_SECRET is properly retrieved from Secrets Manager

3. **CloudFront 403 Errors**
   - Verify the custom header configuration matches between CloudFront and ALB
   - Check ALB listener rules are correctly configured

## Customization

### Modify Resource Configuration

Edit `infrastructure/config.ts` to adjust:
- Stack naming
- Resource sizes (CPU, memory)
- VPC CIDR ranges
- Custom header values

### Environment-Specific Deployments

You can deploy multiple environments by using different stack names:

```bash
# Development
cdk deploy NextJSAppStack-dev

# Production
cdk deploy NextJSAppStack-prod
```

## Security Considerations

1. **Custom Headers**: CloudFront and ALB use custom headers to ensure traffic only flows through CloudFront
2. **Secrets Management**: Sensitive data (Cognito client secret, AUTH_SECRET) are stored in AWS Secrets Manager
3. **Network Security**: ECS tasks run in private subnets with security group restrictions
4. **IAM Least Privilege**: Task roles have minimal permissions for required AWS services

## Cost Optimization

- **Fargate**: Configured with minimal CPU (512) and memory (1024 MiB)
- **NAT Gateway**: Single NAT gateway across availability zones
- **CloudFront**: Price Class 100 (US, Canada, Europe)

## Cleanup

To destroy all resources and avoid ongoing charges:

```bash
npm run destroy
```

⚠️ **Warning**: This will permanently delete all resources including the Cognito User Pool and user data.

## Development Commands

```bash
# Build TypeScript
npm run build

# Watch for changes
npm run watch

# Run CDK diff
npm run diff

# Deploy stack
npm run deploy

# Destroy stack
npm run destroy

# Synthesize CloudFormation
npm run synth
```

## Support

For issues related to:
- **AWS CDK**: [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- **Next.js**: [Next.js Documentation](https://nextjs.org/docs)
- **AWS Cognito**: [Amazon Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- **ECS Fargate**: [Amazon ECS Documentation](https://docs.aws.amazon.com/ecs/)