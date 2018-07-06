import Lexer from '../../src/remark/Lexer';

describe('Lexer', () => {
  describe('identifying tokens', () => {
    it('should recognize text', () => {
      lexer.lex('1').should.eql([
        {type: 'text', text: '1'}
      ]);
    });

    it('should treat empty source as empty text token', () => {
      lexer.lex('').should.eql([
        {type: 'text', text: ''}
      ]);
    });

    it('should recognize normal separator', () => {
      lexer.lex('\n---').should.eql([
        {type: 'separator', text: '---'}
      ]);
    });

    it('should not preserve trailing line breaks of normal separators', () => {
      lexer.lex('\n---\n').should.eql([
        {type: 'separator', text: '---'}
      ]);
    });

    it('should recognize continued separator', () => {
      lexer.lex('\n--').should.eql([
        {type: 'separator', text: '--'},
      ]);
    });

    it('should preserve trailing line breaks of continued separators', () => {
      lexer.lex('\n--\n').should.eql([
        {type: 'separator', text: '--'},
        {type: 'text', text: '\n'}
      ]);
    });

    it('should recognize notes separator', () => {
      lexer.lex('\n???\n').should.eql([
        {type: 'notes_separator', text: '???'}
      ]);
    });

    it('should recognize code', () => {
      lexer.lex('    code').should.eql([
        {type: 'code', text: '    code'}
      ]);
    });

    it('should recognize inline code using single backticks', () => {
      lexer.lex('`code`').should.eql([
        {type: 'text', text: '`code`'}
      ]);
    });

    it('should recognize inline code using multiple backticks', () => {
      lexer.lex('``code``').should.eql([
        {type: 'text', text: '``code``'}
      ]);
    });

    it('should recognize inline code containing escaped backticks', () => {
      lexer.lex('`` `code` ``').should.eql([
        {type: 'text', text: '`` `code` ``'}
      ]);
    });

    it('should recognize fences', () => {
      lexer.lex('```\ncode```').should.eql([
        {type: 'fences', text: '```\ncode```'}
      ]);
    });

    it('should recognize content class', () => {
      lexer.lex('.classA[content]').should.eql([
        {type: 'content_start', classes: ['classA'], block: false},
        {type: 'text', text: 'content'},
        {type: 'content_end', block: false}
      ]);
    });

    it('should recognize multiple content classes', () => {
      lexer.lex('.c1.c2[content]').should.eql([
        {type: 'content_start', classes: ['c1', 'c2'], block: false},
        {type: 'text', text: 'content'},
        {type: 'content_end', block: false}
      ]);
    });

    it('should ignore escaped content class', () => {
      lexer.lex('\\.class[content]').should.eql([
        {type: 'text', text: '.class[content]'},
      ]);
    });

    it('should treat unclosed content class as text', () => {
      lexer.lex('text .class[content').should.eql([
        {type: 'text', text: 'text .class[content'}
      ]);
    });

    it('should leave separator inside fences as-is', () => {
      lexer.lex('```\n---\n```').should.eql([
        {type: 'fences', text: '```\n---\n```'}
      ]);
    });

    it('should leave separator inside content class as-is', () => {
      lexer.lex('.class[\n---\n]').should.eql([
        {type: 'content_start', classes: ['class'], block: true},
        {type: 'text', text: '\n---\n'},
        {type: 'content_end', block: true}
      ]);
    });

    it('should leave content class inside code as-is', () => {
      lexer.lex('    .class[x]').should.eql([
        {type: 'code', text: '    .class[x]'}
      ]);
    });

    it('should leave content class inside inline code as-is', () => {
      lexer.lex('`.class[x]`').should.eql([
        {type: 'text', text: '`.class[x]`'}
      ]);
    });

    it('should leave content class inside fences as-is', () => {
      lexer.lex('```\n.class[x]\n```').should.eql([
        {type: 'fences', text: '```\n.class[x]\n```'}
      ]);
    });

    it('should lex content classes recursively', () => {
      lexer.lex('.c1[.c2[x]]').should.eql([
        {type: 'content_start', classes: ['c1'], block: false},
        {type: 'content_start', classes: ['c2'], block: false},
        {type: 'text', text: 'x'},
        {type: 'content_end', block: false},
        {type: 'content_end', block: false}
      ]);
    });

    it('should recognize link definition', () => {
      lexer.lex('[id]: http://url.com "website"').should.eql([
        {
          type: 'def',
          id: 'id',
          href: 'http://url.com',
          title: 'website'
        }
      ]);
    });

    it('should recognise macro', () => {
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

  let lexer;

  beforeEach(() => {
    lexer = Lexer;
  });
});
