var api = require('../src/remark/api')
  , config = require('../src/remark/config')
  , highlighter = require('../src/remark/highlighter')
  , resources = require('../src/remark/resources')
  , highlight = require('../src/vendor/highlight/highlight.min')
  ;

describe('highlighter', function () {
  it('should return default CSS if style is not set', function () {
    config({highlightStyle: undefined});

    highlighter.cssForStyle().should.equal(resources.highlightStyles.default);
  });

  it('should return empty CSS if style is set to null', function () {
    config({highlightStyle: null});

    highlighter.cssForStyle().should.equal('');
  });

  it('should expose engine via function', function () {
    api.highlighter.engine().should.equal(highlight);
  });
});
