var fs = require('fs')
  ;

exports.watchFiles = function (files, callback) {
  files.forEach(function (file) {
    fs.watchFile(file, function (curr, prev) {
      if (curr.mtime > prev.mtime) {
        callback();
      }
    });
  });
};

exports.unwatchFiles = function (files) {
  files.forEach(function (file) {
    fs.unwatchFile(file);
  });
};
