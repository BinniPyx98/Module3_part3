import { AWSPartitial } from '../../types';

export const pexelApiConfig: AWSPartitial = {
  functions: {
    saveLikedPhoto: {
      handler: 'api/pexel-api/handler.saveLikedPhoto',
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
    getImageFromPixel: {
      handler: 'api/pexel-api/handler.getImageFromPixel',
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
    AuthorizerCheckToken: {
      handler: 'api/auth/handler.authorizer',
      memorySize: 128,
    },
  },
};
