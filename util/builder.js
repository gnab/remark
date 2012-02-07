var fs = require('fs')
  , jsp = require('uglify-js').parser
  , pro = require('uglify-js').uglify
  , less = require('less')
  ;

exports.build = function (filePath, target, callback) {
  bundle(filePath, function (data) {
    data = minify(data);

    fs.writeFileSync(target, data);

    callback();
  });
};

var bundle = function (filePath, callback) {
  var pattern = /\/\*\s*bundle\s+("|')(.+?)\1\s*\*\//g
    , selector = function (match) {
      return match[2];
    }
    , done = callback
    ;

  if (/\.(css|less)$/i.exec(filePath)) {
    done = function (data) {
      compress(data, callback);
    }
  }

  fs.readFile(filePath, 'utf8', function (err, data) {
    search(data, pattern, selector, bundle, done);
  });
};

var search = function (data, pattern, selector, replace, done) {
  var match
    ;

  if (match = pattern.exec(data)) {
    replace(selector(match), function (replacement) {
      data = data.substr(0, match.index) + replacement + 
        data.substr(match.index + match[0].length);
      
      pattern.lastIndex = match.index + replacement.length;

      search(data, pattern, selector, replace, done);
    });
  }
  else {
    done(data);
  }
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
    callback(tree.toCSS({compress: true}));
  });
};
