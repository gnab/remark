var fs = require('fs')
  , bundler = require('./util/bundler')
  , watcher = require('./util/watcher')
  , options = {
      debug: false
    , watch: false
    , source: 'src/remark.js'
    , target: 'remark.min.js'
    }
  ;

process.argv.forEach(function (val, index) {
  if (val === '--debug' || val === '-d') {
    options.debug = true;
  }
  else if (val === '--watch' || val === '-w') {
    options.watch = true;
  }
});

!function build () {
  bundler.bundle(options.source, options.debug, function (data, files) {
    fs.writeFileSync(options.target, data);

    showBuildInfo(options.target);

    if (options.watch) {
      watcher.watchFiles(files, function () {
        watcher.unwatchFiles(files);
        process.nextTick(build);
      });
    }
  });
}();

function showBuildInfo(target) {
  var stat = fs.statSync(target)
    , now = new Date()
    ;

  console.log('[%s:%s:%s] Built %s (%d bytes)',
      zeroPadNumber(now.getHours()),
      zeroPadNumber(now.getMinutes()),
      zeroPadNumber(now.getSeconds()),
      target, stat.size);
};

function zeroPadNumber(n) {
  return n < 10 ? "0" + n : "" + n;
}
