var Lexer = require('./lexer');

module.exports = Parser;

function Parser () { }

Parser.prototype.parse = function (src) {
  var lexer = new Lexer(),
      tokens = lexer.lex(src),
      slides = [],
      slide = {source: '', continued: false},
      tag;

  tokens.each(function (token) {
    switch (token.type) {
      case 'text':
      case 'code':
      case 'fences':
        slide.source += token.text;
        break;
      case 'content_start':
        tag = token.block ? 'div' : 'span';
        slide.source += '<' + tag + ' class="' + token['class'] + '">';
        break;
      case 'content_end':
        tag = token.block ? 'div' : 'span';
        slide.source += '</' + tag + '>';
        break;
      case 'separator':
        slides.push(slide);
        slide = {source: '', continued: token.text === '--'}
        break;
    }
  });

  slides.push(slide);

  return slides;
}
