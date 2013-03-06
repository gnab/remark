var config = require('../../src/remark/config')
  , events = require('../../src/remark/events')
  , api = require('../../src/remark/api')
  ;

describe('config', function () {
  it('should allow setting and getting properties', function () {
    config.set({highlightStyle: 'some-style'});

    config.get('highlightStyle').should.equal('some-style');
  });

  it('should handle setting no properties', function () {
    (function () {
      config.set();
    }).should.not.throw();
  });

  it('should notify when set', function (done) {
    events.once('config', function (changes) {
      done();
    });
    config.set({ratio: '16:9'});
  });

  it('should be exposed', function () {
    api.config.should.equal(config);
  });
});
