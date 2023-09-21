const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.html$/,
          loader: 'html-loader'
        }
      ]
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
        directory: path.join(__dirname, 'src'),
      },
      compress: true,
      port: 8080,
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
      filename: 'index_bundle.js',  
      path: path.resolve(__dirname, './dist'),
    },
    plugins: [new HtmlWebpackPlugin({
	template: 'index.html'
    })],
};