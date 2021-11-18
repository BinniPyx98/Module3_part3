import {
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  QueryCommandInput,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { getEnv } from '@helper/environment';
import { log } from '@helper/logger';
import { dynamoClient } from '@services/dynamo-connect';
import { PexelService } from '@services/pexel.service';
import { S3Service } from '@services/s3.service';
import axios from 'axios';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { DatabaseResult, GalleryObject, Metadata, Pexel } from './gallery.inteface';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import * as sharp from 'sharp';
export class GalleryService {
  async checkFilterAndFindInDb(event): Promise<DatabaseResult> {
    const pageNumber = Number(event.queryStringParameters.page);
    const limit = Number(event.queryStringParameters.limit);
    const userIdFromRequest = await this.getUserIdFromToken(event);
    log('getUseridFromToken returned for checkFilterAndFindInDb = ' + userIdFromRequest);
    let objectTotalAndImage;
    let result;
    let total;

    if (event.queryStringParameters.filter === 'All') {
      objectTotalAndImage = await this.getImageForResponse__ForFilterAll(userIdFromRequest, pageNumber, limit);
      total = objectTotalAndImage.total;
      result = objectTotalAndImage.result;
    } else {
      objectTotalAndImage = await this.getImageForResponse__ForFilterMyImage(userIdFromRequest, pageNumber, limit);
      total = objectTotalAndImage.total;
      result = objectTotalAndImage.result;
    }
    return { result: result, total: total };
  }

  async getImageForResponse__ForFilterAll(
    userIdFromRequest: string,
    pageNumber: number,
    limit: number
  ): Promise<DatabaseResult> {
    // @ts-ignore
    const allArrayPath = await this.getAdminsImage();
    log('allPathArray = ' + allArrayPath);
    const userArrayPath = await this.getUsersImage(userIdFromRequest);
    const contArray = allArrayPath.concat(userArrayPath);
    log('cont Array= ' + contArray);
    const total = Math.ceil(Number(contArray.length) / limit);
    const skip = Number((pageNumber - 1) * limit);
    let limitCounter = 0;
    const result = [];
    for (let i = skip; limitCounter < limit && i < contArray.length; i++) {
      limitCounter++;
      // @ts-ignore
      result.push(contArray[i]);
    }
    return { result: result, total: total };
  }
  async getAdminsImage(): Promise<Array<string>> {
    const all_Images: QueryCommandInput = {
      TableName: getEnv('GALLERY_TABLE_NAME'),
      KeyConditionExpression: '#userEmail = :user',
      ExpressionAttributeNames: {
        '#userEmail': 'email',
      },
      ExpressionAttributeValues: marshall({
        ':user': 'All',
      }),
    };

    let adminsArrayPath = [];
    const adminsImgFromDynamo = await dynamoClient.send(new QueryCommand(all_Images));

    if (adminsImgFromDynamo.Items?.length == 0) {
      adminsArrayPath = [];
    } else {
      for (const item of adminsImgFromDynamo.Items!) {
        for (const prop in item) {
          if (prop === 'urlImage') {
            log('item in all = ' + item.urlImage.S);
            // @ts-ignore
            allArrayPath.push(item.urlImage.S);
          }
        }
      }
    }
    return adminsArrayPath;
  }

  async getUsersImage(userIdFromRequest: string): Promise<Array<string>> {
    const myImages: QueryCommandInput = {
      TableName: getEnv('GALLERY_TABLE_NAME'),
      KeyConditionExpression: '#userEmail = :user',
      ExpressionAttributeNames: {
        '#userEmail': 'email',
      },
      ExpressionAttributeValues: marshall({
        ':user': userIdFromRequest,
      }),
    };

    let usersArrayPath = [];
    const adminsImgFromDynamo = await dynamoClient.send(new QueryCommand(myImages));

    if (adminsImgFromDynamo.Items?.length == 0) {
      usersArrayPath = [];
    } else {
      for (const item of adminsImgFromDynamo.Items!) {
        for (const prop in item) {
          if (prop === 'urlImage') {
            // @ts-ignore
            usersArrayPath.push(item.urlImage.S);
          }
        }
      }
    }
    return usersArrayPath;
  }

  async getImageForResponse__ForFilterMyImage(
    userIdFromRequest: string,
    pageNumber: number,
    limit: number
  ): Promise<DatabaseResult> {
    const myImages = {
      TableName: getEnv('GALLERY_TABLE_NAME'),
      Key: {
        email: { S: userIdFromRequest },
      },
    };
    const userImgFromDynamo = await dynamoClient.send(new GetItemCommand(myImages));
    const unmarshallImagePathArray = unmarshall(userImgFromDynamo.Item!);
    let userArrayPath = [];

    if (!userImgFromDynamo.Item!.imageObject) {
      userArrayPath = [];
    } else {
      for (const item of unmarshallImagePathArray.imageObject) {
        // @ts-ignore
        userArrayPath.push(item[2]);
      }
    }
    log(userArrayPath);
    const total = Math.ceil(Number(userArrayPath.length) / limit);
    const skip = Number((pageNumber - 1) * limit);
    let limitCounter = 0;
    const result = [];
    for (let i = skip; limitCounter < limit && i < userArrayPath.length; i++) {
      limitCounter++;
      // @ts-ignore
      result.push(userArrayPath[i]);
    }
    log(result);
    return { result: result, total: total };
  }

  async createGalleryObject(event, dbResult: DatabaseResult): Promise<GalleryObject> {
    const pageNumber = Number(event.queryStringParameters.page);
    const limit = Number(event.queryStringParameters.limit);
    let imagePathArray: Array<string> = []; //img path array

    const total = dbResult.total;

    imagePathArray = dbResult.result;
    log('dbresult = ' + dbResult.result);

    const galleryObj = {
      total: total,
      page: Number(pageNumber),
      objects: imagePathArray,
    };

    return galleryObj;
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

  async updateStatus(userEmail: string, imageUrl: string, fileName: string): Promise<void> {
    const hashImage = crypto.createHmac('sha256', 'test').update(fileName).digest('hex');

    const updateItem = {
      TableName: getEnv('GALLERY_TABLE_NAME'),
      Key: marshall({
        email: userEmail,
        Hash: 'imageHash_' + hashImage,
      }),
      UpdateExpression: 'set imageStatus = :v_status, urlImage = :newUrl',
      ExpressionAttributeValues: marshall({
        ':v_status': 'CLOSE',
        ':newUrl': imageUrl,
      }),
    };
    const updateStatus = await dynamoClient.send(new UpdateItemCommand(updateItem));
    log('result function updateStatus in service = ' + updateStatus);
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
  async getUrlForUploadToS3(event, metadata: Metadata): Promise<string> {
    const userEmail = await this.getUserIdFromToken(event);
    const s3 = new S3Service();
    const url = s3.getPreSignedPutUrl(userEmail + '/' + metadata.filename, getEnv('S3_NAME'));
    log('Url for upload image, returned function getUrlForUploadToS3 =  ' + url);
    const decodedUrl = decodeURIComponent(url);

    return url;
  }
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

  async saveSubclip(img, filename: string, contentType: string, userEmail: string): Promise<void> {
    const [fileName, extension] = filename.split('.');
    const s3 = new S3Service();
    const sharpImg = await sharp(img)
      .resize(512, 250, {
        fit: sharp.fit.inside,
      })
      .toBuffer();
    log('sharpImage = ' + sharpImg);
    try {
      const subClipUploadResult = await s3.put(
        `${userEmail}/${fileName}_SC.${extension}`,
        sharpImg,
        getEnv('S3_SUBCLIP'),
        contentType
      );
      log(subClipUploadResult);
      await this.saveSubclipStatusInDynamo(userEmail, filename);
    } catch (err) {
      log(err);
    }
  }
  async saveSubclipStatusInDynamo(userEmail: string, fileName: string) {
    const hashImage = crypto.createHmac('sha256', 'test').update(fileName).digest('hex');
    const updateItem = {
      TableName: getEnv('GALLERY_TABLE_NAME'),
      Key: marshall({
        email: userEmail,
        Hash: 'imageHash_' + hashImage,
      }),
      UpdateExpression: 'set Subclip = :subclipStatus',
      ExpressionAttributeValues: marshall({
        ':subclipStatus': true,
      }),
    };
    try {
      const updateStatus = await dynamoClient.send(new UpdateItemCommand(updateItem));
    } catch (err) {
      log(err);
    }
  }
}
