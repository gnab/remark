var Lexer = require('./lexer'),
    converter = require('./converter');

module.exports = Parser;

function Parser () { }

Parser.prototype.parse = function (src) {
  var lexer = new Lexer(),
      tokens = lexer.lex(src),
      slides = [],
      slide = {
        source: '', 
        properties: { 
          continued: 'false'
        }
      },
      tag,
      classes;

  tokens.forEach(function (token) {
    switch (token.type) {
      case 'text':
      case 'code':
      case 'fences':
        slide.source += token.text;
        break;
      case 'content_start':
        tag = token.block ? 'div' : 'span';
        classes = token.classes.join(' ');
        slide.source += '&lt;' + tag + ' class="' + classes + '"&gt;';
        break;
      case 'content_end':
        tag = token.block ? 'div' : 'span';
        slide.source += '&lt;/' + tag + '&gt;';
        break;
      case 'separator':
        slides.push(slide);
        slide = {
          source: '', 
          properties: {
            continued: (token.text === '--').toString()
          }
        };
        break;
    }
  });

  slides.push(slide);

  slides.forEach(function (slide) {
    slide.source = extractProperties(slide.source, slide.properties);
  });

  return slides;
};

function extractProperties (source, properties) {
  var propertyFinder = /^\n*([-\w]+):([^$\n]*)/i
    , match
    ;

  while ((match = propertyFinder.exec(source)) !== null) {
    source = source.substr(0, match.index) +
      source.substr(match.index + match[0].length);

    properties[match[1].trim()] = match[2].trim();

    propertyFinder.lastIndex = match.index;
  }

  return source;
}
