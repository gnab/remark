var highlight = require('../../vendor/highlight/highlight.min')
  , api = require('./api')
  , config = require('./config')

  , highlighter = module.exports = {}
  ;

api.highlighter = {
  engine: function() {
    return highlight;
  }
};

var styles = {
  arta:           require('../../vendor/highlight/styles/arta.css')
, ascetic:        require('../../vendor/highlight/styles/ascetic.css')
, dark:           require('../../vendor/highlight/styles/dark.css')
, 'default':      require('../../vendor/highlight/styles/default.css')
, far:            require('../../vendor/highlight/styles/far.css')
, github:         require('../../vendor/highlight/styles/github.css')
, idea:           require('../../vendor/highlight/styles/idea.css')
, ir_black:       require('../../vendor/highlight/styles/ir_black.css')
, magula:         require('../../vendor/highlight/styles/magula.css')
, solarized_dark: require('../../vendor/highlight/styles/solarized_dark.css')
, solarized_light:require('../../vendor/highlight/styles/solarized_light.css')
, sunburst:       require('../../vendor/highlight/styles/sunburst.css')
, vs:             require('../../vendor/highlight/styles/vs.css')
, zenburn:        require('../../vendor/highlight/styles/zenburn.css')
};

highlighter.cssForStyle = function () {
  if (config.highlightStyle === undefined) {
    config.highlightStyle = 'default';
  }

  if (config.highlightStyle === null) {
    return '';
  }

  return styles[config.highlightStyle];
};

highlighter.highlightCodeBlocks = function (content) {
  var codeBlocks = content.getElementsByTagName('code')
    , block
    , i
    ;

  for (i = 0; i < codeBlocks.length; i++) {
    block = codeBlocks[i];

    highlight.highlightBlock(block, '  ');
  }
};
