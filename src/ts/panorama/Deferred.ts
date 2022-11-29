/* eslint-disable @typescript-eslint/no-empty-function */

type PromiseResolve<T> = (value: T | PromiseLike<T>) => void;
type PromiseReject = (reason?: Error) => void;

export class Deferred<T> {
  public promise: Promise<T>;
  public resolve: PromiseResolve<T> = () => {};
  public reject: PromiseReject = () => {};

  public resolved = false;

  constructor() {
    this.promise = new Promise<T>(this.init);
  }

  private init = (resolve: PromiseResolve<T>, reject: PromiseReject) => {
    this.resolve = (value: T | PromiseLike<T>) => {
      this.resolved = true;
      resolve(value);
    };
    this.reject = reject;
  };
}
