import { AWSPartitial } from '../../types';

export const getGalleryConfig: AWSPartitial = {
  functions: {
    getGallery: {
      handler: 'api/gallery/handler.getGallery',
      memorySize: 500,
      events: [
        {
          http: {
            path: '/gallery',
            method: 'get',
            integration: 'lambda-proxy',
            cors: true,
            authorizer: {
              name: 'AuthorizerCheckToken',
            },
            response: {
              headers: {
                'Access-Control-Allow-Origin': "'*'",
                'Content-Type': "'application/json'",
                'Access-Control-Allow-Headers': "'Authorization'",
              },
              template: "$input.json('$')",
            },
          },
        },
      ],
    },
    getS3Url: {
      handler: 'api/gallery/handler.getS3Url',
      memorySize: 128,
      events: [
        {
          http: {
            path: '/getS3Url',
            method: 'post',
            integration: 'lambda-proxy',
            cors: true,
            authorizer: {
              name: 'AuthorizerCheckToken',
            },
            response: {
              headers: {
                'Access-Control-Allow-Origin': "'*'",
                'Content-Type': "'application/json'",
              },
              template: "$input.json('$')",
            },
          },
        },
      ],
    },
    getImageFromPixel: {
      handler: 'api/gallery/handler.getImageFromPixel',
      memorySize: 128,
      events: [
        {
          http: {
            path: '/getImageFromPixel',
            method: 'get',
            integration: 'lambda',
            cors: true,
            authorizer: {
              name: 'AuthorizerCheckToken',
            },
            response: {
              headers: {
                'Access-Control-Allow-Origin': "'*'",
                'Content-Type': "'application/json'",
              },
              template: "$input.json('$')",
            },
          },
        },
      ],
    },
    saveLikedPhoto: {
      handler: 'api/gallery/handler.saveLikedPhoto',
      memorySize: 500,
      timeout: 20,
      events: [
        {
          http: {
            path: '/saveLikedPhoto',
            method: 'post',
            integration: 'lambda-proxy',
            cors: true,
            authorizer: {
              name: 'AuthorizerCheckToken',
            },
            response: {
              headers: {
                'Access-Control-Allow-Origin': "'*'",
                'Content-Type': "'application/json'",
              },
              template: "$input.json('$')",
            },
          },
        },
      ],
    },
    triggerS3Upload: {
      handler: 'api/gallery/handler.triggerS3Upload',
      memorySize: 500,
      timeout: 15,
      events: [
        {
          s3: {
            bucket: 'kalinichenko-dev-s3bucket',
            existing: true,
            event: 's3:ObjectCreated:*',
          },
        },
      ],
    },
    AuthorizerCheckToken: {
      handler: 'api/auth/handler.authorizer',
      memorySize: 128,
    },
  },
};
