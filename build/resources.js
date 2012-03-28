/*global "__dirname": true */

var fs = require('fs')
  , path = require('path')
  , less = require('less')
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

  resourcesString += 'module.exports = ' + JSON.stringify(resources) + ';';

  fs.writeFileSync(resourcesBundle, resourcesString);
}

function bundleResources () {
  var resources = {};

  resources.documentStyles = stringify(path.join(__dirname, '../src/remark.less'));
  resources.highlightStyles = bundleHighlightStyles();

  return resources;
}

function bundleHighlightStyles () {
  var stylesPath = path.join(__dirname, '../vendor/highlight.js/src/styles')
    , ignoredStyles = ['brown_paper', 'school_bool']
    , files = fs.readdirSync(stylesPath)
    , styles = {}
    ;

  files.forEach(function (file) {
    var extname = path.extname(file)
      , basename = path.basename(file, extname)
      ;

    if (extname !== '.js' || ignoredStyles.indexOf(basename) !== -1) {
      return;
    }

    styles[basename] = 
      stringify(path.join(stylesPath, file));
  });

  return styles;
}

function stringify(filePath) {
  var content = fs.readFileSync(filePath, 'utf8')
    , parser = new less.Parser()
    , css
    ;

  parser.parse(content, function (err, tree) {
    if (err) {
      less.writeError(err);
      throw err;
    }

    css = tree.toCSS({compress: true}).replace(/\n/g, '');
  });

  return css;
}
