import { APIGatewayLambdaEvent } from '@interfaces/api-gateway-lambda.interface';
import { Handler } from 'aws-lambda';
import { PexelManager } from './pexel.manager';

export const getImageFromPixel: Handler<APIGatewayLambdaEvent<any>, any> = async (event) => {
  const manager = new PexelManager();
  const images = await manager.getPexelImages(event);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers': 'Authorization',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
    },
    body: JSON.stringify(images),
  };
};
export const saveLikedPhoto: Handler<APIGatewayLambdaEvent<any>, any> = async (event) => {
  const manager = new PexelManager();
  await manager.saveLikedPhoto(event);
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers': 'Authorization',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
    },
    //body: JSON.stringify(images),
  };
};
