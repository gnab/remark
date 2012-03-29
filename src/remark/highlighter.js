var api = require('./api')
  , config = require('./config')
  , resources = require('./resources')

  , highlighter = module.exports = {}
  ;

api.highlighter = {
  engine: function() {
    return resources.highlighter.engine;
  }
};

highlighter.cssForStyle = function () {
  if (config.highlightStyle === undefined) {
    config.highlightStyle = 'default';
  }

  if (config.highlightStyle === null) {
    return '';
  }

  return resources.highlighter.styles[config.highlightStyle];
};

highlighter.highlightCodeBlocks = function (content) {
  var codeBlocks = content.getElementsByTagName('code')
    , block
    , i
    ;

  for (i = 0; i < codeBlocks.length; i++) {
    block = codeBlocks[i];

    resources.highlighter.engine.highlightBlock(block, '  ');
  }
};
