module.exports = Parser;

var block = {
  code: /( {4}[^\n]+\n*)+/
, fences: / *(`{3,}|~{3,}) *(?:\S+)? *\n(?:[\s\S]+?)\s*\2 *(?:\n+|$)/
, separator: /(---?)(?:\n|$)/
, element: /(?:^|\n)(?:code|fences|separator)/
};

block.element = replace(block.element)
  ('code', block.code)
  ('fences', block.fences)
  ('separator', block.separator)
  ();

function Parser () { }

Parser.prototype.parse = function (src) {
  var slides = []
    , slide = {continued: false, source: ''}
    , cap
    ;

  while (cap = block.element.exec(src)) {

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

// Copied from `marked` package
function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}
