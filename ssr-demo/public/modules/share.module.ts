import { NvModule } from '@indiv/core';
import CodeShower from '../components/code-show';

@NvModule({
    declarations: [
        CodeShower,
    ],
    exports: [
        CodeShower,
    ],
})
export default class ShareModule { }
