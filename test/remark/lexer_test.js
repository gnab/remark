var Lexer = require('../../src/remark/lexer');

describe('Lexer', function () {

  describe('identifying tokens', function () {
    it('should recognize text', function () {
      lexer.lex('1').should.eql([
        {type: 'text', text: '1'}
      ]);
    });

    it('should treat empty source as empty text token', function () {
      lexer.lex('').should.eql([
        {type: 'text', text: ''}
      ]);
    });

    it('should recognize normal separator', function () {
      lexer.lex('\n---\n').should.eql([
        {type: 'separator', text: '---'}
      ]);
    });

    it('should recognize continued separators', function () {
      lexer.lex('\n--\n').should.eql([
        {type: 'separator', text: '--'}
      ]);
    });

    it('should recognize notes separator', function () {
      lexer.lex('\n???\n').should.eql([
        {type: 'notes_separator', text: '???'}
      ]);
    });

    it('should recognize code', function () {
      lexer.lex('    code').should.eql([
        {type: 'code', text: '    code'}
      ]);
    });

    it('should recognize fences', function () {
      lexer.lex('```\ncode```').should.eql([
        {type: 'fences', text: '```\ncode```'}
      ]);
    });

    it('should recognize content class', function () {
      lexer.lex('.classA[content]').should.eql([
        {type: 'content_start', classes: ['classA'], block: false},
        {type: 'text', text: 'content'},
        {type: 'content_end', block: false}
      ]);
    });

    it('should recognize multiple content classes', function () {
      lexer.lex('.c1.c2[content]').should.eql([
        {type: 'content_start', classes: ['c1', 'c2'], block: false},
        {type: 'text', text: 'content'},
        {type: 'content_end', block: false}
      ]);
    });

    it('should ignore escaped content class', function () {
      lexer.lex('\\.class[content]').should.eql([
        {type: 'text', text: '.class[content]'},
      ]);
    });

    it('should treat unclosed content class as text', function () {
      lexer.lex('text .class[content').should.eql([
        {type: 'text', text: 'text .class[content'}
      ]);
    });

    it('should leave separator inside fences as-is', function () {
      lexer.lex('```\n---\n```').should.eql([
        {type: 'fences', text: '```\n---\n```'}
      ]);
    });

    it('should leave separator inside content class as-is', function () {
      lexer.lex('.class[\n---\n]').should.eql([
        {type: 'content_start', classes: ['class'], block: true},
        {type: 'text', text: '\n---\n'},
        {type: 'content_end', block: true}
      ]);
    });

    it('should leave content class inside code as-is', function () {
      lexer.lex('    .class[x]').should.eql([
        {type: 'code', text: '    .class[x]'}
      ]);
    });

    it('should leave content class inside inline code as-is', function () {
      lexer.lex('`.class[x]`').should.eql([
        {type: 'text', text: '`.class[x]`'}
      ]);
    });

    it('should leave content class inside fences as-is', function () {
      lexer.lex('```\n.class[x]\n```').should.eql([
        {type: 'fences', text: '```\n.class[x]\n```'}
      ]);
    });

    it('should lex content classes recursively', function () {
      lexer.lex('.c1[.c2[x]]').should.eql([
        {type: 'content_start', classes: ['c1'], block: false},
        {type: 'content_start', classes: ['c2'], block: false},
        {type: 'text', text: 'x'},
        {type: 'content_end', block: false},
        {type: 'content_end', block: false}
      ]);
    });

    it('should recognize link definition', function () {
      lexer.lex('[id]: http://url.com "website"').should.eql([
        {
          type: 'def',
          id: 'id',
          href: 'http://url.com',
          title: 'website'
        }
      ]);
    });

    it('should recognise macro', function () {
      lexer.lex('![:piechart a, b, c](d)').should.eql([
        {
          type: 'macro',
          name: 'piechart',
          args: ['a', 'b', 'c'],
          obj: 'd'
        }
      ]);
    });
  });

  var lexer;

  beforeEach(function () {
    lexer = new Lexer();
  });

});
