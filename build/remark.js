/*global "process":true, "console": true, "__dirname": true */

var fs = require('fs')
  , path = require('path')
  , bundler = require('./utils/bundler')
  ;

var options = parseOptions();

bundler.bundle(options, function (bundle) {
  fs.writeFileSync(options.target, bundle);
  showBuildInfo(options.target);
});

function parseOptions () {
  var options = {
      debug: false
    , watch: false
    , source: path.join(__dirname, '../src/remark.js')
    , target: path.join(__dirname, '../remark.min.js')
    };

  process.argv.forEach(function (val, index) {
    if (val === '--debug' || val === '-d') {
      options.debug = true;
    }
    else if (val === '--watch' || val === '-w') {
      options.watch = true;
    }
  });

  return options;
}

function showBuildInfo(target) {
  var stat = fs.statSync(target)
    , now = new Date()
    ;

  console.log('[%s:%s:%s] Built %s (%d bytes)',
      zeroPadNumber(now.getHours()),
      zeroPadNumber(now.getMinutes()),
      zeroPadNumber(now.getSeconds()),
      target, stat.size);
}

function zeroPadNumber(n) {
  return n < 10 ? "0" + n : "" + n;
}
