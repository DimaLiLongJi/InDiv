import { NvModule } from '@indiv/core';
import ShareModule from './share.module';
import MiddlewareContainer from '../pages/middleware';

@NvModule({
  imports: [ShareModule],
  declarations: [
      MiddlewareContainer,
    ],
  exports: [
      MiddlewareContainer,
    ],
  bootstrap: MiddlewareContainer,
})
export default class MiddlewareModule { }
