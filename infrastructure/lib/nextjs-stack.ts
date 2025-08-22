import {
  Stack,
  StackProps,
  CfnOutput,
  SecretValue,
  Duration,
  RemovalPolicy,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { config, getContainerEnvironmentVariables } from '../config';

export class NextJSStack extends Stack {
  public readonly vpc: ec2.Vpc;
  public readonly cluster: ecs.Cluster;
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly loadBalancer: elbv2.ApplicationLoadBalancer;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const prefix = config.stackName;

    // 1. Create Cognito User Pool
    this.userPool = new cognito.UserPool(this, `${prefix}UserPool`, {
      userPoolName: `${prefix}-user-pool`,
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        username: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Create Cognito User Pool Client
    this.userPoolClient = new cognito.UserPoolClient(this, `${prefix}UserPoolClient`, {
      userPool: this.userPool,
      userPoolClientName: `${prefix}-client`,
      generateSecret: true,
      authFlows: {
        userPassword: true,
        userSrp: true,
        adminUserPassword: false,
        custom: false,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: [
          'http://localhost:3000/api/auth/callback/cognito',
          // CloudFront URL will be added post-deployment
        ],
        logoutUrls: [
          'http://localhost:3000',
          // CloudFront URL will be added post-deployment
        ],
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
      refreshTokenValidity: Duration.days(30),
      accessTokenValidity: Duration.hours(1),
      idTokenValidity: Duration.hours(1),
    });

    // Generate AUTH_SECRET for NextAuth
    const authSecret = new secretsmanager.Secret(this, `${prefix}AuthSecret`, {
      secretName: `${prefix}/auth-secret`,
      description: 'NextAuth.js secret for JWT encryption',
      generateSecretString: {
        secretStringTemplate: '{}',
        generateStringKey: 'secret',
        excludeCharacters: ' %+~`#$&*()|[]{}:;<>?!\'/@"\\',
      },
    });

    // 2. Create VPC
    this.vpc = new ec2.Vpc(this, `${prefix}Vpc`, {
      ipAddresses: ec2.IpAddresses.cidr(config.vpc.cidr),
      maxAzs: config.vpc.maxAzs,
      vpcName: `${prefix}-vpc`,
      natGateways: config.vpc.natGateways,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    // Security Groups
    const albSecurityGroup = new ec2.SecurityGroup(this, `${prefix}AlbSecurityGroup`, {
      vpc: this.vpc,
      securityGroupName: `${prefix}-alb-sg`,
      description: 'Security group for Application Load Balancer',
      allowAllOutbound: true,
    });

    const ecsSecurityGroup = new ec2.SecurityGroup(this, `${prefix}EcsSecurityGroup`, {
      vpc: this.vpc,
      securityGroupName: `${prefix}-ecs-sg`,
      description: 'Security group for ECS Fargate service',
      allowAllOutbound: true,
    });

    // Allow HTTP traffic to ALB from anywhere
    albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP traffic from anywhere'
    );

    // Allow HTTPS traffic to ALB from anywhere
    albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS traffic from anywhere'
    );

    // Allow traffic from ALB to ECS service
    ecsSecurityGroup.addIngressRule(
      albSecurityGroup,
      ec2.Port.tcp(config.containerPort),
      'Allow traffic from ALB to ECS service'
    );

    // 3. Create ECS Cluster
    this.cluster = new ecs.Cluster(this, `${prefix}Cluster`, {
      clusterName: `${prefix}-cluster`,
      vpc: this.vpc,
      enableFargateCapacityProviders: true,
    });

    // 4. Create Application Load Balancer
    this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, `${prefix}LoadBalancer`, {
      vpc: this.vpc,
      internetFacing: true,
      loadBalancerName: `${prefix}-alb`,
      securityGroup: albSecurityGroup,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });

    // 5. Create Fargate Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, `${prefix}TaskDefinition`, {
      memoryLimitMiB: config.ecs.memoryLimitMiB,
      cpu: config.ecs.cpu,
      family: `${prefix}-task`,
    });

    // Create container image from local Dockerfile
    const containerImage = ecs.ContainerImage.fromAsset('../frontend', {
      file: 'Dockerfile',
    });

    // Get environment variables (we'll use placeholder values for now)
    const containerEnvVars = getContainerEnvironmentVariables(
      this.userPool.userPoolId,
      this.userPoolClient.userPoolClientId,
      'PLACEHOLDER_CLIENT_SECRET', // Will be resolved at runtime
      `https://cognito-idp.${this.region}.amazonaws.com/${this.userPool.userPoolId}`,
      'PLACEHOLDER_AUTH_SECRET' // Will be resolved at runtime
    );

    // Add container to task definition
    const container = taskDefinition.addContainer(`${prefix}Container`, {
      image: containerImage,
      containerName: `${prefix}-container`,
      portMappings: [
        {
          containerPort: config.containerPort,
          protocol: ecs.Protocol.TCP,
        },
      ],
      environment: {
        ...containerEnvVars,
        NODE_ENV: 'production',
        PORT: config.containerPort.toString(),
      },
      secrets: {
        AUTH_SECRET: ecs.Secret.fromSecretsManager(authSecret, 'secret'),
        // Note: In production, store Cognito client secret in Secrets Manager
        // For now, we'll output the secret ARN for manual configuration
      },
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: `${prefix}-container`,
      }),
      healthCheck: {
        command: ['CMD-SHELL', 'curl -f http://localhost:3000/api/health || exit 1'],
        interval: Duration.seconds(30),
        timeout: Duration.seconds(5),
        retries: 3,
        startPeriod: Duration.seconds(60),
      },
    });

    // 6. Create ECS Fargate Service
    const ecsService = new ecs.FargateService(this, `${prefix}Service`, {
      cluster: this.cluster,
      taskDefinition: taskDefinition,
      serviceName: `${prefix}-service`,
      desiredCount: 1,
      minHealthyPercent: 50,
      maxHealthyPercent: 200,
      securityGroups: [ecsSecurityGroup],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      enableExecuteCommand: true,
    });

    // 7. Grant Bedrock permissions to ECS task role
    const bedrockPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream',
      ],
      resources: ['*'],
    });

    taskDefinition.taskRole.addToPrincipalPolicy(bedrockPolicy);

    // Grant access to Secrets Manager
    authSecret.grantRead(taskDefinition.taskRole);
    // Cognito client secret permissions are handled via ECS secret reference

    // 8. Configure ALB Listener and Target Group
    const targetGroup = new elbv2.ApplicationTargetGroup(this, `${prefix}TargetGroup`, {
      vpc: this.vpc,
      port: config.containerPort,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      targets: [ecsService],
      targetGroupName: `${prefix}-tg`,
      healthCheck: {
        enabled: true,
        path: '/api/health',
        protocol: elbv2.Protocol.HTTP,
        port: config.containerPort.toString(),
        healthyHttpCodes: '200',
        interval: Duration.seconds(30),
        timeout: Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 5,
      },
    });

    const httpListener = this.loadBalancer.addListener(`${prefix}HttpListener`, {
      port: 80,
      open: true,
      defaultAction: elbv2.ListenerAction.fixedResponse(403, {
        contentType: 'text/plain',
        messageBody: 'Access denied - missing custom header',
      }),
    });

    // Add rule for requests with custom header from CloudFront
    httpListener.addAction(`${prefix}CustomHeaderAction`, {
      action: elbv2.ListenerAction.forward([targetGroup]),
      conditions: [
        elbv2.ListenerCondition.httpHeader(
          config.customHeaderName,
          [config.customHeaderValue]
        ),
      ],
      priority: 1,
    });

    // 9. Create CloudFront Distribution
    const origin = new origins.LoadBalancerV2Origin(this.loadBalancer, {
      customHeaders: {
        [config.customHeaderName]: config.customHeaderValue,
      },
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
      originShieldEnabled: false,
    });

    this.distribution = new cloudfront.Distribution(this, `${prefix}Distribution`, {
      defaultBehavior: {
        origin: origin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        compress: true,
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      enabled: true,
      comment: `${prefix} CloudFront Distribution`,
    });

    // Tags are applied at the stack level in bin/app.ts

    // 10. Outputs
    new CfnOutput(this, 'CloudFrontDistributionDomain', {
      value: this.distribution.distributionDomainName,
      description: 'CloudFront Distribution Domain Name',
      exportName: `${prefix}-cloudfront-domain`,
    });

    new CfnOutput(this, 'CloudFrontDistributionUrl', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'CloudFront Distribution URL',
      exportName: `${prefix}-cloudfront-url`,
    });

    new CfnOutput(this, 'CognitoUserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: `${prefix}-cognito-user-pool-id`,
    });

    new CfnOutput(this, 'CognitoClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: `${prefix}-cognito-client-id`,
    });

    new CfnOutput(this, 'CognitoIssuerUrl', {
      value: `https://cognito-idp.${this.region}.amazonaws.com/${this.userPool.userPoolId}`,
      description: 'Cognito Issuer URL',
      exportName: `${prefix}-cognito-issuer-url`,
    });

    new CfnOutput(this, 'LoadBalancerDnsName', {
      value: this.loadBalancer.loadBalancerDnsName,
      description: 'Application Load Balancer DNS Name',
      exportName: `${prefix}-alb-dns-name`,
    });

    new CfnOutput(this, 'CognitoClientSecretArn', {
      value: this.userPoolClient.userPoolClientSecret.unsafeUnwrap(),
      description: 'Cognito User Pool Client Secret ARN (for manual configuration)',
      exportName: `${prefix}-cognito-client-secret-arn`,
    });
  }
}