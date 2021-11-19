import { PutItemCommand} from '@aws-sdk/client-dynamodb';
import { getEnv } from '@helper/environment';
import { log } from '@helper/logger';
import { dynamoClient } from '@services/dynamo-connect';
import { PexelService } from '@services/pexel.service';
import { S3Service } from '@services/s3.service';
import axios from 'axios';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { Metadata, Pexel } from './pexel.inteface';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
export class PexelServiceApi {
  async getPexelImages(queryStringValue: string): Promise<any> {
    const pexel = new PexelService();
    const data = await pexel.searchPhoto(queryStringValue);
    if (data.status === 429) {
      return {
        statusCode: 429,
        body: 'limit',
      };
    }
    const jsonPixelResolve = data;
    const pathArray: Array<Pexel> = [];
    // @ts-ignore
    for (const photo of jsonPixelResolve.data.photos) {
      pathArray.push({
        id: photo.id,
        url: photo.src.medium,
      });
    }
    return pathArray;
  }

  async saveLikedPhoto(event, idArray: Array<number>): Promise<void> {
    let data;
    let image;
    for (const id of idArray) {
      const pexel = new PexelService();
      data = await pexel.getPhoto(id);
      const filename = data.data.src.original.split(`${id}/`)[1];
      const contentType = filename.split('.')[1];
      // log(filename[1]);
      const s3 = new S3Service();
      try {
        image = await axios.get(data.data.src.original, { responseType: 'arraybuffer' });
      } catch (e) {
        log(e);
      }
      const userEmail = await this.getUserIdFromToken(event);
      const imageMetadata = {
        filename: filename,
        size: image.data.length,
        contentType: `image/${contentType}`,
      };
      const test = await s3.put(`${userEmail}/${filename}`, image.data, getEnv('S3_NAME'), imageMetadata.contentType);
      log(test);
      try {
        const responseS3 = await this.saveImgMetadata(event, imageMetadata);
        log(responseS3);
      } catch (e) {
        log(e);
      }
      await s3.put(`${userEmail}/${filename}`, image.data, getEnv('S3_NAME'), imageMetadata.contentType);
    }
  }
  async saveImgMetadata(event, metadata: Metadata): Promise<void> {
    const userEmail = await this.getUserIdFromToken(event);
    const hashImage = crypto.createHmac('sha256', 'test').update(metadata.filename).digest('hex');

    const newUser = {
      TableName: getEnv('GALLERY_TABLE_NAME'),
      Item: marshall({
        email: userEmail,
        imageName: metadata.filename,
        Hash: 'imageHash_' + hashImage,
        extension: metadata.contentType,
        imageSize: metadata.size,
        imageStatus: 'OPEN',
      }),
    };
    const result = await dynamoClient.send(new PutItemCommand(newUser));
    log('result function saveImgMetadata = ' + result);
  }
  async getUserIdFromToken(event): Promise<string> {
    const tokenKey = getEnv('TOKEN_KEY');
    let userIdFromToken;
    const bearerHeader = event.headers.Authorization;
    if (bearerHeader) {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];

      jwt.verify(bearerToken, tokenKey, function (err, decoded) {
        userIdFromToken = decoded.id;
      });
    }
    return userIdFromToken;
  }
}
