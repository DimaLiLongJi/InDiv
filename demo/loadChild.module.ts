import { NvModule, InDiv } from '@indiv/core';
// import { NvModule, InDiv } from '../build/core';

import { HeroSearchService, HeroSearchService1, HeroSearchService2 } from './service';
import { SharedModule } from './share.module';
import { TestLoadchildComponent, R2 } from './looadChild.component';

import './private.service';

@NvModule({
  imports: [
    SharedModule,
  ],
  declarations: [
    TestLoadchildComponent,
    R2,
  ],
  providers: [
    HeroSearchService1,
    HeroSearchService2,
    HeroSearchService,
  ],
  exports: [
    TestLoadchildComponent,
  ],
  bootstrap: TestLoadchildComponent,
})
export class LoadchildModule {
  constructor (
    private indiv: InDiv,
  ) {
    console.log(999999888777, '来自懒加载的模块 TestLoadchildModule', this.indiv);
  }
}
