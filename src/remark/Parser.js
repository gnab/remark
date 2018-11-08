import Lexer from './Lexer';

/**
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
 *        // Any content except for content classes are represented as strings
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
export default class Parser {
  static appendTo(element, content) {
    let target = element.content;

    if (element.notes !== undefined) {
      target = element.notes;
    }

    // If two string are added after one another, we can just as well
    // go ahead and concatenate them into a single string.
    let lastIdx = target.length - 1;

    if (typeof target[lastIdx] === 'string' && typeof content === 'string') {
      target[lastIdx] += content;
    } else {
      target.push(content);
    }
  }

  static extractProperties(source, properties) {
    let propertyFinder = /^\n*([-\w]+):([^$\n]*)|\n*(?:<!--\s*)([-\w]+):([^$\n]*?)(?:\s*-->)/i;
    let match;

    while ((match = propertyFinder.exec(source)) !== null) {
      source = source.substr(0, match.index) + source.substr(match.index + match[0].length);

      if (match[1] !== undefined) {
        properties[match[1].trim()] = match[2].trim();
      } else {
        properties[match[3].trim()] = match[4].trim();
      }

      propertyFinder.lastIndex = match.index;
    }

    return source;
  }

  static createSlide() {
    return {
      content: [],
      properties: {
        continued: 'false'
      },
      links: {}
    };
  }

  static createContentClass(token) {
    return {
      class: token.classes.join(' '),
      block: token.block,
      content: []
    };
  }

  static cleanInput(source) {
    // If all lines are indented, we should trim them all to the same point so that code doesn't
    // need to start at column 0 in the source (see GitHub Issue #105)

    // Helper to extract captures from the regex
    const getMatchCaptures = (source, pattern) => {
      let results = [];
      let match;

      while ((match = pattern.exec(source)) !== null) {
        results.push(match[1]);
      }

      return results;
    };

    // Calculate the minimum leading whitespace
    // Ensure there's at least one char that's not newline nor whitespace to ignore empty and blank lines
    let leadingWhitespacePattern = /^([ \t]*)[^ \t\n]/gm;
    let whitespace = getMatchCaptures(source, leadingWhitespacePattern).map((s) => (s.length));
    let minWhitespace = Math.min.apply(Math, whitespace);

    // Trim off the exact amount of whitespace, or less for blank lines (non-empty)
    let trimWhitespacePattern = new RegExp('^[ \\t]{0,' + minWhitespace + '}', 'gm');
    return source.replace(trimWhitespacePattern, '');
  }

  static reduceStack(stack) {
    while (stack.length >= 2) {
      Parser.appendTo(stack[stack.length - 2], stack[stack.length - 1]);
      stack.pop();
    }

    return stack;
  }

  static parse(src, options) {
    options = options || {};
    options = {
      disableIncrementalSlides: false,
      ...options
    };

    let macros = options.macros || {};
    let tokens = Lexer.lex(Parser.cleanInput(src));
    let slides = [];

    // The last item on the stack contains the current slide or
    // content class we're currently appending content to.
    let stack = [Parser.createSlide()];

    tokens.forEach((token) => {
      switch (token.type) {
        case 'text':
        case 'code':
        case 'fences':
          // Text, code and fenced code tokens are appended to their
          // respective parents as string literals, and are only included
          // in the parse process in order to reason about structure
          // (like ignoring a slide separator inside fenced code).
          Parser.appendTo(stack[stack.length - 1], token.text);

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
          let macro = macros[token.name];

          if (typeof macro !== 'function') {
            throw new Error('Macro "' + token.name + '" not found. ' +
              'You need to define macro using remark.macros[\'' +
              token.name + '\'] = function () { ... };');
          }

          let value = macro.apply(token.obj, token.args);

          if (typeof value === 'string') {
            value = Parser.parse(value, options);
            Parser.appendTo(stack[stack.length - 1], value[0].content[0]);
          } else {
            let append = value === undefined ? '' : value.toString();
            Parser.appendTo(stack[stack.length - 1], append);
          }

          break;
        case 'content_start':
          // Entering content class, so create stack entry for appending
          // upcoming content to.
          //
          // Lexer handles open/close bracket balance, so there's no need
          // to worry about there being a matching closing bracket.
          stack.push(Parser.createContentClass(token));

          break;
        case 'content_end':
          // Exiting content class, so remove entry from stack and
          // append to previous item (outer content class or slide).
          stack = Parser.reduceStack(stack);
          break;
        case 'separator':
          stack = Parser.reduceStack(stack);

          // Just continue on the same slide if incremental slides are disabled
          if (token.text === '--' && options.disableIncrementalSlides === true) {
            // If it happens that there was a note section right before, just get
            // rid of it
            if (stack[0].notes !== undefined) {
              delete(stack[0].notes);
            }

            break;
          }

          // Slide separator (--- or --), so add current slide to list of
          // slides and re-initialize stack with new, blank slide.
          slides.push(stack[0]);
          stack = [Parser.createSlide()];

          // Tag the new slide as a continued slide if the separator
          // used was -- instead of --- (2 vs. 3 dashes).
          stack[0].properties.continued = (token.text === '--').toString();

          break;
        case 'column_separator':
          if (stack.length === 1) {
            let currentContent = stack[0].content;
            stack[0].content = [];

            stack.push({
              class: 'remark-slide__column',
              block: true,
              content: currentContent
            });
          }

          stack[0].properties.columns = (stack[0].properties.columns || 1) + 1;
          stack = Parser.reduceStack(stack);
          stack.push(Parser.createContentClass({
            classes: ['remark-slide__column'],
            block: true
          }));

          break;
        case 'notes_separator':
          // Notes separator (???), so create empty content list on slide
          // in which all remaining slide content will be put.
          stack[0].notes = [];

          break;
      }
    });

    if (stack.length > 1) {
      stack = Parser.reduceStack(stack);
    }

    // Push current slide to list of slides.
    slides.push(stack[0]);

    slides.forEach((slide) => {
      slide.content[0] = Parser.extractProperties(slide.content[0] || '', slide.properties);
    });

    return slides.filter((slide) => {
      let exclude = (slide.properties.exclude || '').toLowerCase();
      return (exclude === 'true') === false;
    });
  }
}
