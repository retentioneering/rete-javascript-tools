import eslint from '@rollup/plugin-eslint'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import ts from 'rollup-plugin-ts'

const config = {
  input: './src/index.ts',
  external: ['node:fs/promises', 'node:path', 'node:process', 'node:zlib'],
  plugins: [
    peerDepsExternal({ includeDependencies: true }),
    eslint({
      throwOnError: true,
      throwOnWarning: true,
      include: ['src/**/*'],
    }),
    ts({
      browserslist: false,
      include: ['src/**/*'],
      tsconfig: resolvedConfig => ({
        ...resolvedConfig,
        declaration: true,
      }),
    }),
  ],
  output: {
    file: './dist/index.js',
    format: 'es',
  },
}

export default config
