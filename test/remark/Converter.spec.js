import Converter from '../../src/remark/Converter';

describe('Converter', () => {
  it('should convert empty content', () => {
    let content = [''];
    converter.convertMarkdown(content).should.equal('');
  });

  it('should convert paragraph', () => {
    let content = ['paragraph'];
    converter.convertMarkdown(content).should.equal('<p>paragraph</p>');
  });

  it('should convert paragraph with inline content class', () => {
    let content = [
      'before ',
      { block: false, class: 'whatever', content: ['some _fancy_ content'] },
      ' after'
    ];
    converter.convertMarkdown(content).should.equal(
      '<p>before <span class="whatever">some <em>fancy</em> content</span> after</p>');
  });

  it('should convert reference-style link', () => {
    let content = ['[link][id]'],
        links = { id: { href: 'url', title: 'title'} };

    converter.convertMarkdown(content, links).should.equal(
      '<p><a href="url" title="title">link</a></p>');
  });

  let converter;

  beforeEach(() => {
    converter = new Converter();
  });
});
