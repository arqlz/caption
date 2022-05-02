const {fusebox} = require('fuse-box');

fusebox({
  target: 'browser',
  entry: 'src/receptorClient.ts',
  devServer: false,
}).runDev(  {bundles: {
    distRoot: './js',
    app: "receptor.js"
    }}
);