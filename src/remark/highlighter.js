var highlight = require('../../vendor/highlight.js/src/highlight')
  , api = require('./api')
  , config = require('./config')
  , resources = require('./resources')

  , highlighter = module.exports = {}
  ;

api.highlighter = {
  engine: function() {
    return highlight;
  }
};

highlighter.cssForStyle = function () {
  if (config.highlightStyle === undefined) {
    config.highlightStyle = 'default';
  }

  if (config.highlightStyle === null) {
    return '';
  }

  return resources.highlightStyles[config.highlightStyle];
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
