var api = require('../../src/remark/api')
  , dom = require('../../src/remark/dom')
  ;

describe('API', function () {
  describe('when loading remark', function () {
    before(function () {
      var remark = require('../../src/remark.js');
    });

    it('should be exposed', function () {
      dom.exports.should.have.property('remark', api);
    });

    it('should trigger ready event', function (done) {
      api.on('ready', function () {
        done();
      });

      dom.emit('load');
    });
  });
});
