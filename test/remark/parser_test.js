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
    
    describe('when slide contains code', function () {
      it('should include leading code', function () {
        parser.parse('    code\n\n1')[0].source.should.equal('    code\n\n1');
      });
      
      it('should include intermediate code', function () {
        parser.parse('a\n\n    code\n\nb')[0].source.should.equal('a\n\n    code\n\nb');
      });
      
      it('should include trailing code', function () {
        parser.parse('1\n\n    code')[0].source.should.equal('1\n\n    code');
      });
    });
    
    describe('when slide contains fences', function () {
      it('should include leading fences', function () {
        parser.parse('```\n\n```\n\n1')[0].source.should.equal('```\n\n```\n\n1');
      });
      
      it('should include intermediate fences', function () {
        parser.parse('a\n\n```\n\n```\n\nb')[0].source.should.equal('a\n\n```\n\n```\n\nb');
      });
      
      it('should include trailing fences', function () {
        parser.parse('1\n\n```\n\n```')[0].source.should.equal('1\n\n```\n\n```');
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
