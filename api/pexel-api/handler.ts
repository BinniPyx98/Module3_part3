import { getEnv } from '@helper/environment';
import { APIGatewayLambdaEvent } from '@interfaces/api-gateway-lambda.interface';
import { SQSService } from '@services/sqs';
import { Handler, SQSHandler, SQSRecord } from 'aws-lambda';
import { GetAtt } from '../../config/serverless/cf-intristic-fn';
import { PexelManager } from './pexel.manager';
import { log } from '@helper/logger';

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
export const saveLikedPhoto: SQSHandler = async (event) => {
  const manager = new PexelManager();
  const sqsMessages: Array<SQSRecord> = event.Records;
  log(event);
  // await manager.saveLikedPhoto(event);
  // return {
  //   statusCode: 200,
  //   headers: {
  //     'Access-Control-Allow-Headers': 'Authorization',
  //     'Access-Control-Allow-Origin': '*',
  //     'Access-Control-Allow-Methods': '*',
  //   },
  //   //body: JSON.stringify(images),
  // };
};
export const addMessage: Handler<APIGatewayLambdaEvent<any>, any> = async (event) => {
  const manager = new PexelManager();
  const idArray = JSON.parse(event.body);
  const sqs = new SQSService(getEnv('IMAGES_QUEUE_URL'));
  await sqs.sendMessage(idArray);
};
