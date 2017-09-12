// Webpack is only used to generate bundled code for the online counter part to the app
// The app itself relies on electron-compiler to transpile

const path = require('path')
const webpack = require('webpack')

module.exports = {
    entry: './web/game/game.js',
    devServer: {
        contentBase: './web/game',
        hot: true
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'web/game')
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.js$/,
                exclude: [/node_modules/],
                use: [{
                    loader: 'babel-loader',
                    options: { presets: ['es2015', 'react'] },
                }],
            },
        ]
    }
}