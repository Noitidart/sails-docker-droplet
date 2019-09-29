/**
 * Webpack
 *
 * @description :: Use Webpack instead of Grunt to build frontend
 */

module.exports = function webpackHook(sails) {

  return {
    initialize: function(done) {
      // in production do not run this, a production build should have been made via the webpack-cli when building sources to deploy to host
      // if test environment, build once, then trigger `done`
      // if dev, build once, trigger `done`, then watch for changes to trigger rebuild

      if (global.isSailsScriptEnv || sails.config.environment === 'production') return void done();

      const webpack = require('webpack');
      const { once } = require('lodash');
      const config = require('../../../webpack.config');

      const compiler = webpack(config);

      // on first compilation (due to either run or watch) if it fails,
      // it should throw, else it should call `done`
      const triggerDoneOnce = once((err, stats) => {
        if (err || stats.hasErrors()) {
          throw new Error('sails-hook-webpack failed');
        } else {
          done();
        }
      });

      const compileCallback = (...args) => {
        logCompileInfo(...args);
        triggerDoneOnce(...args);
      };

      if (sails.config.environment === 'test') {
        compiler.run(compileCallback);
      } else {
        sails.log.info('sails-hook-webpack: Watching for changes...');
        compiler.watch(config.watchOptions, compileCallback);
      }

    }
  };

  function logCompileInfo(err, stats) {
    if (err) {
      sails.log.error('sails-hook-webpack: Build error: \n\n', err);
    }
    sails.log[stats.hasErrors() ? 'error' : 'info'](`sails-hook-webpack:\n${stats.toString({ colors: true, chunks: true })}`);
  }

};
