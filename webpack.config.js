const webpack = require('webpack');

module.exports = {
  context: __dirname + '/ui',
  entry: './bootstrap.js',
  target: "electron-renderer",
  output: {
    filename: 'bundle.js',
    path: __dirname + '/build',
    publicPath: 'http://localhost:8080/build/'
  },
  externals: { 
//    '../lib/GameStateWatcher': "require('./lib/GameStateWatcher')"
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
        test: /\.css$/,
        exclude: /node_modules/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.svg$/,
        exclude: /node_modules/,
        loader: 'svg-react-loader'
      }
    ]
  }
};