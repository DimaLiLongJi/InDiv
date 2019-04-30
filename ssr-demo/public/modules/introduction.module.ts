import { NvModule } from '@indiv/core';
import ShareModule from './share.module';
import IntroductionContainer from '../pages/introduction';

@NvModule({
    imports: [
        ShareModule
    ],
    declarations: [
        IntroductionContainer,
    ],
    providers: [
    ],
    exports: [
        IntroductionContainer,
    ],
    bootstrap: IntroductionContainer,
})
export default class IntroductionModule { }
