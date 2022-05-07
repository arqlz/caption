const {fusebox} = require('fuse-box');

fusebox({
  target: 'browser',
  entry: 'src/editor.ts',
  devServer: false,
}).runDev(  {bundles: {
    distRoot: './js',
    app: "editor.js"
    }}
);