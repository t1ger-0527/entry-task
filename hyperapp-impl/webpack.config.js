const path = require("path");

module.exports = {
  mode: process.env.NODE_ENV,
  entry: path.resolve(__dirname, "index.js"),
  output: {
    path: __dirname,
    filename: "build.js",
    libraryTarget: "umd"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname),
        ],
        loader: "babel-loader"
      }
    ]
  }
};
