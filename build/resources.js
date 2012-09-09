/*global "__dirname": true */

var fs = require('fs')
  , path = require('path')
  , util = require('util')
  , less = require('less')
  , config = require('./utils/config')
  , resourcesBundle = path.join(__dirname, '../src/remark/resources.js')
  ;

module.exports = {
  bundle: writeResourcesToFile
};

if (!module.parent) {
  writeResourcesToFile();
}

function writeResourcesToFile () {
  var resourcesString = '/* Automatically generated */\n'
    , resources = bundleResources()
    ;

  resourcesString += util.format('\nmodule.exports = %s;', JSON.stringify(resources));
  resourcesString += '\nmodule.exports.highlighter.engine = ' + bundleHighlightEngine();

  fs.writeFileSync(resourcesBundle, resourcesString);
}

function bundleResources () {
  var resources = {};

  resources.documentStyles = stringify(path.join(__dirname, '../src/remark.less'));
  resources.highlighter = {
    styles: bundleHighlightStyles()
  };

  return resources;
}

function bundleHighlightEngine () {
  var engineStr = '(function () {';

  engineStr += util.format('\nvar hljs = new %s();', 
    fs.readFileSync(path.join(__dirname, '../vendor/highlight.js/src/highlight.js')));

  config.highlighter.languages.forEach(function (language) {
    var languagePath = path.join(
      __dirname, '../vendor/highlight.js/src/languages', language + '.js');

    engineStr += util.format('\nhljs.LANGUAGES%s = (%s)(hljs);',
      language.match(/^\d|\-/) ? '["' + language + '"]' : '.' + language,
      fs.readFileSync(languagePath));
  });

  engineStr += '\nreturn hljs;})();';

  return engineStr;
}

function bundleHighlightStyles () {
  var stylesPath = path.join(__dirname, '../vendor/highlight.js/src/styles')
    , ignoredStyles = ['brown_paper', 'school_bool']
    , files = fs.readdirSync(stylesPath)
    , styles = {}
    ;

  traverseDirectory(stylesPath, function (file) {
    var extname = path.extname(file)
      , basename = path.basename(file, extname)
      ;

    if (extname !== '.css' || ignoredStyles.indexOf(basename) !== -1) {
      return;
    }

    styles[basename] = 
      stringify(path.join(stylesPath, file));
  });

  return styles;
}

function traverseDirectory(path, callback) {
  var files = fs.readdirSync(path);

  files.forEach(callback);
}

function stringify(filePath) {
  var content = fs.readFileSync(filePath, 'utf8')
    , parser = new less.Parser()
    , css
    ;

  // utf-8 may contain BOM (Byte Mark Order) which needs
  // to be removed before handing over to less parser 
  if (content.charCodeAt(0) === 65279) {
      content = content.substring(1);
  }

  parser.parse(content, function (err, tree) {
    if (err) {
      less.writeError(err);
      throw err;
    }

    css = tree.toCSS({compress: true}).replace(/\n/g, '');
  });

  return css;
}
