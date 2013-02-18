require('shelljs/make');
require('shelljs/global');

// Targets

target.all = function () {
  target.lint();
  target.test();
  target.bundle();
  target.minify();
};

target.resources = function () {
  console.log('Compiling resources...');
  compileResources('src/remark/resources.js');
};

target.lint = function () {
  console.log('Linting...');
  run('jshint src', {silent: true});
};

target.test = function () {
  console.log('Running tests...');
  run('mocha --recursive test');
};

target.bundle = function () {
  console.log('Bundling...');
  run('browserify src/remark.js', {silent: true}).output.to('remark.js');
};

target.minify = function () {
  console.log('Minifying...');
  run('uglifyjs remark.js', {silent: true}).output.to('remark.min.js');
};

// Helper functions

var path = require('path')
  , config = require('./package.json').config
  , ignoredStyles = ['brown_paper', 'school_book', 'pojoaque']
  ;

function compileResources (target) {
  var highlightjs = 'vendor/highlight.js/src/'
    , resources = {
        DOCUMENT_STYLES: JSON.stringify(
          less('src/remark.less'))
      , HIGHLIGHTER_STYLES: JSON.stringify(
          ls(highlightjs + 'styles/*.css').reduce(mapStyle, {}))
      , HIGHLIGHTER_ENGINE: 
          cat(highlightjs + 'highlight.js')
      , HIGHLIGHTER_LANGUAGES:
          config.highlighter.languages.map(function (language) {
            return '{name:"' + language + '",create:' +
              cat(highlightjs + 'languages/' + language + '.js') + '}';
          }).join(',')
      };

  cat('src/resources.js.template')
    .replace(/%(\w+)%/g, function (match, key) {
      return resources[key];
    })
    .to(target);
}

function mapStyle (map, file) {
  var key = path.basename(file, path.extname(file));

  if (ignoredStyles.indexOf(key) === -1) {
    map[key] = less(file);
  }

  return map;
}

function less (file) {
  return run('lessc -x ' + file, {silent: true}).output.replace(/\n/g, '');
}

function run (command, options) {
  var result = exec('node_modules/.bin/' + command, options);

  if (result.code !== 0) {
    if (!options || options.silent) {
      console.error(result.output);
    }
    exit(1);
  }

  return result;
}
