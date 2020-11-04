/**
 * global error handler abstract class
 *
 * @export
 * @abstract
 * @class ErrorHandler
 */
export abstract class ErrorHandler {
  public abstract handleError(error: any): void;
}
