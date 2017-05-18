const path = require('path');
const fs = require('fs');
const appPkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
const appPkgDeps = Object.keys(appPkg.dependencies);

module.exports = {
  entry: {
    preload: path.join(__dirname, 'tiny/devtools/preload.ts'),
  },
  output: {
    path: path.join(__dirname, 'tiny'),
    filename: '[name].webview.js'
  },
  externals(context, request, callback) {
    let isExternal = false;
    const load = [
      'electron',
      'fs',
      'path',
      'os',
      'url',
      'child_process',
    ];
    if (load.concat(appPkgDeps).includes(request))
      isExternal = `require("${request}")`;
    callback(null, isExternal);
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        exclude: /node_modules/,
        loader: 'babel-loader!ts-loader'
      },
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  target: 'web',
};
