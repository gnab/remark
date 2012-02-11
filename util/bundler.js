var fs = require('fs')
  , jsp = require('uglify-js').parser
  , pro = require('uglify-js').uglify
  , less = require('less')
  , util = require('../src/remark/util')

  , stylePattern = /\.(css|less)$/i
  , filePathSelector = function (match) { return match[2]; }
  ;

exports.bundle = function bundle(filePath, options, callback) {
  var bundleFile
    , files = []
    ;

  bundleFile = function (filePath, callback) {
    var bundlePattern = /\/\*\s*bundle\s+("|')(.+?)\1\s*\*\//g
      , done = callback;

    files.push(filePath);

    if (stylePattern.exec(filePath)) {
      done = function (data) {
        compress(data, callback);
      }
    }

    fs.readFile(filePath, 'utf8', function (err, data) {
      util.search(data, bundlePattern, filePathSelector, bundleFile, done);
    });
  };

  bundleFile(filePath, function (data) {
    if (!options.debug) {
      data = minify(data);
    }
     
    callback(data, files);
  });
};

var minify = function (script) {
  var ast = jsp.parse(script);
  ast = pro.ast_mangle(ast);
  ast = pro.ast_squeeze(ast);
  return pro.gen_code(ast);
};

var compress = function (css, callback) {
  var parser = new less.Parser();

  parser.parse(css, function (err, tree) {
    if (err) {
      less.writeError(err);
      throw err;
    }
    callback(tree.toCSS({compress: true}).replace(/\n/g, ''));
  });
};
