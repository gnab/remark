let debug = process.env.NODE_ENV !== 'production';
const path = require('path');
const webpack = require('webpack');

module.exports = {
  //context: path.join(__dirname, '/src'),
  devtool: debug ? 'inline-source-map' : '',
  mode: debug ? 'development' : 'production',
  entry: __dirname + '/src/remark.js',
  watch: false,
  output: {
    filename: 'remark.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      /*{
        test: /.js/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: [
          {
            loader: `jshint-loader`
          }
        ]
      },*/
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader', // creates style nodes from JS strings
          'css-loader', // translates CSS into CommonJS
          'sass-loader' // compiles Sass to CSS
        ]
      },
      {
        test: /\.css/,
        use: [
          'import-glob-loader',
          'style-loader', // creates style nodes from JS strings
          'css-loader', // translates CSS into CommonJS
        ]
      }
    ]
  },
  optimization: {
    minimize: !debug
  }
};