import path from 'path'
import { babelConfig } from '../../lib/config'
import { getExternals } from '../../lib/utils'
import { TORCH_DIR, TORCH_SERVER_DIR } from '../../index'
import { VueLoaderPlugin } from 'vue-loader'
import type { Configuration } from 'webpack'
import type { IntegralTorchConfig } from '../../index'


export default function getConfig(config: IntegralTorchConfig): Configuration {
  let entry: Record<string, string> = {
    routes: config.src,
    // document: config.document,
  }

  if (config.middleware) {
    entry.middleware = config.middleware
  }

  return {
    target: 'node',
    mode: 'development',
    watch: true,
    context: config.dir,
    entry,
    output: {
      path: path.join(config.dir, TORCH_DIR, TORCH_SERVER_DIR),
      filename: '[name].js',
      libraryTarget: 'commonjs2',
    },
    devtool: 'source-map',
    module: {
      strictExportPresence: true,
      rules: [
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            ...babelConfig,
            cacheDirectory: true,
          },
        },
        {
          test: /\.vue$/,
          use: {
            loader: 'vue-loader',
            options: {
              // ... other options,
              enableServerHMR: true,
            },
          },
        },
      ],
    },
    optimization: {
      minimize: false,
    },
    performance: {
      hints: 'warning',
      maxEntrypointSize: 400000,
    },
    resolve: {
      modules: ['node_modules'],
      extensions: ['.js', '.jsx', '.json', '.mjs', '.ts', '.tsx', '.vue'],
    },
    externals: getExternals(config.dir),
    plugins: [
      new VueLoaderPlugin()
    ]
  }
}
