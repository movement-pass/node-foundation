import { Construct } from 'constructs';
import { Duration, StackProps } from 'aws-cdk-lib';

import {
  DeduplicationScope,
  FifoThroughputLimit,
  Queue
} from 'aws-cdk-lib/aws-sqs';

import { Base } from './base';

class PassesLoadQueue extends Base {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new Queue(this, 'Queue', {
      queueName: `${this.app}_passes_load_${this.version}.fifo`,
      receiveMessageWaitTime: Duration.seconds(20),
      visibilityTimeout: Duration.minutes(5),
      fifo: true,
      contentBasedDeduplication: true,
      fifoThroughputLimit: FifoThroughputLimit.PER_MESSAGE_GROUP_ID,
      deduplicationScope: DeduplicationScope.MESSAGE_GROUP
    });
  }
}

export { PassesLoadQueue };
