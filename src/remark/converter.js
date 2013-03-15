var marked = require('marked')
  , converter = module.exports = {}
  ;

marked.setOptions({
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  langPrefix: ''
});

converter.convertContentClasses = function (content) {
  var classFinder = /(\\)?((?:\.[a-z_\-][a-z\-_0-9]*)+)\[/ig
    , match
    , classes
    , text
    , replacement
    , tag
    , after
    ;

  while ((match = classFinder.exec(content.innerHTML)) !== null) {
    text = getSquareBracketedText(content.innerHTML.substr(
          match.index + match[0].length));

    if (text === null) {
      continue;
    }

    if (match[1]) {
      // Simply remove escape slash
      replacement = match[2] + '[' + text + ']';
      classFinder.lastIndex = match.index + replacement.length;
    }
    else {
      classes = match[2].substr(1).split('.');
      tag = text.indexOf('\n') === -1 ? 'span' : 'div';

      replacement = "&lt;" + tag + " class=\"" +
        classes.join(' ') +
        "\"&gt;" +
        text +
        "&lt;/" + tag + "&gt;";

      classFinder.lastIndex = match.index +
        ("&lt;" + tag + " class=\"" + classes.join(' ') + "\"&gt;").length;
    }

    after = content.innerHTML.substr(
        match.index + match[0].length + text.length + 1);

    content.innerHTML = content.innerHTML.substr(0, match.index) +
      replacement + after;
  }
};

var getSquareBracketedText = function (text) {
  var count = 1
    , pos = 0
    , chr
    ;

  while (count > 0 && pos < text.length) {
    chr = text[pos++];
    count += (chr === '[' && 1) || (chr === ']' && -1) || 0;
  }

  return count === 0 && text.substr(0, pos - 1) || null;
};

converter.convertMarkdown = function (content) {
  // Store innerHTML in variable to allow intermediate conversion
  // into invalid HTML to handle block-quotes
  var source = content.innerHTML;

  // Unescape block-quotes before conversion (&gt; => >)
  source = source.replace(/(^|\n)( *)&gt;/g, '$1$2>');

  // Perform the actual Markdown conversion
  content.innerHTML = marked(source.replace(/^\s+/, ''));

  // Unescape HTML escaped by the browser; &lt;, &gt;, ...
  content.innerHTML = content.innerHTML.replace(/&[l|g]t;/g,
    function (match) {
      return match === '&lt;' ? '<' : '>';
    });

  // ... and &amp;
  content.innerHTML = content.innerHTML.replace(/&amp;/g, '&');
};

converter.trimEmptySpace = function (content) {
  content.innerHTML = content.innerHTML.replace(/<p>\s*<\/p>/g, '');
};
