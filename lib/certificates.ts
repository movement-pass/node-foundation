import { Construct } from 'constructs';
import { StackProps } from 'aws-cdk-lib';

import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';

import { HostedZone } from 'aws-cdk-lib/aws-route53';

import { Base } from './base';

class Certificates extends Base {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const zone = HostedZone.fromLookup(this, 'Zone', {
      domainName: this.domain
    });

    const clientCertificate = new DnsValidatedCertificate(
      this,
      'ClientCertificate',
      {
        domainName: this.domain,
        subjectAlternativeNames: [`*.${this.domain}`],
        region: 'us-east-1',
        hostedZone: zone
      }
    );

    this.putParameterStoreValue(
      'clientCertificateArn',
      clientCertificate.certificateArn
    );

    if (this.region === 'us-east-1') {
      this.putParameterStoreValue(
        'serverCertificateArn',
        clientCertificate.certificateArn
      );
    } else {
      const serverCertificate = new DnsValidatedCertificate(
        this,
        'ServerCertificate',
        {
          domainName: this.domain,
          subjectAlternativeNames: [`*.${this.domain}`],
          hostedZone: zone
        }
      );

      this.putParameterStoreValue(
        'serverCertificateArn',
        serverCertificate.certificateArn
      );
    }
  }
}

export { Certificates };
