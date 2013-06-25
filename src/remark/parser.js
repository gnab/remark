var Lexer = require('./lexer'),
    converter = require('./converter');

module.exports = Parser;

function Parser () { }

Parser.prototype.parse = function (src) {
  var lexer = new Lexer(),
      tokens = lexer.lex(src),
      slides = [],
      slide = createSlide(),
      tag,
      classes;

  tokens.forEach(function (token) {
    switch (token.type) {
      case 'text':
      case 'code':
      case 'fences':
        appendTo(slide, token.text);
        break;
      case 'content_start':
        tag = token.block ? 'div' : 'span';
        classes = token.classes.join(' ');
        appendTo(slide, '&lt;' + tag + ' class="' + classes + '"&gt;');
        break;
      case 'content_end':
        tag = token.block ? 'div' : 'span';
        appendTo(slide, '&lt;/' + tag + '&gt;');
        break;
      case 'separator':
        slides.push(slide);
        slide = createSlide();
        slide.properties.continued = (token.text === '--').toString();
        break;
      case 'notes_separator':
        slide.notes = '';
        break;
    }
  });

  slides.push(slide);

  slides.forEach(function (slide) {
    slide.source = extractProperties(slide.source, slide.properties);
  });

  return slides;
};

function createSlide () {
  return {
    source: '', 
    properties: { 
      continued: 'false'
    }
  };
}

function appendTo (slide, content) {
  if (slide.notes !== undefined) {
    slide.notes += content;
  }
  else {
    slide.source += content;
  }
}

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
