import { getEnv } from '@helper/environment';
import { log } from '@helper/logger';
import axios from 'axios';

export class PexelService {
  public async getPhoto(photoId: number) {
    let imgObject;
    const options = {
      headers: {
        Authorization: getEnv('KEY_API'),
      },
    };
    try {
      imgObject = await axios.get(`https://api.pexels.com/v1/photos/${photoId}`, options);
    } catch (e) {
      log(e);
    }
    return imgObject;
  }

  public async searchPhoto(query: string) {
    let imagesObject;
    const options = {
      params: {
        query: query,
        per_page: 10,
      },
      headers: {
        Authorization: getEnv('KEY_API'),
      },
    };
    try {
      imagesObject = await axios.get('https://api.pexels.com/v1/search?query=${queryStringValue}&per_page=10', options);
    } catch (e) {
      log(e);
    }
    return imagesObject;
  }
}
