import { Construct } from 'constructs';
import { Duration, RemovalPolicy, StackProps } from 'aws-cdk-lib';

import { BlockPublicAccess, Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';

import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';

import {
  CloudFrontWebDistribution,
  KeyGroup,
  OriginAccessIdentity,
  PriceClass,
  PublicKey,
  SecurityPolicyProtocol,
  SSLMethod,
  ViewerCertificate,
  ViewerProtocolPolicy
} from 'aws-cdk-lib/aws-cloudfront';

import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';

import { Base } from './base';

class Photos extends Base {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    this.putParameterStoreValue(
      'photoUrlPrivateKey',
      '<PUT YOUR PHOTO URL PRIVATE KEY>'
    );

    this.putParameterStoreValue(
      'photoUrlPublicKey',
      '<PUT YOUR PHOTO URL PUBLIC KEY>'
    );

    const bucketNamePrefix = this.getContextValue<string>(
      'photoBucketNamePrefix'
    );

    const subDomain = `${bucketNamePrefix}.${this.domain}`;
    const expiration = this.getContextValue<string>('photoUploadExpiration');

    const bucket = new Bucket(this, 'Bucket', {
      bucketName: `${bucketNamePrefix}.${this.region}.${this.domain}`,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.RETAIN,
      cors: [
        {
          allowedHeaders: ['*'],
          allowedOrigins: ['*'],
          allowedMethods: [HttpMethods.PUT],
          maxAge: Number(expiration)
        }
      ]
    });

    this.putParameterStoreValue('photoBucketName', bucket.bucketName);
    this.putParameterStoreValue('photoUploadExpiration', expiration);

    const certificate = Certificate.fromCertificateArn(
      this,
      'Certificate',
      this.getParameterStoreValue('clientCertificateArn')
    );

    const accessIdentity = new OriginAccessIdentity(this, 'AccessIdentity', {
      comment: `${this.app}-${subDomain}-identity`
    });

    const publicKey = new PublicKey(this, 'photoUrlPublicKey', {
      publicKeyName: 'photoUrlPublicKey',
      encodedKey: this.getParameterStoreValue('photoUrlPublicKey')
    });
    this.putParameterStoreValue('photoUrlKeyPairId', publicKey.publicKeyId);

    const keyGroup = new KeyGroup(this, 'photoUrlKeyGroup', {
      keyGroupName: 'photoUrlKeyGroup',
      items: [publicKey]
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
              maxTtl: Duration.minutes(5),
              trustedKeyGroups: [keyGroup]
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
