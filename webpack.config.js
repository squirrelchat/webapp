/*
 * Copyright (c) 2020 Squirrel Chat, All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const { join } = require('path')
const { existsSync, readdirSync, unlinkSync } = require('fs')
const TerserJSPlugin = require('terser-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')
const HtmlWebpackSriPlugin = require('webpack-subresource-integrity')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { DefinePlugin } = require('webpack')

// Env vars
let commitHash = null
try { commitHash = require('child_process').execSync('git rev-parse HEAD').toString().trim() } catch (e) {}

const isDev = process.env.NODE_ENV === 'development'
const src = join(__dirname, 'src')

const baseConfig = {
  mode: isDev ? 'development' : 'production',
  entry: join(src, 'main.tsx'),
  output: {
    crossOriginLoading: 'anonymous',
    filename: isDev ? '[name].js' : '[contenthash].js',
    chunkFilename: isDev ? '[name].chk.js' : '[contenthash].js',
    path: join(__dirname, 'dist'),
    publicPath: '/dist/'
  },
  resolve: {
    extensions: [ '.js', '.ts', '.tsx' ],
    alias: {
      '@components': join(__dirname, 'src', 'components'),
      '@typings': join(__dirname, 'src', 'typings'),
      '@store': join(__dirname, 'src', 'store'),
      '@styles': join(__dirname, 'src', 'styles'),
      '@assets': join(__dirname, 'src', 'assets')
    }
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.tsx?/,
        exclude: /node_modules/,
        use: [ 'ts-loader' ]
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        loader: 'source-map-loader'
      },
      {
        test: /\.s?css$/,
        use: [
          {
            loader: MiniCSSExtractPlugin.loader,
            options: { hmr: isDev }
          },
          {
            loader: 'css-loader',
            options: {
              localsConvention: 'camelCaseOnly',
              modules: { localIdentName: '[local]-[hash:7]' }
            }
          },
          {
            loader: 'postcss-loader',
            options: { plugins: [ require('autoprefixer') ] }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.(svg|mp4|webm|woff2?|eot|ttf|otf|wav|ico)$/,
        use: [
          {
            loader: 'file-loader',
            options: { name: '[hash:20].[ext]' }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: { name: '[hash:20].[ext]' }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              disable: isDev,
              mozjpeg: {
                progressive: true,
                quality: 95
              },
              optipng: { enabled: false },
              pngquant: {
                quality: [ 0.9, 1 ],
                speed: 4
              },
              gifsicle: {
                interlaced: true,
                optimizationLevel: 2
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: '../index.html',
      alwaysWriteToDisk: true
    }),
    new HtmlWebpackHarddiskPlugin(),
    new HtmlWebpackSriPlugin({
      hashFuncNames: [ 'sha256', 'sha512' ],
      enabled: !isDev,
    }),
    new MiniCSSExtractPlugin({
      filename: isDev ? '[name].css' : '[contenthash].css',
      chunkFilename: isDev ? '[name].css' : '[contenthash].css'
    }),
    new DefinePlugin({
      SquirrelEnv: {
        BuildFlags: {
          ENABLE_EXPERIMENTS: String(isDev || process.argv.includes('--enable-experiments')),
          ENABLE_PAYMENT_GATEWAYS: String(isDev || process.argv.includes('--enable-payment-gateways')),
          ENABLE_ANALYTICS: String(isDev || !process.argv.includes('--no-analytics'))
        },
        GIT_REVISION: JSON.stringify(commitHash)
      },
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ],
  optimization: {
    minimize: !isDev,
    minimizer: [
      new TerserJSPlugin({
        extractComments: false,
        parallel: true,
        cache: true
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorPluginOptions: {
          preset: [ 'default', {
            cssDeclarationSorter: true,
            discardUnused: true,
            mergeIdents: true,
            reduceIdents: true
          } ]
        }
      })
    ],
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.s?css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  devtool: 'source-map',
  devServer: {
    quiet: true,
    historyApiFallback: true,
    allowedHosts: [ 'localhost', '.ngrok.io' ], // Learn more about ngrok here: https://ngrok.com/
    proxy: { '/api': `http://localhost` }
  }
}

if (isDev) {
  baseConfig.plugins.push(new FriendlyErrorsWebpackPlugin(), new ReactRefreshWebpackPlugin())
} else {
  baseConfig.plugins.push({
    apply: (compiler) =>
      compiler.hooks.compile.tap('cleanBuild', () => {
        if (existsSync(compiler.options.output.path)) {
          for (const filename of readdirSync(compiler.options.output.path)) {
            if (filename !== 'manifest.json') {
              unlinkSync(join(compiler.options.output.path, filename))
            }
          }
        }
      })
  })
}

module.exports = baseConfig
