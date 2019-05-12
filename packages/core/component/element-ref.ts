/**
 * ElementRef
 * use for dependency injection or Decorator @ViewChild @ViewChildren
 *
 * @export
 * @class ElementRef
 * @template R
 */
export class ElementRef<R = HTMLElement> {
  public nativeElement: R;
  constructor(nativeElement: R) {
    this.nativeElement = nativeElement;
  }
}
