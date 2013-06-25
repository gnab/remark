module.exports = Lexer;

var CODE = 1, 
    CONTENT = 2, 
    FENCES = 3, 
    SEPARATOR = 4,
    NOTES_SEPARATOR = 5;

var regexByName = {
    CODE: /(?:^|\n)( {4}[^\n]+\n*)+/, 
    CONTENT: /(?:\\)?((?:\.[a-z_\-][a-z\-_0-9]*)+)\[/, 
    FENCES: /(?:^|\n) *(`{3,}|~{3,}) *(?:\S+)? *\n(?:[\s\S]+?)\s*\3 *(?:\n+|$)/, 
    SEPARATOR: /(?:^|\n)(---?)(?:\n|$)/,
    NOTES_SEPARATOR: /(?:^|\n)(\?{3})(?:\n|$)/
  };

var block = replace(/CODE|CONTENT|FENCES|SEPARATOR|NOTES_SEPARATOR/, regexByName), 
    inline = replace(/CODE|CONTENT|FENCES/, regexByName);

function Lexer () { }

Lexer.prototype.lex = function (src) {
  var tokens = lex(src, block), 
      i;

  for (i = tokens.length - 2; i >= 0; i--) {
    if (tokens[i].type === 'text' && tokens[i+1].type === 'text') {
      tokens[i].text += tokens[i+1].text;
      tokens.splice(i+1, 1);
    }
  }

  return tokens;
};

function lex (src, regex, tokens) {
  var cap, text;

  tokens = tokens || [];

  while ((cap = regex.exec(src)) !== null) {
    if (cap.index > 0) {
      tokens.push({
        type: 'text', 
        text: src.substring(0, cap.index)
      });
    }

    if (cap[CODE]) {
      tokens.push({
        type: 'code',
        text: cap[0]
      });
    }
    else if (cap[FENCES]) {
      tokens.push({
        type: 'fences',
        text: cap[0]
      });
    }
    else if (cap[SEPARATOR]) {
      tokens.push({
        type: 'separator',
        text: cap[SEPARATOR]
      });
    }
    else if (cap[NOTES_SEPARATOR]) {
      tokens.push({
        type: 'notes_separator',
        text: cap[NOTES_SEPARATOR]
      });
    }
    else if (cap[CONTENT]) {
      text = getTextInBrackets(src, cap.index + cap[0].length);
      if (text !== undefined) {
        src = src.substring(text.length + 1);
        tokens.push({
          type: 'content_start',
          classes: cap[CONTENT].substring(1).split('.'),
          block: text.indexOf('\n') !== -1
        });
        lex(text, inline, tokens);
        tokens.push({
          type: 'content_end',
          block: text.indexOf('\n') !== -1
        });
      }
      else {
        tokens.push({
          type: 'text', 
          text: cap[0]
        });
      }
    }

    src = src.substring(cap.index + cap[0].length);
  }

  if (src || (!src && tokens.length === 0)) {
    tokens.push({
      type: 'text', 
      text: src
    });
  }

  return tokens;
}

function replace (regex, replacements) {
  return new RegExp(regex.source.replace(/\w{2,}/g, function (key) {
    return replacements[key].source;
  }));
}

function getTextInBrackets (src, offset) {
  var depth = 1, 
      pos = offset, 
      chr;

  while (depth > 0 && pos < src.length) {
    chr = src[pos++];
    depth += (chr === '[' && 1) || (chr === ']' && -1) || 0;
  }

  if (depth === 0) {
    src = src.substr(offset, pos - offset - 1);
    return src;
  }
}
