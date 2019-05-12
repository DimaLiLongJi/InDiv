import { utils, Directive, Input, HostListener, HostBinding } from '@indiv/core';
import { NvLocation } from './location';

/**
 * @Directive can be used as `router-to=""`
 *
 * @export
 * @class RouterTo
 * @implements {OnInit}
 * @implements {ReceiveInputs}
 * @implements {RouteChange}
 */
@Directive({
  selector: 'routerTo',
})
export class RouterTo {
  @HostBinding('attr.router-link-to') @Input('routerTo') private to: string;
  private from: string;

  constructor( private location: NvLocation ) {}

  @HostListener('click', ['$element'])
  public routeTo = (element: any) => {
    const nvLocation = this.location.get();
    const currentUrl = `${nvLocation.path}${utils.buildQuery(nvLocation.query)}`;
    if (!this.to) {
      console.error('Directive router-to on element', element, 'need a input');
      return;
    }
    if (this.from && currentUrl === this.from) this.location.set(this.to);
    if (!this.from) this.location.set(this.to);
  }
}

/**
 * @Directive can be used as `router-from=""`
 *
 * @export
 * @class RouterFrom
 * @implements {OnInit}
 * @implements {ReceiveInputs}
 */
@Directive({
  selector: 'routerFrom',
})
export class RouterFrom {
  @HostBinding('attr.router-link-from') @Input('routerFrom') private from: string;
}
