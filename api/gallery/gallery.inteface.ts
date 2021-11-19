/**
 * This file should contain all required interfaces for the feature
 */

export interface GalleryObject {
  total: number;
  page: number;
  objects: Array<string>;
}
export interface GetGalleryObject {
  input: {
    total: number;
    page: number;
    objects: Array<string>;
  };
}

export interface ResolveObject {
  statusCode: number;
  body: string;
}
export interface DatabaseResult {
  result: Array<string>;
  total: number;
}
export interface Metadata {
  filename: string;
  size: number;
  contentType: string;
}
export interface Pexel {
  id: string;
  url: string;
}
export interface Response429 {
  status: 429;
  headers: any;
  body: string;
}
