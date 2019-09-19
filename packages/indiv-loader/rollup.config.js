import { uglify } from 'rollup-plugin-uglify';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

import pkg from './package.json';

export default {
  input: 'packages/indiv-loader/build/bundle.js',
  output: [{
    file: 'packages/indiv-loader/build/index.js',
    format: 'cjs',
    exports: 'named',
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
    commonjs(),
    babel({
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
            targets: {
              ie: '10',
            },
          },
        ],
      ],
      sourceMap: true,
      plugins: [
        [
          '@babel/plugin-transform-runtime',
          {
            corejs: 2,
          },
        ],
      ],
      ignore: [
        /core-js/,
        /@babel\/runtime/,
      ],
      runtimeHelpers: true,
    }),
    uglify(),
  ],
};
