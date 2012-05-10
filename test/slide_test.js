var Slide = require('../src/remark/slide').Slide;

describe('Slide', function () {
  describe('properties', function () {
    it('should be extracted', function () {
      var slide = new Slide('a:b\nc:d');
      slide.properties.should.have.property('a', 'b');
      slide.properties.should.have.property('c', 'd');
    });
  });
});
