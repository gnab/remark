import marked from 'marked';

export default class Converter {
  constructor(options) {
    this.marked = marked;
    this.marked.setOptions({
      gfm: true,
      sanitize: true,
      smartLists: true,
      langPrefix: '',
      ...options
    });

    this.getMarkdownHtml = this.getMarkdownHtml.bind(this);
    this.convertMarkdown = this.convertMarkdown.bind(this);
  }

  getMarkdownHtml(element, content, links, insideContentClass) {
    let html = '';

    for (let i = 0; i < content.length; ++i) {
      if (typeof content[i] === 'string') {
        let tokens = this.marked.Lexer.lex(content[i].replace(/^\s+/, ''));
        tokens.links = links;
        html += this.marked.Parser.parse(tokens);
      } else {
        let tag = content[i].block ? 'div' : 'span';
        html += '<' + tag + ' class="' + content[i].class + '">';
        html += this.getMarkdownHtml(element, content[i].content, links, !content[i].block);
        html += '</' + tag + '>';
      }
    }

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


