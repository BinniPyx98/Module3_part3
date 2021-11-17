import { AWSPartitial } from '../../types';

export const s3SUbClipConfig: AWSPartitial = {
  provider: {
    environment: {
      S3_SUBCLIP: '${self:custom.S3SubclipNames.S3SubclipBucket.${self:provider.stage}}',
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              's3:CreateBucket',
              's3:ListBuckets',
              's3:GetBucketCors',
              's3:GetBucket',
              's3:GetObject',
              's3:GetObjectAcl',
              's3:PutObject',
              's3:PutObjectAcl',
            ],
            Resource: [
              'arn:aws:s3:::${file(env.yml):${self:provider.stage}.S3_SUBCLIP}',
              'arn:aws:s3:::${file(env.yml):${self:provider.stage}.S3_SUBCLIP}/*',
            ],
          },
        ],
      },
    },
  },
  resources: {
    Resources: {
      S3Subclip: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: '${self:custom.S3SubclipNames.S3SubclipBucket.${self:provider.stage}}',
          AccessControl: 'PublicReadWrite',
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedHeaders: ['*'],
                AllowedMethods: ['GET', 'PUT', 'HEAD', 'POST', 'DELETE'],
                AllowedOrigins: ['*'],
              },
            ],
          },
        },
      },
    },
  },
  custom: {
    S3SubclipNames: {
      S3SubclipBucket: {
        local: 'kalinichenko-prod-s3bucket-subclip',
        dev: 'kalinichenko-dev-s3bucket-subclip',
        test: 'kalinichenko-test-s3bucket-subclip',
        prod: 'kalinichenko-prod-s3bucket-subclip',
      },
    },
  },
};
