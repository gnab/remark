import marked from 'marked';

export default class Converter {
  constructor() {
    this.marked = marked;
    this.marked.setOptions({
      gfm: true,
      tables: true,
      breaks: false,

      // Without this set to true, converting something like
      // <p>*</p><p>*</p> will become <p><em></p><p></em></p>
      pedantic: true,

      sanitize: false,
      smartLists: true,
      langPrefix: ''
    });

    this.getMarkdownHtml = this.getMarkdownHtml.bind(this);
    this.convertMarkdown = this.convertMarkdown.bind(this);
  }

  getMarkdownHtml(element, content, links, insideContentClass) {
    let markdown = '';

    for (let i = 0; i < content.length; ++i) {
      if (typeof content[i] === 'string') {
        markdown += content[i];
      } else {
        let tag = content[i].block ? 'div' : 'span';
        markdown += '<' + tag + ' class="' + content[i].class + '">';
        markdown += this.getMarkdownHtml(element, content[i].content, links, !content[i].block);
        markdown += '</' + tag + '>';
      }
    }

    let tokens = this.marked.Lexer.lex(markdown.replace(/^\s+/, ''));
    tokens.links = links;
    let html = this.marked.Parser.parse(tokens);

    if (insideContentClass) {
      element.innerHTML = html;

      if (element.children.length === 1 && element.children[0].tagName === 'P') {
        html = element.children[0].innerHTML;
      }
    }

    return html;
  }

  convertMarkdown(content, links, inline) {
    links = links || {};
    inline = inline || false;

    let element = document.createElement('div');
    element.innerHTML = this.getMarkdownHtml(element, content, links, inline);
    element.innerHTML = element.innerHTML.replace(/<p>\s*<\/p>/g, '');
    return element.innerHTML.replace(/\n\r?$/, '');
  }
}


