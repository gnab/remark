var api = require('../../src/remark/api')
  ;

describe('API', function () {
  describe('when loading remark', function () {
    before(function () {
      var remark = require('../../src/remark.js');
    });

    it('should be exposed', function () {
      window.should.have.property('remark', api);
    });
  });
});
