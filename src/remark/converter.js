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

converter.convertMarkdown = function (source) {
  // Unescape block-quotes before conversion (&gt; => >)
  source = source.replace(/(^|\n)( *)&gt;/g, '$1$2>');

  // Perform the actual Markdown conversion
  source = marked(source.replace(/^\s+/, ''));

  // Unescape HTML escaped by the browser; &lt;, &gt;, ...
  source = source.replace(/&[l|g]t;/g,
    function (match) {
      return match === '&lt;' ? '<' : '>';
    });

  // ... and &amp;
  source = source.replace(/&amp;/g, '&');
  
  // ... and &quot;
  source = source.replace(/&quot;/g, '"');

  return source;
};
