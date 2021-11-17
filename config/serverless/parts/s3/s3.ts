import { AWSPartitial } from '../../types';

export const s3Config: AWSPartitial = {
  provider: {
    environment: {
      S3_NAME: '${self:custom.S3Names.S3Bucket.${self:provider.stage}}',
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
              'arn:aws:s3:::${file(env.yml):${self:provider.stage}.S3_NAME}',
              'arn:aws:s3:::${file(env.yml):${self:provider.stage}.S3_NAME}/*',
            ],
          },
        ],
      },
    },
  },
  resources: {
    Resources: {
      S3: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: '${self:custom.S3Names.S3Bucket.${self:provider.stage}}',
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
    S3Names: {
      S3Bucket: {
        local: 'kalinichenko-dev-s3bucket',
        dev: 'kalinichenko-dev-s3bucket',
        test: 'kalinichenko-test-s3bucket',
        prod: 'kalinichenko-prod-s3bucket',
      },
    },
  },
};
