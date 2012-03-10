var fs = require('fs')
  , less = require('less')
  , jsp = require('uglify-js').parser
  , pro = require('uglify-js').uglify
  , browserify = require('browserify')
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
    , source: './index.js'
    , target: 'remark.min.js'
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

  bundle.register('.less', stringify);
  bundle.register('.css', stringify);

  if (!options.debug) {
    bundle.register('post', minify);
  }

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
    
function stringify(content) {
  var parser = new less.Parser()
    , css
    ;

  parser.parse(content, function (err, tree) {
    if (err) {
      less.writeError(err);
      throw err;
    }

    css = "module.exports = '" + tree.toCSS({compress: true}).replace(/\n/g, '') + "';";
  });

  return css;
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
