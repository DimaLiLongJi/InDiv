import { INvModule, TInjectTokenProvider } from '../types';
import { factoryCreator, rootInjector, Injector } from '../di';

/**
 * build NvModule instance
 *
 * use this method build NvModule instance
 * 
 * @export
 * @param {Function} FindNvModule
 * @param {boolean} [isRoot]
 * @returns {INvModule}
 */
export function factoryModule(FindNvModule: Function, isRoot?: boolean): INvModule {
  let moduleFound: INvModule;
  if (!rootInjector.getInstance(FindNvModule)) {
    const injector = isRoot ? rootInjector : rootInjector.fork();
    moduleFound = factoryModuleWithInjector(FindNvModule, injector);
    moduleFound.$privateInjector = injector;
    rootInjector.setInstance(FindNvModule, moduleFound);
  } else moduleFound = rootInjector.getInstance(FindNvModule);
  return moduleFound;
}

/**
 * build provider list in module
 *
 * @param {INvModule} moduleInstance
 * @param {Injector} injector
 * @returns {void}
 */
function buildProviderList(moduleInstance: INvModule, injector?: Injector): void {
  if (!moduleInstance.$providers) return;
  const length = moduleInstance.$providers.length;
  for (let i = 0; i < length; i++) {
    const service = moduleInstance.$providers[i];
    if ((service as TInjectTokenProvider).provide) injector.setProvider((service as TInjectTokenProvider).provide, service);
    else injector.setProvider(service as Function, service as Function);
  }
}

/**
 * build imports for module
 *
 * @param {INvModule} moduleInstance
 * @returns {void}
 */
function buildImports(moduleInstance: INvModule): void {
  if (!moduleInstance.$imports) return;
  const length = moduleInstance.$imports.length;
  for (let i = 0; i < length; i++) {
    const ModuleImport = moduleInstance.$imports[i];
    // push InDiv instance
    const moduleImport = factoryModule(ModuleImport, true);
    // build exports
    if (moduleImport.$exportsList) {
      const exportsLength = moduleImport.$exportsList.length;
      for (let i = 0; i < exportsLength; i++) {
        const exportFromModule = moduleImport.$exportsList[i];
        if (moduleInstance.$declarations && !moduleInstance.$declarations.find((declaration: any) => declaration.selector === (exportFromModule as any).selector)) moduleInstance.$declarations.push(exportFromModule);
      }
    }
  }
}

/**
 * build provider list for declaration in module
 * 
 * set static declarations: [] in declaration
 *
 * @param {INvModule} moduleInstance
 * @returns {void}
 */
function buildDeclarations4Declarations(moduleInstance: INvModule): void {
  if (!moduleInstance.$declarations) return;
  const length = moduleInstance.$declarations.length;
  for (let i = 0; i < length; i++) {
    const FindDeclaration: any = moduleInstance.$declarations[i];
    moduleInstance.$declarations.forEach((needInjectDeclaration: any) => {
      if (!FindDeclaration.prototype.$declarationMap.has(needInjectDeclaration.selector)) FindDeclaration.prototype.$declarationMap.set(needInjectDeclaration.selector, needInjectDeclaration);
    });
  }
}

/**
 * build exportsList for module
 *
 * @param {INvModule} moduleInstance
 * @returns {void}
 */
function buildExports(moduleInstance: INvModule): void {
  if (!moduleInstance.$exports) return;
  const length = moduleInstance.$exports.length;
  for (let i = 0; i < length; i++) {
    const ModuleExport = moduleInstance.$exports[i];
    // if export is NvModule, exports from NvModule will be exported again from this module
    if ((ModuleExport as any).nvType === 'nvModule') {
      const moduleInstanceOfExport = factoryModule(ModuleExport);
      const moduleInstanceOfExportLength = moduleInstanceOfExport.$exportsList.length;
      for (let j = 0; j < moduleInstanceOfExportLength; j++) {
        const moduleExportFromModuleOfExport = moduleInstanceOfExport.$exportsList[j];
        if (!moduleInstance.$exportsList.find((declaration: any) => declaration.selector === (moduleExportFromModuleOfExport as any).selector)) moduleInstance.$exportsList.push(moduleExportFromModuleOfExport);
      }
    }

    if ((ModuleExport as any).nvType !== 'nvModule') {
      if (!moduleInstance.$exportsList.find((declaration: any) => declaration.selector === (ModuleExport as any).selector)) moduleInstance.$exportsList.push(ModuleExport);
    }
  }
}

/**
 * create an NvModule instance with factory method
 * 
 * first build service and components in Function.prototype
 * then use factoryCreator create and NvModule instance
 *
 * @export
 * @param {Function} NM
 * @param {Injector} injector
 * @returns {INvModule}
 */
export function factoryModuleWithInjector(NM: Function, injector: Injector): INvModule {
  buildProviderList(NM.prototype, injector);
  buildImports(NM.prototype);
  buildDeclarations4Declarations(NM.prototype);
  buildExports(NM.prototype);
  return factoryCreator(NM, injector);
}
