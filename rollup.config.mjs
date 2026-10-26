import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'

export default [
  // 1. Browser UMD / IIFE bundles (replaces old Browserify dist files)
  {
    input: 'index.js',
    output: [
      {
        file: 'dist/localbase.dev.js',
        format: 'umd',
        name: 'Localbase',
        sourcemap: true,
        globals: {
          localforage: 'localforage'
        }
      },
      {
        file: 'dist/localbase.min.js',
        format: 'umd',
        name: 'Localbase',
        plugins: [terser()],
        globals: {
          localforage: 'localforage'
        }
      }
    ],
    plugins: [resolve({ browser: true }), commonjs()]
  },
  // 2. Modern ESM & CJS modules
  {
    input: 'index.js',
    external: ['localforage'],
    output: [
      {
        file: 'dist/index.mjs',
        format: 'es',
        sourcemap: true
      },
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        exports: 'auto',
        sourcemap: true
      }
    ],
    plugins: [resolve(), commonjs()]
  }
]
