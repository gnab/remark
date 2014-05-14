require('shelljs/make');
require('shelljs/global');

// Targets

target.all = function () {
  target.test();
  target.minify();
  target.boilerplate();
};

target.highlighter = function () {
  console.log('Bundling highlighter...');

  rm('-rf', 'vendor/highlight.js');
  mkdir('-p', 'vendor');
  pushd('vendor');
  exec('git clone https://github.com/isagalaev/highlight.js.git');
  pushd('highlight.js');
  exec('git checkout tags/8.0');
  popd();
  popd();

  bundleHighlighter('src/remark/highlighter.js');
};

target.test = function () {
  target['lint']();
  target['bundle']();
  target['test-bundle']();

  console.log('Running tests...');
  run('mocha-phantomjs test/runner.html');
};

target.lint = function () {
  console.log('Linting...');
  run('jshint src', {silent: true});
};

target.bundle = function () {
  console.log('Bundling...');
  bundleResources('src/remark/resources.js');
  run('browserify src/remark.js', {silent: true}).output.to('out/remark.js');
};

target['test-bundle'] = function () {
  console.log('Bundling tests...');

  [
    "require('should');",
    "require('sinon');"
  ]
    .concat(find('./test')
      .filter(function(file) { return file.match(/\.js$/); })
      .map(function (file) { return "require('./" + file + "');" })
    )
      .join('\n')
      .to('_tests.js');

  run('browserify _tests.js', {silent: true}).output.to('out/tests.js');
  rm('_tests.js');
};

target.boilerplate = function () {
  console.log('Generating boilerplate...');
  generateBoilerplateSingle("boilerplate-single.html");
};

target.minify = function () {
  console.log('Minifying...');
  run('uglifyjs out/remark.js', {silent: true}).output.to('out/remark.min.js');
};

// Helper functions

var path = require('path')
  , config = require('./package.json').config
  , ignoredStyles = ['brown_paper', 'school_book', 'pojoaque']
  ;

function bundleResources (target) {
  var resources = {
        DOCUMENT_STYLES: JSON.stringify(
          less('src/remark.less'))
      , CONTAINER_LAYOUT: JSON.stringify(
          cat('src/remark.html'))
      };

  cat('src/resources.js.template')
    .replace(/%(\w+)%/g, function (match, key) {
      return resources[key];
    })
    .to(target);
}

function bundleHighlighter (target) {
  var highlightjs = 'vendor/highlight.js/src/'
    , resources = {
        HIGHLIGHTER_STYLES: JSON.stringify(
          ls(highlightjs + 'styles/*.css').reduce(mapStyle, {}))
      , HIGHLIGHTER_ENGINE:
          cat(highlightjs + 'highlight.js')
      , HIGHLIGHTER_LANGUAGES:
          config.highlighter.languages.map(function (language) {
            return '{name:"' + language + '",create:' +
              cat(highlightjs + 'languages/' + language + '.js') + '}';
          }).join(',')
      };

  cat('src/highlighter.js.template')
    .replace(/%(\w+)%/g, function (match, key) {
      return resources[key];
    })
    .to(target);
}

function generateBoilerplateSingle(target) {
  var resources = {
        REMARK_MINJS: escape(cat('out/remark.min.js')
                              // highlighter has a ending script tag as a string literal, and
                              // that causes early termination of escaped script. Split that literal.
                              .replace('"</script>"', '"</" + "script>"'))
      };

  cat('src/boilerplate-single.html.template')
    .replace(/%(\w+)%/g, function (match, key) {
      return resources[key];
    })
    .to(target);
}

function mapStyle (map, file) {
  var key = path.basename(file, path.extname(file))
    , tmpfile = path.join(tempdir(), 'remark.tmp')
    ;

  if (ignoredStyles.indexOf(key) === -1) {
    ('.hljs-' + key + ' {\n' + cat(file) + '\n}').to(tmpfile);
    map[key] = less(tmpfile);
    rm(tmpfile);
  }

  return map;
}

function less (file) {
  return run('lessc -x ' + file, {silent: true}).output.replace(/\n/g, '');
}

function run (command, options) {
  var result = exec(pwd() + '/node_modules/.bin/' + command, options);

  if (result.code !== 0) {
    if (!options || options.silent) {
      console.error(result.output);
    }
    exit(1);
  }

  return result;
}
