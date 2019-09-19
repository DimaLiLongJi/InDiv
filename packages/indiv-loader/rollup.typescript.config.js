import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

import pkg from './package.json';

const ts = require('typescript');

export default {
  input: 'packages/indiv-loader/index.ts',
  output: [{
    file: 'packages/indiv-loader/build/bundle.js',
    format: 'cjs',
  }],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    'fs',
    'path',
  ],
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: false,
      preferBuiltins: true,
    }),
    typescript({
      typescript: ts,
      rollupCommonJSResolveHack: true,
      tsconfig: 'packages/indiv-loader/tsconfig.json',
    }),
    commonjs(),
  ],
};
