import { randomBytes } from 'crypto';

import { Construct } from 'constructs';
import { StackProps } from 'aws-cdk-lib';

import { Base } from './base';

class Jwt extends Base {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const secret = randomBytes(64).toString('hex');

    this.putParameterStoreValue('jwtSecret', secret);
    this.putParameterStoreValue('jwtExpire', this.getContextValue('jwtExpire'));
  }
}

export { Jwt };
