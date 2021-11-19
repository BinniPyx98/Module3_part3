import { getEnv } from '@helper/environment';
import { log } from '@helper/logger';
import { S3Service } from '@services/s3.service';
import * as sharp from 'sharp';
import axios from 'axios';

export class SubClipService {
  public async sharp(img, height: number, width: number) {
    const sharpImg = await sharp(img)
      .resize(height, width, {
        fit: sharp.fit.inside,
      })
      .toBuffer();
    return sharpImg;
  }

  public async saveInS3(sharpImg, fileName: string, extension: string, bucketDir: string) {
    const s3 = new S3Service();

    try {
      const subClipUploadResult = await s3.put(
        `${bucketDir}/${fileName}_SC.${extension}`,
        sharpImg,
        getEnv('S3_SUBCLIP'),
        `image/${extension}`
      );
      log(subClipUploadResult);
    } catch (err) {
      log(err);
    }
  }
}