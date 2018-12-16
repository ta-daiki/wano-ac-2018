const path = require('path');

const src  = path.resolve(__dirname, 'web/src');
const dist = path.resolve(__dirname, 'web/dst');

module.exports = {
  mode: 'production',
  entry: src + '/index.jsx',

  output: {
    path: dist,
    filename: 'bundle.js'
  },

  module: {
    rules: [
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },

  resolve: {
    extensions: ['.js', '.jsx']
  },

  plugins: []
}
