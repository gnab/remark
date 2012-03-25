/*global "__dirname":true, "process": true, "console": true */

var fs = require('fs')
  , path = require('path')
  , jshint = require('jshint').JSHINT
  , options = JSON.parse(fs.readFileSync(path.join(__dirname, '../../.jshintrc')))
  ;

module.exports = function (content, filePath) {
  if (!isSourceFile(filePath)) {
    return content;
  }

  if (!jshint(content, options)) {
    console.log(path.relative(path.join(__dirname, '..'), filePath));

    jshint.errors.forEach(function (error) {
      console.log(' - %s:%s: %s', 
        zeroPadNumber(error.line),
        zeroPadNumber(error.character), 
        error.reason);
    });

    process.exit(-1);
  }

  return content;
};

function isSourceFile(filePath) {
  if (!/remark\/src/.exec(filePath) || /vendor/.exec(filePath)) {
    return false;
  }

  return true;
}

function zeroPadNumber(n) {
  return n < 10 ? "0" + n : "" + n;
}
