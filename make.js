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
  exec('git checkout tags/9.0.0');
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

  mkdir('-p', 'out');

  run('browserify ' + components() + ' src/remark.js',
      {silent: true}).output.to('out/remark.js');
};

function components () {
  var componentsPath = './src/remark/components';

  return ls(componentsPath)
    .map(function (component) {
      return '-r ' + componentsPath + '/' + component + '/' + component +
        '.js:' + 'components/' + component;
    })
    .join(' ');
}

target['test-bundle'] = function () {
  console.log('Bundling tests...');

  [
    "require('should');",
    "require('sinon');",
    "require('should-sinon');"
  ]
    .concat(find('./test')
      .filter(function(file) { return file.match(/\.js$/); })
      .map(function (file) { return "require('./" + file + "');" })
    )
      .join('\n')
      .to('_tests.js');

  run('browserify ' + components() + ' _tests.js',
      {silent: true}).output.to('out/tests.js');
  rm('_tests.js');
};

target.boilerplate = function () {
  console.log('Generating boilerplate...');
  generateBoilerplateSingle("boilerplate-single.html");
};

target.minify = function () {
  console.log('Minifying...');
  run('uglifyjs -m -c -o out/remark.min.js out/remark.js', {silent: true});
};

target.deploy = function () {
  var currentBranch = git('branch')
    .split('\n')
    .filter(function (line) {
      return line[0] === '*';
    })[0]
    .substr(2);

  var version = require('./package.json').version;
  var tagForVersion = git('tag -l v' + version);

  if (tagForVersion) {
    console.log('Update version in package.json before deploying.');
    return;
  }

  git('add package.json');
  git('add -f out');
  git('checkout head');
  git('commit -m "Deploy version ' + version + '."');
  git('tag -a v' + version + ' -m "Version ' + version + '."');
  git('checkout ' + currentBranch);
  git('push origin --tags');
};

// Helper functions

var path = require('path')
  , package = require('./package.json')
  , version = package.version
  , config = package.config
  , ignoredStyles = ['brown_paper', 'school_book', 'pojoaque']
  ;

function bundleResources (target) {
  var resources = {
        VERSION: version
      , DOCUMENT_STYLES: JSON.stringify(
          less('src/remark.less'))
      , CONTAINER_LAYOUT: JSON.stringify(
          cat('src/remark.html'))
      };

  cat('src/templates/resources.js.template')
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
          ls(highlightjs + 'languages/*.js').map(function (file) {
            var language = path.basename(file, path.extname(file))
            return '{name:"' + language + '",create:' + cat(file) + '}';
          }).join(',')
      };

  cat('src/templates/highlighter.js.template')
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

  cat('src/templates/boilerplate-single.html.template')
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
  return run('lessc -x -s ' + file, {silent: true}).output.replace(/\n/g, '');
}

function git (cmd) {
  return exec('git ' + cmd, {silent: true}).output;
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
