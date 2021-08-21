import { Construct, StackProps } from '@aws-cdk/core';
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
