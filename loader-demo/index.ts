import { InDiv } from '@indiv/core';
import { PlatformBrowser } from '@indiv/platform-browser';

import { M1 } from './modules/m1';

// const inDiv = new InDiv();
// inDiv.bootstrapModule(M1);
// inDiv.use(PlatformBrowser);
// inDiv.init();

InDiv.bootstrap(M1, {
  plugins: [
    PlatformBrowser,
  ],
});
