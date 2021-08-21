import { Construct, RemovalPolicy, StackProps } from '@aws-cdk/core';

import {
  Attribute,
  AttributeType,
  BillingMode,
  StreamViewType,
  Table
} from '@aws-cdk/aws-dynamodb';

import { Base } from './base';

class Database extends Base {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const create = (
      name: string,
      partitionKey: Attribute,
      sortKey?: Attribute,
      stream?: StreamViewType,
      timeToLiveAttribute?: string,
      configure?: (t: Table) => void
    ): void => {
      const table = new Table(this, `${name}Table`, {
        tableName: `${this.app}_${name}_${this.version}`,
        removalPolicy: RemovalPolicy.RETAIN,
        billingMode: BillingMode.PAY_PER_REQUEST,
        pointInTimeRecovery: true,
        partitionKey,
        sortKey,
        stream,
        timeToLiveAttribute
      });

      if (configure) {
        configure(table);
      }

      this.putParameterStoreValue(`${name}Table`, table.tableName);

      if (table.tableStreamArn) {
        this.putParameterStoreValue(
          `${name}TableStreamArn`,
          table.tableStreamArn
        );
      }
    };

    create(
      'applicants',
      { name: 'id', type: AttributeType.STRING },
      undefined,
      StreamViewType.NEW_IMAGE
    );

    create(
      'passes',
      { name: 'id', type: AttributeType.STRING },
      undefined,
      StreamViewType.NEW_IMAGE,
      undefined,
      (table) => {
        table.addGlobalSecondaryIndex({
          indexName: 'ix_applicantId-endAt',
          partitionKey: {
            name: 'applicantId',
            type: AttributeType.STRING
          },
          sortKey: {
            name: 'endAt',
            type: AttributeType.STRING
          }
        });
      }
    );
  }
}

export { Database };
