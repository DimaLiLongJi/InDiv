import { NvModule } from '@indiv/core';
import ShareModule from './share.module';
import RootComponent from '../components/root-component';
import SideBar from '../components/side-bars';
import RouterModule from '../routes';

import TestService from '../service/test.service';

@NvModule({
  imports: [
    RouterModule,
    ShareModule
  ],
  declarations: [
    SideBar,
    RootComponent,
  ],
  providers: [
    TestService,
  ],
  bootstrap: RootComponent,
})
export default class RootModule { }
