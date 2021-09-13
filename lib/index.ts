import 'source-map-support/register';

import { App } from '@aws-cdk/core';

import { Configuration } from './configuration';
import { Certificates } from './certificates';
import { Jwt } from './jwt';
import { Photos } from './photos';
import { Database } from './database';
import { PassesLoadQueue } from './passes-load-queue';

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};

const app = new App();

const prefix = app.node.tryGetContext('app');
const version = app.node.tryGetContext('version');

for (const klass of [
  Configuration,
  Certificates,
  Jwt,
  Photos,
  Database,
  PassesLoadQueue
]) {
  const name = klass.name.toLowerCase();

  const fullName = `${prefix}-${name}-${version}`;

  new klass(app, fullName, { env, stackName: fullName });
}

app.synth();
