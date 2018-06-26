require('shelljs/make');
require('shelljs/global');
const packageJson = require('./package.json');
const fs = require('fs');
const browserify = require('browserify');
const babelify = require("babelify");

// Targets

target.all = () => {
  target.test();
  target.minify();
  target.boilerplate();
};

target.test = () => {
  target['lint']();
  target['bundle']();
  target['test-bundle']();

  console.log('Running tests...');
  run('mocha-phantomjs test/runner.html', true);
};

target.lint = () => {
  console.log('Linting...');
  run('jshint src', true);
};

target.bundle = () => {
  console.log('Bundling...');
  bundleResources('src/remark/resources.js');

  mkdir('-p', 'out');

  run('browserify ' + components() + ' ./src/remark.js -t [ babelify --presets [ "@babel/preset-env" ] ]').stdout.to('./out/remark.js');
};

function components() {
  let componentsPath = './src/remark/components';

  return ls(componentsPath)
    .map((component) => ('-r ' + componentsPath + '/' + component + '/' + component + '.js:' + 'components/' + component))
    .join(' ');
}

target['test-bundle'] = () => {
  console.log('Bundling tests...');

  const requirements = [
    "require('should');",
    "require('sinon');",
    "require('should-sinon');"
  ];

  const tests = find('./test')
    .filter((file) => (file.match(/\.js$/)))
    .map((file) => ("require('./" + file + "');"))

  requirements.concat(tests)
    .join('\n')
    .to('./_tests.js');

  run('browserify ' + components() + ' ./_tests.js -t [ babelify --presets [ "@babel/preset-env" ] ]').stdout.to('out/tests.js');
  rm('_tests.js');
};

target.boilerplate = () => {
  console.log('Generating boilerplate...');
  generateBoilerplateSingle("boilerplate-single.html");
};

target.minify = () => {
  console.log('Minifying...');
  run('uglifyjs -m -c -o out/remark.min.js out/remark.js');
};

target.deploy = () => {
  let currentBranch = git('branch')
    .split('\n')
    .filter((line) => (line[0] === '*'))[0]
    .substr(2);

  let version = packageJson.version;
  let tagForVersion = git('tag -l v' + version);

  if (tagForVersion) {
    console.log('Update version in package.json before deploying.');
    return;
  }

  return;
  git('checkout HEAD');
  git('add -f out');
  git('commit -m "Deploy version ' + version + '."');
  git('tag -a v' + version + ' -m "Version ' + version + '."');
  git('checkout ' + currentBranch);
  git('push origin --tags');
};

// Helper functions
let path = require('path');
let version = packageJson.version;
let ignoredStyles = ['brown_paper', 'school_book', 'pojoaque']

function bundleResources (target) {
  let resources = {
    VERSION: version,
    DOCUMENT_STYLES: JSON.stringify(less('src/remark.less')),
    HIGHLIGHTJS_STYLES: JSON.stringify(ls('node_modules/highlight.js/styles/*.css').reduce(mapStyle, {})),
    CONTAINER_LAYOUT: JSON.stringify(cat('src/remark.html'))
  };

  cat('src/templates/resources.js.template')
    .replace(/%(\w+)%/g, (match, key) => (resources[key]))
    .to(target);
}

function generateBoilerplateSingle(target) {
  // highlighter has a ending script tag as a string literal, and
  // that causes early termination of escaped script. Split that literal.
  let resources = {
    REMARK_MINJS: escape(cat('out/remark.min.js').replace('"</script>"', '"</" + "script>"'))
  };

  cat('src/templates/boilerplate-single.html.template')
    .replace(/%(\w+)%/g, (match, key) => (resources[key]))
    .to(target);
}

function mapStyle(map, file) {
  let key = path.basename(file, path.extname(file));
  let tmpFile = path.join(tempdir(), 'remark.tmp');

  if (ignoredStyles.indexOf(key) === -1) {
    ('.hljs-' + key + ' {\n' + cat(file) + '\n}').to(tmpFile);
    map[key] = less(tmpFile);
    rm(tmpFile);
  }

  return map;
}

function less(file) {
  return run('lessc -x -s ' + file).stdout.replace(/\n/g, '');
}

function git(cmd) {
  return exec('git ' + cmd, {silent: true}).stdout;
}

function run(command, loud) {
  let result;
  let binPath = pwd() + '/node_modules/.bin/';
  command = binPath + command;

  try {
    result = exec(command, {silent: !loud, fatal: false});
  } catch (e) {
    result = {code: 1, stdout: e.message};
  }

  if (result.code !== 0) {
    console.error(result.stdout);
    exit(result.code);
  }

  return result;
}
