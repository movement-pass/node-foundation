import { Construct, Duration, RemovalPolicy, StackProps } from '@aws-cdk/core';

import { Bucket, HttpMethods } from '@aws-cdk/aws-s3';

import { StringParameter } from '@aws-cdk/aws-ssm';

import { Certificate } from '@aws-cdk/aws-certificatemanager';

import {
  CloudFrontWebDistribution,
  OriginAccessIdentity,
  PriceClass,
  SecurityPolicyProtocol,
  SSLMethod,
  ViewerCertificate,
  ViewerProtocolPolicy
} from '@aws-cdk/aws-cloudfront';

import { ARecord, HostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';

import { Base } from './base';
import { BlockPublicAccess } from '@aws-cdk/aws-s3/lib/bucket';

class Photos extends Base {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const subDomain = `photos.${this.domain}`;

    const bucket = new Bucket(this, 'Bucket', {
      bucketName: subDomain,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.RETAIN,
      cors: [
        {
          allowedHeaders: ['*'],
          allowedOrigins: ['*'],
          allowedMethods: [HttpMethods.PUT, HttpMethods.GET],
          maxAge: 1800
        }
      ]
    });

    this.putParameterStoreValue('photoBucketName', subDomain);
    this.putParameterStoreValue(
      'photoUploadExpiration',
      this.getContextValue<string>('photoUploadExpiration')
    );

    const certificateArn = StringParameter.valueForStringParameter(
      this,
      `${this.configRootKey}/clientCertificateArn`
    );

    const certificate = Certificate.fromCertificateArn(
      this,
      'Certificate',
      certificateArn
    );

    const accessIdentity = new OriginAccessIdentity(this, 'AccessIdentity', {
      comment: `${this.app}-photos-identity`
    });

    const distribution = new CloudFrontWebDistribution(this, 'distribution', {
      priceClass: PriceClass.PRICE_CLASS_ALL,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      viewerCertificate: ViewerCertificate.fromAcmCertificate(certificate, {
        aliases: [subDomain],
        sslMethod: SSLMethod.SNI,
        securityPolicy: SecurityPolicyProtocol.TLS_V1_2_2021
      }),
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket,
            originAccessIdentity: accessIdentity
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              defaultTtl: Duration.minutes(5),
              maxTtl: Duration.minutes(5)
            }
          ]
        }
      ],
      errorConfigurations: [
        {
          errorCode: 404,
          responseCode: 200,
          responsePagePath: '/index.html'
        }
      ]
    });

    new ARecord(this, 'Mount', {
      recordName: subDomain,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      zone: HostedZone.fromLookup(this, 'Zone', {
        domainName: this.domain
      })
    });
  }
}

export { Photos };
