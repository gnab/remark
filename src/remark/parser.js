var Lexer = require('./lexer');

module.exports = Parser;

function Parser () { }

/*
 *  Parses source string into list of slides.
 *
 *  Output format:
 *
 *  [
 *    // Per slide
 *    {
 *      // Properties
 *      properties: {
 *        name: 'value'
 *      },
 *      // Notes (optional, same format as content list)
 *      notes: [...],
 *      // Link definitions
 *      links: {
 *        id: { href: 'url', title: 'optional title' },
 *        ...
 *      ],
 *      content: [
 *        // Any content but content classes are represented as strings
 *        'plain text ',
 *        // Content classes are represented as objects
 *        { block: false, class: 'the-class', content: [...] },
 *        { block: true, class: 'the-class', content: [...] },
 *        ...
 *      ]
 *    },
 *    ...
 *  ]
 */
Parser.prototype.parse = function (src, macros) {
  var self = this,
      lexer = new Lexer(),
      tokens = lexer.lex(cleanInput(src)),
      slides = [],

      // The last item on the stack contains the current slide or
      // content class we're currently appending content to.
      stack = [createSlide()];

  macros = macros || {};

  tokens.forEach(function (token) {
    switch (token.type) {
      case 'text':
      case 'code':
      case 'fences':
        // Text, code and fenced code tokens are appended to their
        // respective parents as string literals, and are only included
        // in the parse process in order to reason about structure
        // (like ignoring a slide separator inside fenced code).
        appendTo(stack[stack.length - 1], token.text);
        break;
      case 'def':
        // Link definition
        stack[0].links[token.id] = {
          href: token.href,
          title: token.title
        };
        break;
      case 'macro':
        // Macro
        var macro = macros[token.name];
        if (typeof macro !== 'function') {
          throw new Error('Macro "' + token.name + '" not found. ' +
              'You need to define macro using remark.macros[\'' +
              token.name + '\'] = function () { ... };');
        }
        var value = macro.apply(token.obj, token.args);
        if (typeof value === 'string') {
          value = self.parse(value, macros);
          appendTo(stack[stack.length - 1], value[0].content[0]);
        }
        else {
          appendTo(stack[stack.length - 1], value === undefined ?
              '' : value.toString());
        }
        break;
      case 'content_start':
        // Entering content class, so create stack entry for appending
        // upcoming content to.
        //
        // Lexer handles open/close bracket balance, so there's no need
        // to worry about there being a matching closing bracket.
        stack.push(createContentClass(token));
        break;
      case 'content_end':
        // Exiting content class, so remove entry from stack and
        // append to previous item (outer content class or slide).
        appendTo(stack[stack.length - 2], stack[stack.length - 1]);
        stack.pop();
        break;
      case 'separator':
        // Slide separator (--- or --), so add current slide to list of
        // slides and re-initialize stack with new, blank slide.
        slides.push(stack[0]);
        stack = [createSlide()];
        // Tag the new slide as a continued slide if the separator
        // used was -- instead of --- (2 vs. 3 dashes).
        stack[0].properties.continued = (token.text === '--').toString();
        break;
      case 'notes_separator':
        // Notes separator (???), so create empty content list on slide
        // in which all remaining slide content will be put.
        stack[0].notes = [];
        break;
    }
  });

  // Push current slide to list of slides.
  slides.push(stack[0]);

  slides.forEach(function (slide) {
    slide.content[0] = extractProperties(slide.content[0] || '', slide.properties);
  });

  return slides.filter(function (slide) {
    var exclude = (slide.properties.exclude || '').toLowerCase();

    if (exclude === 'true') {
      return false;
    }

    return true;
  });
};

function createSlide () {
  return {
    content: [],
    properties: {
      continued: 'false'
    },
    links: {}
  };
}

function createContentClass (token) {
  return {
    class: token.classes.join(' '),
    block: token.block,
    content: []
  };
}

function appendTo (element, content) {
  var target = element.content;

  if (element.notes !== undefined) {
    target = element.notes;
  }

  // If two string are added after one another, we can just as well
  // go ahead and concatenate them into a single string.
  var lastIdx = target.length - 1;
  if (typeof target[lastIdx] === 'string' && typeof content === 'string') {
    target[lastIdx] += content;
  }
  else {
    target.push(content);
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

function cleanInput(source) {
  // If all lines are indented, we should trim them all to the same point so that code doesn't
  // need to start at column 0 in the source (see GitHub Issue #105)

  // Helper to extract captures from the regex
  var getMatchCaptures = function (source, pattern) {
    var results = [], match;
    while ((match = pattern.exec(source)) !== null)
      results.push(match[1]);
    return results;
  };

  // Calculate the minimum leading whitespace
  // Ensure there's at least one char that's not newline nor whitespace to ignore empty and blank lines
  var leadingWhitespacePattern = /^([ \t]*)[^ \t\n]/gm;
  var whitespace = getMatchCaptures(source, leadingWhitespacePattern).map(function (s) { return s.length; });
  var minWhitespace = Math.min.apply(Math, whitespace);

  // Trim off the exact amount of whitespace, or less for blank lines (non-empty)
  var trimWhitespacePattern = new RegExp('^[ \\t]{0,' + minWhitespace + '}', 'gm');
  return source.replace(trimWhitespacePattern, '');
}
