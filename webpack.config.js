const { resolve } = require('path')

module.exports = ({ production = false } = {}) => ({
  entry: './src/index.js',
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'standard-loader'
    }, {
      test: /\.scss$/,
      use: [{
        loader: 'css-loader'
      }, {
        loader: 'sass-loader'
      }]
    }]
  },
  mode: production ? 'production' : 'development',
  devtool: production ? false : 'inline-source-map',
  performance: {
    hints: false
  },
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: 'abcselect',
    libraryTarget: 'umd'
  }
})
