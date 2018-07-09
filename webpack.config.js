let debug = process.env.NODE_ENV !== 'production';
const path = require('path');

module.exports = {
  devtool: debug ? 'inline-source-map' : '',
  mode: debug ? 'development' : 'production',
  entry: {
    remark: __dirname + '/src/remark.js'
  },
  watch: false,
  output: {
    filename: debug ? 'remark.js' : 'remark.min.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        loader: 'eslint-loader',
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-proposal-class-properties']
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              attrs: {
                component: 'remark-defaults'
              }
            }
          },
          'css-loader', // translates CSS into CommonJS
          'sass-loader' // compiles Sass to CSS
        ]
      },
      {
        test: /\.css/,
        use: [
          'style-loader', // creates style nodes from JS strings
          'css-loader' // translates CSS into CommonJS
        ]
      }
    ]
  },
  optimization: {
    minimize: !debug
  }
};