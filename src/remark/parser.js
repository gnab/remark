module.exports = Parser;

var regex = replace(/(?:^|\n)(?:code|fences|separator)/, {
    code: /( {4}[^\n]+\n*)+/
  , fences: / *(`{3,}|~{3,}) *(?:\S+)? *\n(?:[\s\S]+?)\s*\2 *(?:\n+|$)/
  , separator: /(---?)(?:\n|$)/
  });

function Parser () { }

Parser.prototype.parse = function (src) {
  var slides = []
    , slide = {continued: false, source: ''}
    , cap
    ;

  while (cap = regex.exec(src)) {

    // Code
    if (cap[1]) {
      slide.source += src.substring(0, cap.index + cap[0].length);
      src = src.substring(cap.index + cap[0].length);
      continue;
    }

    // Fences
    if (cap[2]) {
      slide.source += src.substring(0, cap.index + cap[0].length);
      src = src.substring(cap.index + cap[0].length);
      continue;
    }

    // Separator
    if (cap[3]) {
      slide.source += src.substring(0, cap.index);
      slides.push(slide);
      slide = {continued: cap[3] === '--', source: ''};
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
