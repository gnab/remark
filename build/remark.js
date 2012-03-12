var fs = require('fs')
  , path = require('path')
  , jsp = require('uglify-js').parser
  , pro = require('uglify-js').uglify
  , browserify = require('browserify')
  , resources = require('./resources')
  ;

var options = parseOptions();

build(options, function (bundle) {
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

function build (options, callback) {
  var bundle = browserify({watch: options.watch});

  if (!options.debug) {
    bundle.register('post', minify);
  }

  resources.bundle();

  bundle.addEntry(options.source);

  bundle.on('syntaxError', function (err) {
    console.log(err);
    throw err;
  });

  bundle.on('bundle', function () {
    callback(bundle.bundle());
  });

  callback(bundle.bundle());
}
    
function minify(content) {
  var ast = jsp.parse(content)
    ;

  ast = pro.ast_mangle(ast);
  ast = pro.ast_squeeze(ast);

  return pro.gen_code(ast);
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
};

function zeroPadNumber(n) {
  return n < 10 ? "0" + n : "" + n;
}
