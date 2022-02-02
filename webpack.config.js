'use strict';

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

const HtmlWebPackPlugin = require('html-webpack-plugin');
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;
const Dotenv = require('dotenv-webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ReactRefreshTypeScript = require('react-refresh-typescript');

const developmentMode = 'development';
const productionMode = 'production';
const buildPath = 'dist'; // only for prod

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const styledComponentsTransformer = createStyledComponentsTransformer({ minify: true });

const config = {
  context: appDirectory,
  entry: resolveApp('src/index.tsx'),
  output: {
    chunkLoadingGlobal: 'webpackPackageName',
    publicPath: '/',
  },
  resolve: { extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json'] },
  module: {
    rules: [
      {
        test: /\.(bmp|png|svg|jpg|jpeg|gif|webp)$/i,
        type: 'asset',
        generator: {
          filename: 'static/media/[name].[contenthash:8].[ext]',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/fonts/[name].[contenthash:8].[ext]',
        },
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: { name: (entrypoint) => `runtime-${entrypoint.name}` },
  },
  plugins: [
    new Dotenv(),
    new HtmlWebPackPlugin({
      template: resolveApp('./public/index.html'),
    }),
  ],
  stats: {
    env: true,
  },
};

module.exports = (webpackConfigEnv, argv) => {
  // DEVELOPMENT
  if (argv.mode === developmentMode) {
    process.env.NODE_ENV = developmentMode;
    process.env.BABEL_ENV = developmentMode;

    config.module.rules.push({
      test: /\.(ts|tsx|json)$/,
      include: resolveApp('./src'),
      loader: 'ts-loader',
      options: {
        getCustomTransformers: () => ({
          before: [styledComponentsTransformer, ReactRefreshTypeScript()],
        }),
        // disable type checker - we will use it in fork plugin, react-refresh need this
        transpileOnly: true,
      },
    });

    config.output = {
      ...config.output,
      filename: '[name].js',
      chunkFilename: '[name].chunk.js',
    };
    config.module.rules.push({
      test: /\.css$/i,
      use: ['style-loader', 'css-loader'],
    });
    config.devtool = 'eval-cheap-module-source-map';
    config.optimization = {
      ...config.optimization,
      minimize: false,
      splitChunks: {
        ...config.optimization.splitChunks,
        name: (module, chunks, cacheGroupKey) => {
          const moduleFileName = module
            .identifier()
            .split('/')
            .reduceRight((item) => item);
          const allChunksNames = chunks.map((item) => item.name).join('-');
          return `${moduleFileName}-${allChunksNames}-${cacheGroupKey}`;
        },
      },
    };
    config.plugins.push(
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/],
      }),
      new ForkTsCheckerWebpackPlugin({
        async: true,
        typescript: {
          mode: 'write-dts',
        },
        // eslint: {
        //   files: './src/**/*.{ts,tsx,js,jsx}', // required - same as command `eslint ./src/**/*.{ts,tsx,js,jsx} --ext .ts,.tsx,.js,.jsx`
        // },
      }),
      new ReactRefreshWebpackPlugin(),
      new CspHtmlWebpackPlugin(
        {
          'base-uri': `'none'`,
          'object-src': `'none'`,
          'connect-src': [`'self'`, `ws://*:*`],
          'script-src': [`'self'`, `'unsafe-eval'`, `'unsafe-inline'`],
          'style-src': [`'self'`, `'unsafe-inline'`],
          'img-src': [`'self'`],
        },
        {
          nonceEnabled: {
            'script-src': false,
            'style-src': false,
          },
          hashEnabled: {
            'script-src': false,
            'style-src': false,
          },
        }
      )
    );
    config.devServer = {
      host: '0.0.0.0',
      port: webpackConfigEnv.PORT ? webpackConfigEnv.PORT : 3000,
      hot: true,
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      client: {
        webSocketURL: {
          hostname: 'localhost',
        },
      },
      allowedHosts: 'all',
      open: {
        app: {
          name: process.platform === 'linux' ? 'google-chrome' : 'chrome', // 'Chrome' is 'Google Chrome' - macOS, 'google-chrome' - Linux, 'chrome' - Windows
        },
      },
    };
  }

  // PRODUCTION
  if (argv.mode === productionMode) {
    process.env.NODE_ENV = productionMode;
    process.env.BABEL_ENV = productionMode;

    config.module.rules.push({
      test: /\.(ts|tsx|json)$/,
      include: resolveApp('./src'),
      loader: 'ts-loader',
      options: {
        // disable type checker - we will use it in fork plugin
        transpileOnly: true,
        getCustomTransformers: () => ({ before: [styledComponentsTransformer] }),
      },
    });

    config.bail = true;
    config.output = {
      ...config.output,
      clean: true,
      path: webpackConfigEnv.BUILD_PATH ? resolveApp(webpackConfigEnv.BUILD_PATH) : resolveApp(buildPath),
      filename: 'static/js/[name].[contenthash:8].js',
      chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
    };
    config.module.rules.push({
      test: /\.css$/i,
      use: [MiniCssExtractPlugin.loader, 'css-loader'],
    });
    config.devtool = webpackConfigEnv.SOURCE_MAP ? 'source-map' : false;
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        name: false,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: false,
            chunks: 'all',
          },
        },
      },
      minimize: true,
      minimizer: [`...`, new CssMinimizerPlugin()],
    };
    config.plugins.push(
      new ForkTsCheckerWebpackPlugin({
        async: false,
        typescript: {
          mode: 'write-dts',
        },
      }),
      new MiniCssExtractPlugin({
        filename: 'static/styles/[name].[contenthash:8].css',
        chunkFilename: 'static/styles/[name].[contenthash:8].chunk.css',
      }),
      new CspHtmlWebpackPlugin({
        'base-uri': `'none'`,
        'object-src': `'none'`,
        'connect-src': [`'self'`],
        'script-src': [`'strict-dynamic'`, `https: 'self'`],
        'style-src': [`'strict-dynamic'`, `https: 'self'`],
        'img-src': [`'self'`],
      })
    );
  }

  // analyze plugin for both dev and prod
  if (webpackConfigEnv.analyze) {
    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'server',
      })
    );
  }

  return config;
};
