/**
 * IOC container
 *
 * @export
 * @class Injector
 */
export class Injector {
  /**
   * parent injector from forken child
   *
   * @private
   * @type {Injector}
   * @memberof Injector
   */
  public parentInjector: Injector;

  /**
   * provider map: save provider with key and value
   *
   * @private
   * @type {Map<any, any>}
   * @memberof Injector
   */
  private readonly providerMap: Map<any, any> = new Map();
  /**
   * instance map: save singleton instance with key and value
   *
   * @private
   * @type {Map<any, any>}
   * @memberof Injector
   */
  private readonly instanceMap: Map<any, any> = new Map();

  /**
   * Creates an instance of Injector
   * 
   * set provider and instance with Injector
   * 
   * @memberof Injector
   */
  constructor() {
    this.setProviderAndInstance(Injector, Injector, this);
  }

  /**
   * set Provider(Map) for save provide
   *
   * @param {*} key
   * @param {*} value
   * @memberof Injector
   */
  public setProvider(key: any, value: any): void {
    if (!this.providerMap.has(key)) this.providerMap.set(key, value);
  }

  /**
   * get Provider(Map) by key for save provide
   *
   * @param {*} key
   * @param {(number | 'always')} [bubblingLayer='always']
   * @returns {*}
   * @memberof Injector
   */
  public getProvider(key: any, bubblingLayer: number | 'always' = 'always'): any {
    if (this.providerMap.has(key)) return this.providerMap.get(key);
    else if (bubblingLayer !== 0 && this.parentInjector) return this.parentInjector.getProvider(key, bubblingLayer === 'always' ? 'always' : (bubblingLayer - 1));
    else return undefined;
  }

  /**
   * set instance of provider by key
   *
   * @param {*} key
   * @param {*} value
   * @memberof Injector
   */
  public setInstance(key: any, value: any): void {
    if (this.providerMap.has(key)) {
      if (!this.instanceMap.has(key)) this.instanceMap.set(key, value);
    } else if (this.parentInjector) this.parentInjector.setInstance(key, value);
    else console.error(`injector can'n set instance of provider: ${(key as any).name}`);
  }

  /**
   * get instance of provider by key
   *
   * @param {*} key
   * @param {(number | 'always')} [bubblingLayer='always']
   * @returns {*}
   * @memberof Injector
   */
  public getInstance(key: any, bubblingLayer: number | 'always' = 'always'): any {
    if (this.providerMap.has(key)) {
      if (this.instanceMap.has(key)) return this.instanceMap.get(key);
      else return undefined;
    } else if (bubblingLayer !== 0 && this.parentInjector) return this.parentInjector.getInstance(key, bubblingLayer === 'always' ? 'always' : (bubblingLayer - 1));
    else return undefined;
  }

  /**
   * set provider and it's instance in an injector
   *
   * @param {*} key
   * @param {*} provider
   * @param {*} instance
   * @memberof Injector
   */
  public setProviderAndInstance(key: any, provider: any, instance: any): void {
    this.setProvider(key, provider);
    this.setInstance(key, instance);
  }

  /**
   * get parent injector of a provider
   *
   * @param {*} key
   * @param {(number | 'always')} [bubblingLayer='always']
   * @returns {Injector}
   * @memberof Injector
   */
  public getParentInjectorOfProvider(key: any, bubblingLayer: number | 'always' = 'always'): Injector {
    console.log(3213, bubblingLayer);
    if (this.providerMap.has(key)) return this;
    else if (bubblingLayer !== 0 && this.parentInjector) return this.parentInjector.getParentInjectorOfProvider(key, bubblingLayer === 'always' ? 'always' : (bubblingLayer - 1));
    else {
      console.error(`injector can't find parent injector of provider: ${(key as any).name}`);
      return undefined;
    }
  }

  /**
   * fork a child inject from this injector
   *
   * @returns {Injector}
   * @memberof Injector
   */
  public fork(): Injector {
    const childInjector = new Injector();
    childInjector.parentInjector = this;
    return childInjector;
  }
}

export const rootInjector = new Injector();
