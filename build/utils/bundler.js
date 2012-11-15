/*global "console": true */

var fs = require('fs')
  , browserify = require('browserify')
  , resources = require('../resources')
  , validator = require('./validator')
  ;

module.exports.bundle = function (options, callback) {
  var bundle = browserify({watch: options.watch});

  bundle.register(validator);

  resources.bundle();

  bundle.addEntry(options.source);

  bundle.on('syntaxError', function (err) {
    console.error(err);
    throw err;
  });

  bundle.on('bundle', function () {
    callback(bundle.bundle());
  });

  callback(bundle.bundle());
};
