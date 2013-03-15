var should = require('should')
  , api = require('../../src/remark/api')
  , highlighter = require('../../src/remark/highlighter')
  , Slideshow = require('../../src/remark/models/slideshow')
  ;

describe('API', function () {
  it('should be exposed', function () {
    var remark = require('../../src/remark.js');
    window.remark.should.equal(api);
  });

  it('should expose highlighter', function () {
    api.highlighter.should.equal(highlighter);
  });

  it('should allow creating slideshow', function () {
    api.create().should.be.an.instanceOf(Slideshow);
  });
});
