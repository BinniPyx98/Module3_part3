import { getEnv } from '@helper/environment';
import { APIGatewayLambdaEvent } from '@interfaces/api-gateway-lambda.interface';
import { S3Service } from '@services/s3.service';
import { DatabaseResult, GetGalleryObject, Metadata, Pexel } from './pexel.inteface';
import { PexelServiceApi } from './pexel.service';
import { log } from '@helper/logger';

/**
 * It's the feature manager
 * Its methods should implement some feature's functionality
 */
export class PexelManager {
  private readonly service: PexelServiceApi;

  constructor() {
    /**
     * The feature service should be created in the constructor of the feature manager
     * Other services should be provided in the feature manager's methods
     */
    this.service = new PexelServiceApi();
  }


  // /**
  //  * This method implements some feature's functionality
  //  * It should validate required data
  //  * It should display the main steps of the algorithm without implementation
  //  * All implementation should be placed in the feature service's methods
  //  * @param mediaInfoUrl - required data
  //  * @param mediaInfoCurlService - required services
  //  */

  getPexelImages(event: APIGatewayLambdaEvent<void>): Promise<Array<Pexel>> {
    const queryStringValue = event.query.searchQuery;
    return this.service.getPexelImages(queryStringValue);
  }

  saveLikedPhoto(event: APIGatewayLambdaEvent<string>) {
    const idArray = JSON.parse(event.body);
    return this.service.saveLikedPhoto(event, idArray);
  }
}
