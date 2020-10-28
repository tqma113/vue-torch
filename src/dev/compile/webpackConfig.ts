import fs from 'fs'
import path from 'path'
import { IgnorePlugin, HotModuleReplacementPlugin } from 'webpack'
import ManifestPlugin from 'webpack-manifest-plugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import { babelConfig } from '../../lib/config'
import { TORCH_DIR, TORCH_CLIENT_DIR } from '../../index'
import { VueLoaderPlugin } from 'vue-loader'
import type { Configuration, WebpackPluginInstance } from 'webpack'
import type { IntegralTorchConfig } from '../../index'

function getConfig(config: IntegralTorchConfig): Configuration {
  // Check if TypeScript is setup
  const appTsConfigPath = path.resolve(config.dir, 'tsconfig.json')
  const useTypeScript = fs.existsSync(appTsConfigPath)

  const manifestPluginOption: ManifestPlugin.Options = {
    fileName: './assets.json',
    map(file: ManifestPlugin.FileDescriptor): ManifestPlugin.FileDescriptor {
      // 删除 .js 后缀，方便直接使用 obj.name 来访问
      if (file.name) {
        if (/\.js$/.test(file.name)) {
          file.name = file.name.slice(0, -3)
        }
        if (/\.css$/.test(file.name)) {
          file.name = file.name.slice(0, -4)
        }
      }
      return file
    },
  }

  const plugins: WebpackPluginInstance[] = [
    new ManifestPlugin(manifestPluginOption) as any,
    new IgnorePlugin({ resourceRegExp: /^\.\/locale$/ }),
    new HotModuleReplacementPlugin(),
    new VueLoaderPlugin(),
  ]
  // TypeScript type checking

  if (useTypeScript) {
    plugins.push(new ForkTsCheckerWebpackPlugin({}))
  }

  return {
    mode: 'development',
    bail: false,
    target: 'web',
    context: config.dir,
    entry: {
      index: [
        'webpack-hot-middleware/client',
        path.resolve(__dirname, '../../lib/client/index'),
      ],
    },
    devtool: 'cheap-module-source-map',
    output: {
      path: path.join(config.dir, TORCH_DIR, TORCH_CLIENT_DIR),
      publicPath: '/__torch/',
      filename: `js/[name].js`,
      chunkFilename: `js/[name].js`,
      pathinfo: true,
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        name: 'vendor',
      },
    },
    performance: {
      hints: false,
      maxEntrypointSize: 400000,
    },
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
    resolve: {
      alias: {
        '@routes': config.src,
      },
      modules: ['node_modules'],
      extensions: ['.js', '.jsx', '.json', '.ts', '.tsx', '.vue'],
    },
    resolveLoader: {
      modules: ['node_modules'],
      extensions: ['.js', '.json', '.ts', '.jsx', '.tsx', '.vue'],
    },
    plugins,
  }
}

export default getConfig
