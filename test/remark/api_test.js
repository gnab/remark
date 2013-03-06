var api = require('../../src/remark/api')
  , events = require('../../src/remark/events')
  , highlighter = require('../../src/remark/highlighter')
  ;

describe('API', function () {
  describe('when loading remark', function () {
    before(function () {
      var remark = require('../../src/remark.js');
    });

    it('should be exposed', function () {
      window.remark.should.equal(api);
    });
  });

  describe('highlighter engine', function () {
    it('should be exposed via function', function () {
      api.highlighter.engine().should.equal(highlighter.engine);
    });
  });

  describe('loading', function () {
    it('should allow loading from string', function (done) {
      events.on('loadFromString', function (string) {
        string.should.equal('markdown');
        done();
      });
      api.loadFromString('markdown');
    });
  });

  describe('navigation', function () {
    it('should allow going to slide by number or name', function (done) {
      events.on('gotoSlide', function (slideNoOrName) {
        slideNoOrName.should.equal(3);
        done();
      });
      api.gotoSlide(3)
    });

    it('should allow going to previous slide', function (done) {
      events.on('gotoPreviousSlide', done);
      api.gotoPreviousSlide();
    });

    it('should allow going to next slide', function (done) {
      events.on('gotoNextSlide', done);
      api.gotoNextSlide();
    });

    it('should allow going to first slide', function (done) {
      events.on('gotoFirstSlide', done);
      api.gotoFirstSlide();
    });

    it('should allow going to last slide', function (done) {
      events.on('gotoLastSlide', done);
      api.gotoLastSlide();
    });
  });
});
