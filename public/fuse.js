const {fusebox} = require('fuse-box');

fusebox({
  target: 'browser',
  entry: 'src/emiterClient.ts',
  devServer: false,
}).runDev(  {bundles: {
    distRoot: './js',
    app: "audio.js"
    }}
);