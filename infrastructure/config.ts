export interface StackConfig {
  readonly stackName: string;
  readonly customHeaderName: string;
  readonly customHeaderValue: string;
  readonly containerPort: number;
  readonly appName: string;
  readonly environment: string;
  readonly tags: Record<string, string>;
  readonly vpc: {
    readonly cidr: string;
    readonly maxAzs: number;
    readonly natGateways: number;
  };
  readonly ecs: {
    readonly cpu: number;
    readonly memoryLimitMiB: number;
  };
}

// Generate a random custom header value for security
const generateCustomHeaderValue = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const config: StackConfig = {
  stackName: 'NextJSApp',
  customHeaderName: 'X-CloudFront-Custom-Header',
  customHeaderValue: process.env.CUSTOM_HEADER_VALUE || generateCustomHeaderValue(),
  containerPort: 3000,
  appName: 'nextjs-app',
  environment: process.env.NODE_ENV || 'production',
  tags: {
    Project: 'NextJS-Learning',
    Environment: process.env.NODE_ENV || 'production',
    ManagedBy: 'AWS-CDK',
  },
  vpc: {
    cidr: '10.0.0.0/16',
    maxAzs: 2,
    natGateways: 1,
  },
  ecs: {
    cpu: 512,
    memoryLimitMiB: 1024,
  },
};

// Environment variables that will be passed to the container
export const getContainerEnvironmentVariables = (
  cognitoUserPoolId: string,
  cognitoClientId: string,
  cognitoClientSecret: string,
  cognitoIssuer: string,
  authSecret: string
): Record<string, string> => {
  return {
    NODE_ENV: 'production',
    AUTH_SECRET: authSecret,
    AUTH_COGNITO_ID: cognitoClientId,
    AUTH_COGNITO_SECRET: cognitoClientSecret,
    AUTH_COGNITO_ISSUER: cognitoIssuer,
    AWS_REGION: process.env.CDK_DEFAULT_REGION || 'us-east-1',
    // NextAuth configuration
    NEXTAUTH_URL: 'https://your-cloudfront-domain.cloudfront.net', // Will be updated post-deployment
    NEXTAUTH_SECRET: authSecret,
  };
};