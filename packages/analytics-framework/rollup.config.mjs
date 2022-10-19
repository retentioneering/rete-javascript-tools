import { filesize } from '@rete-internal/rollup-plugin-filesize'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import sourcemaps from 'rollup-plugin-sourcemaps'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json' assert { type: 'json' }

export default {
  input: './src/index.ts',
  external: ['effector', /patronum/],
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
    },
    {
      file: pkg['umd:main'],
      format: 'umd',
      sourcemap: true,
      name: 'ReteAnalyticsFramework',
      globals: {
        effector: 'effector',
        patronum: 'patronum',
        'patronum/condition': 'patronum',
        'patronum/interval': 'patronum',
        'patronum/combine-events': 'patronum',
        'patronum/debug': 'patronum',
      },
    },
  ],
  plugins: [
    sourcemaps(),
    terser(),
    commonjs(),
    nodeResolve(),
    typescript(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions: ['.js', '.ts', '.tsx'],
    }),
    filesize(),
  ],
}
