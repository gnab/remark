var fs = require('fs')
  , bundler = require('./bundler')
  ;

exports.build = function (filePath, target, options, callback) {
  options = options || {};

  bundler.bundle(filePath, options, function (data, files) {
    fs.writeFileSync(target, data);
    callback(files);
  });
};
