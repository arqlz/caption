const {fusebox} = require('fuse-box');

fusebox({
  target: 'browser',
  entry: 'src/main.tsx',
  devServer: false,
}).runDev(  {bundles: {
    distRoot: './js',
    app: "main.js"
    }}
);