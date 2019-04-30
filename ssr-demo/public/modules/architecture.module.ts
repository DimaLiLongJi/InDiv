import { NvModule } from '@indiv/core';
import ShareModule from './share.module';
import ArchitectureContainer from '../pages/architecture';

@NvModule({
    imports: [
        ShareModule
    ],
    declarations: [
        ArchitectureContainer,
    ],
    exports: [
        ArchitectureContainer,
    ],
    bootstrap: ArchitectureContainer,
})
export default class ArchitectureModule { }
