const webpack = require('webpack');

module.exports = {
  context: __dirname + '/ui',
  entry: './bootstrap.js',

  output: {
    filename: 'bundle.js',
    path: __dirname + '/build',
    publicPath: 'http://localhost:8080/build/'
  },

  module: {
    loaders: [
      { 
        test: /\.js|\.jsx$/, 
        query: {
            presets: ['react']
        },
        loader: 'babel-loader', 
        exclude: /node_modules/ 
      },
      { 
        test: /\.scss$/, 
        loader: 'style-loader!css-loader!sass-loader' 
      }
    ]
  }
};