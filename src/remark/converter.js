var commonmark = require('commonmark')
  , converter = module.exports = {}
  , element = document.createElement('div')
  ;

converter.convertMarkdown = function (content, links, inline) {
  element.innerHTML = convertMarkdown(content, links || {}, inline);
  element.innerHTML = element.innerHTML.replace(/<p>\s*<\/p>/g, '');
  return element.innerHTML.replace(/\n\r?$/, '');
};

function convertMarkdown (content, links, insideContentClass) {
  var i, tag, markdown = '', html;

  for (i = 0; i < content.length; ++i) {
    if (typeof content[i] === 'string') {
      markdown += content[i];
    }
    else {
      tag = content[i].block ? 'div' : 'span';
      markdown += '<' + tag + ' class="' + content[i].class + '">';
      markdown += convertMarkdown(content[i].content, links, true);
      markdown += '</' + tag + '>';
    }
  }

  html = markdownToHtml(markdown, links);

  if (insideContentClass) {
    element.innerHTML = html;
    if (element.children.length === 1 && element.children[0].tagName === 'P') {
      html = element.children[0].innerHTML;
    }
  }

  return html;
}

function markdownToHtml (markdown, links) {
  var refmap = {};

  for (var ref in links) {
    refmap[
        '[' +
        ref.trim().replace(/\s+/, ' ').toUpperCase() +
        ']'] = {
      destination: links[ref].href,
      title: links[ref].title
    };
  }

  var reader = new commonmark.DocParser();

  // Patch inline parser to use custom refmap
  var parse = reader.inlineParser.parse;
  reader.inlineParser.parse = function (s/*, refmap*/) {
    return parse.call(this, s, refmap);
  };

  var writer = new commonmark.HtmlRenderer();
  var parsed = reader.parse(markdown);
  var result = writer.render(parsed);

  return result;
}
