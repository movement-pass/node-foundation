import { Construct, Stack, StackProps } from '@aws-cdk/core';

import { StringParameter } from '@aws-cdk/aws-ssm';

abstract class Base extends Stack {
  protected constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
  }

  protected get configRootKey(): string {
    return `/${this.app}/${this.version}`;
  }

  protected get app(): string {
    return this.getContextValue<string>('app');
  }

  protected get version(): string {
    return this.getContextValue<string>('version');
  }

  protected get domain(): string {
    return this.getContextValue<string>('domain');
  }

  protected getContextValue<T>(key: string): T {
    return this.node.tryGetContext(key) as T;
  }

  protected putParameterStoreValue(name: string, value: string): void {
    new StringParameter(this, `${name}Parameter`, {
      parameterName: `${this.configRootKey}/${name}`,
      stringValue: value
    });
  }
}

export { Base };
