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
      parser.parse('1')[0].content.should.eql(['1']);
    });

    it('should handle multiple slides', function () {
      var slides = parser.parse('1\n---\n2\n---\n3');

      slides[0].content.should.eql(['1']);
      slides[1].content.should.eql(['2']);
      slides[2].content.should.eql(['3']);
    });

    it('should handle empty source', function () {
      parser.parse('')[0].content.should.eql(['']);
    });
  });

  describe('parsing notes', function () {
    it('should map notes', function () {
      parser.parse('content\n???\nnotes')[0].notes.should.eql(['notes']);
    });

    it('should extract notes from source', function () {
      parser.parse('content\n???\nnotes')[0].content.should.eql(['content']);
    });
  });

  describe('parsing code', function () {
    it('should include code', function () {
      var slides = parser.parse('1\n    code\n2\n---\n3\n    code\n4');

      slides[0].content.should.eql(['1\n    code\n2']);
      slides[1].content.should.eql(['3\n    code\n4']);
    });

    it('should ignore content class inside code', function () {
      parser.parse('some code\n    .class[x]')[0].content.should.eql(['some code\n    .class[x]']);
    });
  });

  describe('parsing fences', function () {
    it('should include fences', function () {
      var slides = parser.parse('1\n```\n\n```\n2\n---\n3\n```\n\n```\n4');

      slides[0].content.should.eql(['1\n```\n\n```\n2']);
      slides[1].content.should.eql(['3\n```\n\n```\n4']);
    });

    it('should ignore content class inside fences', function () {
      parser.parse('```\n.class[x]\n```')[0].content
        .should.eql(['```\n.class[x]\n```']);
    });
  });

  describe('parsing content classes', function () {
    it('should convert block content classes', function () {
      parser.parse('1 .class[\nx\n] 2')[0].content
        .should.eql([
          '1 ',
          { class: 'class', block: true, content: ['\nx\n'] },
          ' 2'
        ]);
    });

    it('should convert inline content classes', function () {
      parser.parse('1 .class[x] 2')[0].content
        .should.eql([
          '1 ',
          { class: 'class', block: false, content: ['x'] },
          ' 2'
        ]);
    });

    it('should convert multiple classes', function () {
      parser.parse('1 .c1.c2[x]')[0].content
        .should.eql([
          '1 ',
          { class: 'c1 c2', block: false, content: ['x'] }
        ]);
    });

    it('should ignore unclosed inline content classes', function () {
      parser.parse('1 .class[x 2')[0].content.should.eql(['1 .class[x 2']);
    });

    it('should ignore unclosed block content classes', function () {
      parser.parse('1 .class[\n2')[0].content.should.eql(['1 .class[\n2']);
    });

    it('should parse source in content classes', function () {
      parser.parse('.c1[.c2[x]]')[0].content
        .should.eql([
          { class: 'c1', block: false, content:
            [{ class: 'c2', block: false, content: ['x'] }]
          }
        ]);
    });
  });

  describe('identifying continued slides', function () {
    it('should not identify normal, preceding slide as continued', function () {
      parser.parse('1\n--\n2\n---\n3')[0].properties.continued.should.equal('false');
    });

    it('should identify continued slide as continued', function () {
      parser.parse('1\n--\n2\n---\n3')[1].properties.continued.should.equal('true');
    });

    it('should not identify normal, succeeding slide as continued', function () {
      parser.parse('1\n--\n2\n---\n3')[2].properties.continued.should.equal('false');
    });
  });

  describe('parsing slide properties', function () {
    it('should map single property', function () {
      parser.parse('name: a\n1')[0].properties.name.should.equal('a');
    });

    it('should map multiple properties', function () {
      var slides = parser.parse('name: a\nclass:b\n1');

      slides[0].properties.name.should.equal('a');
      slides[0].properties['class'].should.equal('b');
    });

    it('should allow properties with no value', function () {
      var slides = parser.parse('a:   \n\nContent.');
      slides[0].properties.should.have.property('a', '');
    });

    it('should extract properties from source', function () {
      parser.parse('name: a\nclass:b\n1')[0].content.should.eql(['\n1']);
    });
  });

  describe('parsing content that is indented', function () {
    it('should handle leading whitespace on all lines', function () {
      var slides = parser.parse('      1\n      ---\n      2\n      ---\n      3');

      slides[0].content.should.eql(['1']);
      slides[1].content.should.eql(['2']);
      slides[2].content.should.eql(['3']);
    });

    it('should ignore empty lines when calculating whitespace to trim', function () {
      var slides = parser.parse('      1\n\n      1\n      ---\n      2\n      ---\n      3');

      slides[0].content.should.eql(['1\n\n1']);
      slides[1].content.should.eql(['2']);
      slides[2].content.should.eql(['3']);
    });

    it('should ignore blank lines when calculating whitespace to trim', function () {
      var slides = parser.parse('      1\n \n      1\n      ---\n      2\n      ---\n      3');

      slides[0].content.should.eql(['1\n\n1']);
      slides[1].content.should.eql(['2']);
      slides[2].content.should.eql(['3']);
    });

    it('should preserve leading whitespace that goes beyond the minimum whitespace on inner lines', function () {
      var slides = parser.parse('      1\n      ---\n          2\n      ---\n      3');

      slides[0].content.should.eql(['1']);
      slides[1].content.should.eql(['    2\n']); // Note: lexer includes trailing newines in code blocks
      slides[2].content.should.eql(['3']);
    });

    it('should preserve leading whitespace that goes beyond the minimum whitespace on the first line', function () {
      var slides = parser.parse('          1\n      ---\n      2\n      ---\n      3');

      slides[0].content.should.eql(['    1\n']); // Note: lexer includes trailing newines in code blocks
      slides[1].content.should.eql(['2']);
      slides[2].content.should.eql(['3']);
    });

    it('should preserve leading whitespace that goes beyond the minimum whitespace on the last line', function () {
      var slides = parser.parse('      1\n      ---\n      2\n      ---\n          3');

      slides[0].content.should.eql(['1']);
      slides[1].content.should.eql(['2']);
      slides[2].content.should.eql(['    3']);
    });
  });

  var parser;

  beforeEach(function () {
    parser = new Parser();
  });

});
