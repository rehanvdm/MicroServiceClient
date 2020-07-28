#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MicroServiceClientStack } from '../lib/micro_service_client-stack';

const app = new cdk.App();
new MicroServiceClientStack(app, 'MicroServiceClient-p2');
