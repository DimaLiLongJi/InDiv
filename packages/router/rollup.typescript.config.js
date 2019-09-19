import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

import pkg from './package.json';

const ts = require('typescript');

export default {
  input: 'packages/router/index.ts',
  output: [{
    file: 'packages/router/build/bundle.js',
    format: 'cjs',
  }],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    typescript({
      typescript: ts,
      rollupCommonJSResolveHack: true,
      tsconfig: 'packages/router/tsconfig.json',
    }),
    resolve({
      jsnext: true,
      main: true,
    }),
    commonjs(),
  ],
};
