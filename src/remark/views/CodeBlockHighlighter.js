import hljs from 'highlight.js';
import { addClass } from "../utils";

export default class CodeBlockHighlighter {
  constructor(slideShow) {
    this.slideShow = slideShow;

    this.highlightCodeBlocks = this.highlightCodeBlocks.bind(this);
  }

  highlightCodeBlocks(content) {
    let codeBlocks = content.getElementsByTagName('code');
    let options = this.slideShow.getOptions();
    let highlightLines = options.highlightLines;
    let highlightSpans = options.highlightSpans;
    let highlightInline = options.highlightInlineCode;
    let meta;

    codeBlocks.forEach((block) => {
      if (block.hasOwnProperty('className') && block.className === '') {
        block.className = options.highlightLanguage;
      }

      if (block.parentElement.tagName !== 'PRE') {
        addClass(block, 'remark-inline-code');

        if (highlightInline) {
          hljs.highlightBlock(block, '');
        }

        return;
      }

      if (highlightLines) {
        meta = CodeBlockHighlighter.extractMetadata(block);
      }

      if (block.className !== '') {
        hljs.highlightBlock(block, '  ');
      }

      CodeBlockHighlighter.wrapLines(block);

      if (highlightLines) {
        CodeBlockHighlighter.highlightBlockLines(block, meta.highlightedLines);
      }

      if (highlightSpans) {
        // highlightSpans is either true or a RegExp
        CodeBlockHighlighter.highlightBlockSpans(block, highlightSpans);
      }

      addClass(block, 'remark-code');
    });
  }

  static extractMetadata(block) {
    let highlightedLines = [];

    block.innerHTML = block.innerHTML.split(/\r?\n/).map((line, i) => {
      if (line.indexOf('*') === 0) {
        highlightedLines.push(i);
        return line.replace(/^\*( )?/, '$1$1');
      }

      return line;
    }).join('\n');

    return {
      highlightedLines: highlightedLines
    };
  }

  static wrapLines(block) {
    let lines = block.innerHTML.split(/\r?\n/).map((line) => {
      return '<div class="remark-code__line">' + line + '</div>';
    });

    // Remove empty last line (due to last \n)
    if (lines.length && lines[lines.length - 1].indexOf('><') !== -1) {
      lines.pop();
    }

    block.innerHTML = lines.join('');
  }

  static highlightBlockLines(block, lines) {
    lines.forEach((i) => {
      addClass(block.childNodes[i], 'remark-code__line--highlighted');
    });
  }

  static highlightBlockSpans(block, highlightSpans) {
    let pattern;

    if (highlightSpans === true) {
      pattern = /([^`])`([^`]+?)`/g;
    } else if (highlightSpans instanceof RegExp) {
      if (!highlightSpans.global) {
        throw new Error('The regular expression in `highlightSpans` must have flag /g');
      }
      // Use [^] instead of dot (.) so that even newlines match
      // We prefix the escape group, so users can provide nicer regular expressions
      let flags = highlightSpans.flags || 'g'; // ES6 feature; use if it’s available
      pattern = new RegExp('([^])' + highlightSpans.source, flags);
    } else {
      throw new Error('Illegal value for `highlightSpans`');
    }

    block.childNodes.forEach((element) => {
      element.innerHTML = element.innerHTML.replace(
        pattern,
        (m, e, c) => {
          return (e === '\\') ? m.substr(1) : e + '<span class="remark-code__span--highlighted">' + c + '</span>';
        });
    });
  }
}