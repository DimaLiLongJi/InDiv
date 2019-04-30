import { NvModule } from '@indiv/core';
import ShareModule from './share.module';
import SSRContainer from '../pages/ssr';

@NvModule({
    imports: [ShareModule],
    declarations: [
        SSRContainer,
    ],
    exports: [
        SSRContainer,
    ],
    bootstrap: SSRContainer,
})
export default class SSRModule {}
