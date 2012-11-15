/*global "process":true, "console": true, "__dirname": true */

var fs = require('fs')
  , path = require('path')
  , bundler = require('./utils/bundler')
  , minifier = require('./utils/minifier')
  ;

var options = parseOptions();

bundler.bundle(options, function (bundle) {
  fs.writeFileSync(options.target + '.js', bundle);
  showBuildInfo(options.target + '.js');
  fs.writeFileSync(options.target + '.min.js', minifier.minify(bundle));
  showBuildInfo(options.target + '.min.js');
});

function parseOptions () {
  var options = {
      debug: false
    , watch: false
    , source: path.join(__dirname, '../index.js')
    , target: path.join(__dirname, '../remark')
    };

  process.argv.forEach(function (val, index) {
    if (val === '--watch' || val === '-w') {
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
