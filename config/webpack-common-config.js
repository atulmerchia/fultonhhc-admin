const firebaseConfig = process.env.IS_LOCAL ? require(`./firebase/firebase-${process.env.DB_MODE}.json`) : JSON.parse(process.env.FIREBASE_CONFIG)

const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

const paths = require('./paths');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml
    }),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        API_URL: JSON.stringify(process.env.API_URL),
        FIREBASE_CONFIG: JSON.stringify(firebaseConfig)
      }
    })
  ],
  resolve: {
    extensions: [".js", ".jsx"],
    modules: ["node_modules"],
    alias: {
      components: path.resolve(paths.appSrc, "components"),
      css: path.resolve(paths.appSrc, "css"),
      assets: path.resolve(paths.appAssets, "assets"),
      lib: path.resolve(paths.appSrc, "lib")
    }
  },
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg)$/,
        use: ["file-loader"]
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]"
            }
          }
        ]
      }
    ]
  }
};
