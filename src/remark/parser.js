module.exports = Parser;

var block = {
  code: /( {4}[^\n]+\n*)+/
, fences: / *(`{3,}|~{3,}) *(?:\S+)? *\n(?:[\s\S]+?)\s*\1 *(?:\n+|$)/
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
    , continued = false
    , cap
    ;

  while (cap = block.element.exec(src)) {
    // Code
    if (cap[1]) {
      src = src.substring(cap.index + cap[0].length)
      continue;
    }

    // Fences
    if (cap[2]) {
      src = src.substring(cap.index + cap[0].length)
      continue;
    }

    // Separator
    if (cap[3]) {
      slides.push({continued: continued});
      continued = cap[3] === '--';
      src = src.substring(cap.index + cap[0].length)
      continue;
    }
  }

  if (src || (!src && slides.length === 0)) {
    slides.push({continued: continued});
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
