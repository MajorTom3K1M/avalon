const webpack = require('webpack');
const { merge } = require('webpack-merge');

const commonConfig = require('./webpack.common');

module.exports = merge(commonConfig, {
  devtool: 'eval-source-map',

  mode: 'development',

  entry: {
    'app': [
      'webpack-hot-middleware/client?reload=true',
      'regenerator-runtime/runtime.js'
    ]
  },

  output: {
    filename: 'js/[name].js',
    chunkFilename: '[id].chunk.js'
  },

  devServer: {
    contentBase: './client/public',
    historyApiFallback: true,
    stats: 'minimal' // none (or false), errors-only, minimal, normal (or true) and verbose
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
});
