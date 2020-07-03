import { InjectDecoratorFactory, Injector } from '@indiv/di';
import { ElementRef } from '../component';
import { Renderer } from '../vnode';

export const metadataOfAttribute = 'nvMetadataOfAttribute';
export const metadataOfPropAttribute = 'nvMetadataOfPropAttribute';

class AttributeDecorator extends InjectDecoratorFactory {
  constructor(parameterName?: string, propertyName?: string) {
    super(parameterName, propertyName);
  }
  public resolveInject(
    injectInfo: {
      key: any,
      argumentIndex: number,
      decoratorArgument: any,
      bubblingLayer: number | 'always',
    },
    injector: Injector,
  ): boolean {
    const elementRef: ElementRef = injector.getInstance(ElementRef);
    const renderer: Renderer = injector.getInstance(Renderer);
    return renderer.getAttribute(elementRef.nativeElement, injectInfo.decoratorArgument);
  }
}

export const Attribute = new AttributeDecorator(metadataOfAttribute, metadataOfPropAttribute).createInjectDecoratorFactory();
