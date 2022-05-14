const {fusebox} = require('fuse-box');

fusebox({
  target: 'browser',
  entry: 'src/main.ts',
  devServer: false,
}).runDev(  {bundles: {
    distRoot: './js',
    app: "main.js"
    }}
);