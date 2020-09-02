const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const helpers = require('./helpers');

const NODE_ENV = process.env.NODE_ENV;
const isProd = NODE_ENV === 'production';

module.exports = {
  entry: {
    'app': [
      helpers.root('client/app/index.js')
    ]
  },

  output: {
    path: helpers.root('dist'),
    publicPath: '/'
  },

  resolve: {
    extensions: ['.js', '.json', '.css', '.scss', '.html'],
    alias: {
      'app': 'client/app'
    }
  },

  // externals: {
  //   jquery: 'jQuery'
  // },

  module: {
    rules: [
      // JS files
      {
        test: /\.jsx?$/,
        include: helpers.root('client'),
        loader: 'babel-loader'
      },

      // CSS files
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },

      // SCSS files
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                autoprefixer
              ]
            }
          },
          // Compiles Sass to CSS
          {
            loader: 'sass-loader',
            options: {
              // Prefer `dart-sass`
              implementation: require('sass'),
            },
          }
        ],
      },

      // Load fonts
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/',
            publicPath: url => `../fonts/${url}`
          }
        }]
      }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),

    // new webpack.ProvidePlugin({
    //   $: "jquery",
    //   jQuery: "jquery"
    // }),

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(NODE_ENV)
      }
    }),

    new HtmlWebpackPlugin({
      template: helpers.root('client/public/index.html'),
      inject: 'body'
    }),

    new ExtractTextPlugin({
      filename: 'css/[name].[hash].css',
      disable: !isProd
    }),

    new CopyWebpackPlugin([{
      from: helpers.root('client/public')
    }]),
  ]
};
