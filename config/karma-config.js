import {assign} from 'lodash';
import {join} from 'path';
import webpackConfig from './webpack-config';

const testPath = 'test/**/*spec.js';
const preprocessors = {};
preprocessors[testPath] = ['webpack', 'sourcemap'];

const webpack = assign({}, webpackConfig);
webpack.watch = true;

const karmaConfig = {
  basePath: process.cwd(),
  singleRun: false,
  reporters: ['spec'],
  browsers: ['Chrome'],
  autoWatch: true,
  frameworks: ['mocha'],
  files: [
    testPath
  ],
  preprocessors,
  client: {
    captureConsole: false,
    mocha: {
      ui: 'bdd',
      timeout: 10000
    }
  },
  webpack: webpack,
  webpackMiddleware: {
    noInfo: true
  }
};

export default karmaConfig;

