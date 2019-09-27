import './styles/reset.less';
import './styles/global.less';
import 'highlight.js/styles/atom-one-dark.css';

import { InDiv } from '@indiv/core';
import { PlatformBrowser } from '@indiv/platform-browser';
import RootModule from './modules';

// export const inDiv = new InDiv();
// inDiv.bootstrapModule(RootModule);
// inDiv.use(PlatformBrowser);
// inDiv.init();

async function main() {
  const indiv = await InDiv.bootstrapFactory(RootModule, {
    plugins: [
      PlatformBrowser,
    ],
  });

  console.log(4444, indiv);
}

main();

