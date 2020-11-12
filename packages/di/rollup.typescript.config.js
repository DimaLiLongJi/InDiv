import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

import pkg from './package.json';

const ts = require('typescript');

export default {
  input: 'packages/di/index.ts',
  output: [{
    file: 'packages/di/build/bundle.js',
    format: 'cjs',
  }],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    resolve({
      jsnext: true,
      main: true,
    }),
    typescript({
      typescript: ts,
      rollupCommonJSResolveHack: true,
      tsconfig: 'packages/di/tsconfig.json',
    }),
    commonjs(),
  ],
};
