import { Deferred } from './Deferred';

export class ImageLoader {
  private readonly worker;

  private requests: Map<string, Deferred<ImageBitmap>> = new Map();

  constructor() {
    this.worker = new Worker('/public/js/imageLoaderWorker.js');

    this.worker.addEventListener('message', this.handleMessage);
  }

  public load(url: string): Promise<ImageBitmap> {
    const request = this.requests.get(url);
    if (request !== undefined) {
      return request.promise;
    }

    const promise = new Deferred<ImageBitmap>();
    this.worker.postMessage(url);
    this.requests.set(url, promise);

    return promise.promise;
  }

  private handleMessage = (ev: MessageEvent<{ url: string; image: ImageBitmap }>) => {
    const { url, image } = ev.data;
    const promise = this.requests.get(url);
    if (promise === undefined) return;

    if (image === null) promise.reject(new Error('Failed to load image'));
    promise.resolve(image);


    this.requests.delete(url);
  };
}
