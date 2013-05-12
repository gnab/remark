var Parser = require('../../src/remark/parser');

describe('Parser', function () {

  describe('slides division', function () {
    it('should parse empty source as single slide', function () {
      parser.parse('').length.should.equal(1);
    });

    it('should parse single slide', function () {
      parser.parse('1').length.should.equal(1);
    });

    it('should parse multiple slides', function () {
      parser.parse('1\n---\n2\n---\n3').length.should.equal(3);
    });

    describe('with fences', function () {
      it('should ignore slide separator inside fences', function () {
        parser.parse('```\n---\n```').length.should.equal(1);
      });

      it('should beware of slide separator outside fences', function () {
        parser.parse('1\n---\n```\n---\n```').length.should.equal(2);
      });
    });
  });
  
  describe('identifying continued slides', function () {
    it('should not identify normal, preceding slide as continued', function () {
      parser.parse('1\n--\n2\n---\n3')[0].continued.should.be.false;
    });

    it('should identify continued slide as continued', function () {
      parser.parse('1\n--\n2\n---\n3')[1].continued.should.be.true;
    });

    it('should not identify normal, succeeding slide as continued', function () {
      parser.parse('1\n--\n2\n---\n3')[2].continued.should.be.false;
    });
  });

  var parser;

  beforeEach(function () {
    parser = new Parser();
  });

});
