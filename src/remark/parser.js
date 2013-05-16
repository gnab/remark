module.exports = Parser;

var regex = replace(/code|content|fences|separator/, {
    code: /(?:^|\n)( {4}[^\n]+\n*)+/
  , content: /(?:\\)?((?:\.[a-z_\-][a-z\-_0-9]*)+)\[/
  , fences: /(?:^|\n) *(`{3,}|~{3,}) *(?:\S+)? *\n(?:[\s\S]+?)\s*\3 *(?:\n+|$)/
  , separator: /(?:^|\n)(---?)(?:\n|$)/
  });

function Parser () { }

Parser.prototype.parse = function (src) {
  var slides = []
    , slide = {continued: false, source: ''}
    , cap
    , text
    ;

  while (cap = regex.exec(src)) {

    // Code
    if (cap[1]) {
      slide.source += src.substring(0, cap.index + cap[0].length);
      src = src.substring(cap.index + cap[0].length);
      continue;
    }

    // Content class
    if (cap[2]) {
      text = getSquareBracketedText(src, cap.index + cap[0].length);
      if (text === null) {
        slide.source += src.substring(0, cap.index + cap[0].length);
        src = src.substring(cap.index + cap[0].length);
      }
      else {
        slide.source += src.substring(0, cap.index)
          + surroundWithTag(text, cap[2].substring(1),
            text.indexOf('\n') === -1 ? 'span' : 'div');
        src = src.substring(cap.index + cap[0].length + text.length + 1);
      }
      continue;
    }

    // Fences
    if (cap[3]) {
      slide.source += src.substring(0, cap.index + cap[0].length);
      src = src.substring(cap.index + cap[0].length);
      continue;
    }

    // Separator
    if (cap[4]) {
      slide.source += src.substring(0, cap.index);
      slides.push(slide);
      slide = {continued: cap[4] === '--', source: ''};
      src = src.substring(cap.index + cap[0].length);
      continue;
    }
  }

  if (src || (!src && slides.length === 0)) {
    slide.source += src;
    slides.push(slide);
  }

  return slides;
};

function replace (regex, replacements) {
  return new RegExp(regex.source.replace(/\w{2,}/g, function (key) {
    return replacements[key].source;
  }));
}

function getSquareBracketedText (text, offset) {
  var depth = 1
    , pos = offset
    , chr
    ;

  while (depth > 0 && pos < text.length) {
    chr = text[pos++];
    depth += (chr === '[' && 1) || (chr === ']' && -1) || 0;
  }

  return depth === 0 && text.substr(offset, pos - offset - 1) || null;
};

function surroundWithTag (text, className, tag) {
  return '<' + tag + (className && ' class="' + className + '"' || '') + '>'
    + text + '</' + tag + '>';
}
