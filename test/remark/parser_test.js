var Parser = require('../../src/remark/parser');

describe('Parser', function () {

  describe('splitting source into correct number of slides', function () {
    it('should handle single slide', function () {
      parser.parse('1').length.should.equal(1);
    });

    it('should handle multiple slides', function () {
      parser.parse('1\n---\n2\n---\n3').length.should.equal(3);
    });

    it('should treat empty source as single slide', function () {
      parser.parse('').length.should.equal(1);
    });

    it('should ignore slide separator inside fences', function () {
      parser.parse('1\n---\n```\n---\n```\n---\n3').length.should.equal(3);
    });

    it('should ignore slide separator inside content class', function () {
      parser.parse('1\n---\n2\n.class[\n---\n]\n---\n3').length.should.equal(3);
    });
  });

  describe('mapping source to corresponding slides', function () {
    it('should handle single slide', function () {
      parser.parse('1')[0].source.should.equal('1');
    });

    it('should handle multiple slides', function () {
      var slides = parser.parse('1\n---\n2\n---\n3');

      slides[0].source.should.equal('1');
      slides[1].source.should.equal('2');
      slides[2].source.should.equal('3');
    });

    it('should handle empty source', function () {
      parser.parse('')[0].source.should.equal('');
    });
  });

  describe('parsing code', function () {
    it('should include code', function () {
      var slides = parser.parse('1\n    code\n2\n---\n3\n    code\n4');

      slides[0].source.should.equal('1\n    code\n2');
      slides[1].source.should.equal('3\n    code\n4');
    });

    it('should ignore content class inside code', function () {
      parser.parse('    .class[x]')[0].source.should.equal('    .class[x]');
    });
  });

  describe('parsing fences', function () {
    it('should include fences', function () {
      var slides = parser.parse('1\n```\n\n```\n2\n---\n3\n```\n\n```\n4');

      slides[0].source.should.equal('1\n```\n\n```\n2');
      slides[1].source.should.equal('3\n```\n\n```\n4');
    });

    it('should ignore content class inside fences', function () {
      parser.parse('```\n.class[x]\n```')[0].source
        .should.equal('```\n.class[x]\n```');
    });
  });

  describe('parsing content classes', function () {
    it('should convert block content classes', function () {
      parser.parse('1 .class[\nx\n] 2')[0].source
        .should.equal('1 <div class="class">\nx\n</div> 2');
    });

    it('should convert inline content classes', function () {
      parser.parse('1 .class[x] 2')[0].source
        .should.equal('1 <span class="class">x</span> 2');
    });

    it('should ignore unclosed inline content classes', function () {
      parser.parse('1 .class[x 2')[0].source.should.equal('1 .class[x 2');
    });

    it('should ignore unclosed block content classes', function () {
      parser.parse('1 .class[\n2')[0].source.should.equal('1 .class[\n2');
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
