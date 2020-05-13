import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodePolyfills from 'rollup-plugin-node-polyfills'

export default {
  input: 'src/main.js',
  output: {
    format: 'esm', // needs to be esm format as Onboard.js contains code-splitting
    dir: 'public/esm/'
  },
  plugins: [
    json(),
    resolve({
      browser: true,
      preferBuiltins: true
    }),
    commonjs({
      namedExports: {
        "u2f-api": ["sign", "isSupported"]
      }
    }),
    nodePolyfills()
  ]
}
