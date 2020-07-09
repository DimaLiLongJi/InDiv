import { InjectDecoratorFactory, Injector, ParameterInjectInfoType, PropertyInjectInfoType } from '@indiv/di';
import { ElementRef } from '../component';
import { Renderer } from '../vnode';

export const metadataOfAttribute = 'nvMetadataOfAttribute';
export const metadataOfPropAttribute = 'nvMetadataOfPropAttribute';
/**
 *
 *
 * @class AttributeDecorator
 * @extends {InjectDecoratorFactory}
 */
class AttributeDecorator extends InjectDecoratorFactory {
  constructor(parameterName?: string, propertyName?: string) {
    super(parameterName, propertyName);
  }

  public resolveParameterInject(injectInfo: ParameterInjectInfoType, injector: Injector) {
    const elementRef: ElementRef = injector.getInstance(ElementRef);
    const renderer: Renderer = injector.getInstance(Renderer);
    return renderer.getAttribute(elementRef.nativeElement, injectInfo.decoratorArgument);
  }
  public resolvePropertyInject(injectInfo: PropertyInjectInfoType, injector: Injector) {
    const elementRef: ElementRef = injector.getInstance(ElementRef);
    const renderer: Renderer = injector.getInstance(Renderer);
    return renderer.getAttribute(elementRef.nativeElement, injectInfo.decoratorArgument);
  }
}

export const Attribute = new AttributeDecorator(metadataOfAttribute, metadataOfPropAttribute).createInjectDecoratorFactory();
