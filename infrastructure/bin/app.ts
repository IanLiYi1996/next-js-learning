#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NextJSStack } from '../lib/nextjs-stack';
import { config } from '../config';

const app = new cdk.App();

// Get environment context
const account = app.node.tryGetContext('account') || process.env.CDK_DEFAULT_ACCOUNT;
const region = app.node.tryGetContext('region') || process.env.CDK_DEFAULT_REGION || 'us-east-1';

// Create the NextJS stack
const nextjsStack = new NextJSStack(app, `${config.stackName}Stack`, {
  env: {
    account: account,
    region: region,
  },
  description: 'AWS CDK stack for Next.js application with Cognito authentication, ECS Fargate, ALB, and CloudFront',
  tags: config.tags,
});

// Add additional tags
cdk.Tags.of(nextjsStack).add('StackName', config.stackName);
cdk.Tags.of(nextjsStack).add('Application', config.appName);

app.synth();