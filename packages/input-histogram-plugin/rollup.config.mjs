import { filesize } from '@rete-internal/rollup-plugin-filesize'
import eslint from '@rollup/plugin-eslint'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import { terser } from 'rollup-plugin-terser'
import ts from 'rollup-plugin-ts'

/**
 * @type {object}
 */
const terserOptions = {
  compress: {
    pure_getters: true,
    unsafe: true,
    unsafe_arrows: true,
    unsafe_comps: true,
    unsafe_Function: true,
    unsafe_proto: true,
    unsafe_undefined: true,
  },
  format: {
    comments: false,
  },
}

const include = ['src/**/*']

const exclude = ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.spec.ts', 'src/**/*.spec.tsx']

const getDefaultConfig = (file, format, tsOptions = {}) => ({
  input: './src/index.ts',
  output: {
    file,
    format,
    generatedCode: {
      preset: 'es2015',
      symbols: false,
    },
    strict: false,
    externalLiveBindings: false,
    freeze: false,
    interop: 'esModule',
  },
  plugins: [
    peerDepsExternal({ includeDependencies: true }),
    eslint({
      throwOnError: true,
      throwOnWarning: true,
      include,
      exclude,
    }),
    ts({
      browserslist: false,
      include,
      exclude,
      ...tsOptions,
    }),
    terser(terserOptions),
    filesize(),
  ],
})

const config = [
  getDefaultConfig('./dist/index.js', 'cjs', {
    tsconfig: resolvedConfig => ({
      ...resolvedConfig,
      declaration: true,
    }),
  }),
  getDefaultConfig('./dist/index.es.js', 'es'),
]

export default config
