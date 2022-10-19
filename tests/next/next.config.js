/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('node:path')
const CopyPlugin = require('copy-webpack-plugin')

const getFrom = (packageName, fileName) => path.join(path.dirname(require.resolve(packageName)), fileName)

const getTo = filePath => path.resolve(__dirname, filePath)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true,
  // swcMinify: true,
  webpack: config => {
    config.plugins.push(
      // TODO: WIP
      new CopyPlugin({
        patterns: [
          {
            from: getFrom('@rete/analytics-framework', 'rete-analytics-framework.umd.js'),
            to: getTo('public/js/rete.js'),
            force: true,
          },
          {
            from: getFrom('effector', 'effector.umd.js'),
            to: getTo('public/js/effector.js'),
            force: true,
          },
          {
            from: getFrom('patronum', 'patronum.umd.js'),
            to: getTo('public/js/patronum.js'),
            force: true,
          },
        ],
      }),
    )

    return config
  },
}

module.exports = nextConfig
