import { Construct, Duration, StackProps } from '@aws-cdk/core';

import { Stream } from '@aws-cdk/aws-kinesis';

import { Base } from './base';

class PassesLoadStream extends Base {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new Stream(this, 'Stream', {
      streamName: `${this.app}_passes-load_${this.version}`,
      retentionPeriod: Duration.hours(24)
    })
  }
}

export { PassesLoadStream };
