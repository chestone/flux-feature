import formatter from 'eslint-friendly-formatter';
import webpack from 'webpack';
import lintConfig from './lint-config';

const babelrc = {
  presets: ['es2015', 'stage-0'],
      plugins: [
        'add-module-exports'
      ]
};

const webpackConfig = {
  cache: false,
  debug: false,
  entry: {
    main: './lib/index'
  },
  output: {
    library: 'FluxFeatures',
    libraryTarget: 'umd',
    filename: 'main.js'
  },
  eslint: lintConfig,
  resolve: {
    extensions: [
      '',
      '.js'
    ],
    modulesDirectories: [
      'node_modules'
    ],
  },
  module: {
    loaders: [{
      test:/\.js$/,
      loader: 'babel',
      query: babelrc,
      exclude: /node_modules/
    }],
    preLoaders: [{
      test:/\.js$/,
      loader: 'eslint-loader',
      exclude: /node_modules/
    }]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      output: {comments: false},
      compress: {warnings: false},
      sourceMap: false
    }),
    new webpack.optimize.DedupePlugin()
  ],
  watch: false
};

export default webpackConfig;
