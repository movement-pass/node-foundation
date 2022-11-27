import { Construct } from 'constructs';
import { StackProps } from 'aws-cdk-lib';

import { Base } from './base';

class Configuration extends Base {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.putParameterStoreValue('app', this.app);
    this.putParameterStoreValue('version', this.version);
    this.putParameterStoreValue('domain', this.domain);
  }
}

export { Configuration };
