import { GetAtt } from '../../cf-intristic-fn';
import { AWSPartitial } from '../../types';

export const pexelApiConfig: AWSPartitial = {
  functions: {
    saveLikedPhoto: {
      handler: 'api/pexel-api/handler.addMessage',
      memorySize: 500,
      timeout: 20,
      events: [
        {
          http: {
            path: '/gallery/saveLikedPhoto',
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
    test: {
      handler: 'api/pexel-api/handler.saveLikedPhoto',
      memorySize: 128,
      events: [
        {
          sqs: {
            arn: GetAtt('imagesSQS.Arn'),
          },
        },
      ],
    },
    getImagesPixel: {
      handler: 'api/pexel-api/handler.getImagesPixel',
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
