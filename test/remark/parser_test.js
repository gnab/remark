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

  describe('parsing notes', function () {
    it('should map notes', function () {
      parser.parse('content\n???\nnotes')[0].notes.should.equal('notes');
    });

    it('should extract notes from source', function () {
      parser.parse('content\n???\nnotes')[0].source.should.equal('content');
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
        .should.equal('1 &lt;div class="class"&gt;\nx\n&lt;/div&gt; 2');
    });

    it('should convert inline content classes', function () {
      parser.parse('1 .class[x] 2')[0].source
        .should.equal('1 &lt;span class="class"&gt;x&lt;/span&gt; 2');
    });

    it('should convert multiple classes', function () {
      parser.parse('1 .c1.c2[x]')[0].source
        .should.equal('1 &lt;span class="c1 c2"&gt;x&lt;/span&gt;');
    });

    it('should ignore unclosed inline content classes', function () {
      parser.parse('1 .class[x 2')[0].source.should.equal('1 .class[x 2');
    });

    it('should ignore unclosed block content classes', function () {
      parser.parse('1 .class[\n2')[0].source.should.equal('1 .class[\n2');
    });

    it('should parse source in content classes', function () {
      parser.parse('.c1[.c2[x]]')[0].source
        .should.equal('&lt;span class="c1"&gt;&lt;span class="c2"&gt;x&lt;/span&gt;&lt;/span&gt;');
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
      parser.parse('name: a\nclass:b\n1')[0].source.should.equal('\n1');
    });
  });

  var parser;

  beforeEach(function () {
    parser = new Parser();
  });

});
