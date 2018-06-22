const CODE = 1;
const INLINE_CODE = 2;
const CONTENT = 3;
const FENCES = 4;
const DEF = 5;
const DEF_HREF = 6;
const DEF_TITLE = 7;
const MACRO = 8;
const MACRO_ARGS = 9;
const MACRO_OBJ = 10;
const SLIDE_SEPARATOR = 11;
const FRAGMENT_SEPARATOR = 12;
const NOTES_SEPARATOR = 13;

const REGEX_BY_NAME = {
    CODE: /(?:^|\n\n)( {4}[^\n]+\n*)+/,
    INLINE_CODE: /`([^`].*?)`/,
    CONTENT: /(?:\\)?((?:\.[a-zA-Z_\-][a-zA-Z\-_0-9]*)+)\[/,
    FENCES: /(?:^|\n) *(`{3,}|~{3,}) *(?:\S+)? *\n(?:[\s\S]+?)\s*\4 *(?:\n+|$)/,
    DEF: /(?:^|\n) *\[([^\]]+)]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
    MACRO: /!\[:([^\] ]+)([^\]]*)](?:\(([^)]*)\))?/,
    SLIDE_SEPARATOR: /(?:^|\n)(---)(?:\n|$)/,
    FRAGMENT_SEPARATOR: /(?:^|\n)(--)(?![^\n])/,
    NOTES_SEPARATOR: /(?:^|\n)(\?{3})(?:\n|$)/
  };

const replace = (regex, replacements) => {
  return new RegExp(regex.source.replace(/\w{2,}/g, (key) => (replacements[key].source)));
};

const BLOCK = replace(
  /CODE|INLINE_CODE|CONTENT|FENCES|DEF|MACRO|SLIDE_SEPARATOR|FRAGMENT_SEPARATOR|NOTES_SEPARATOR/,
  REGEX_BY_NAME
);
const INLINE = replace(/CODE|INLINE_CODE|CONTENT|FENCES|DEF|MACRO/, REGEX_BY_NAME);

export default class Lexer {
  static getTextInBrackets(src, offset) {
    let depth = 1;
    let pos = offset;

    while (depth > 0 && pos < src.length) {
      let chr = src[pos++];
      depth += (chr === '[' && 1) || (chr === ']' && -1) || 0;
    }

    if (depth === 0) {
      src = src.substr(offset, pos - offset - 1);
      return src;
    }
  }

  static tokenize(src, regex, tokens) {
    let cap;
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
      } else if (cap[INLINE_CODE]) {
        tokens.push({
          type: 'text',
          text: cap[0]
        });
      } else if (cap[FENCES]) {
        tokens.push({
          type: 'fences',
          text: cap[0]
        });
      } else if (cap[DEF]) {
        tokens.push({
          type: 'def',
          id: cap[DEF].toLowerCase(),
          href: cap[DEF_HREF],
          title: cap[DEF_TITLE]
        });
      } else if (cap[MACRO]) {
        tokens.push({
          type: 'macro',
          name: cap[MACRO],
          args: (cap[MACRO_ARGS] || '').split(',').map((text) => (typeof text === 'string') ? text.trim() : text),
          obj: cap[MACRO_OBJ]
        });
      } else if (cap[SLIDE_SEPARATOR] || cap[FRAGMENT_SEPARATOR]) {
        tokens.push({
          type: 'separator',
          text: cap[SLIDE_SEPARATOR] || cap[FRAGMENT_SEPARATOR]
        });
      } else if (cap[NOTES_SEPARATOR]) {
        tokens.push({
          type: 'notes_separator',
          text: cap[NOTES_SEPARATOR]
        });
      } else if (cap[CONTENT]) {
        let text = Lexer.getTextInBrackets(src, cap.index + cap[0].length);

        if (text !== undefined) {
          src = src.substring(text.length + 1);

          if (cap[0][0] !== '\\') {
            tokens.push({
              type: 'content_start',
              classes: cap[CONTENT].substring(1).split('.'),
              block: text.indexOf('\n') !== -1
            });
            tokenize(text, INLINE, tokens);
            tokens.push({
              type: 'content_end',
              block: text.indexOf('\n') !== -1
            });
          } else {
            tokens.push({
              type: 'text',
              text: cap[0].substring(1) + text + ']'
            });
          }
        } else {
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

  static lex(src) {
    let tokens = Lexer.tokenize(src.replace('\r', ''), BLOCK);

    for (let i = tokens.length - 2; i >= 0; i--) {
      if (tokens[i].type === 'text' && tokens[i+1].type === 'text') {
        tokens[i].text += tokens[i+1].text;
        tokens.splice(i+1, 1);
      }
    }

    return tokens;
  }
}
