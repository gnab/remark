var converter = require('../../src/remark/converter');

describe('Converter', function () {
  it('should convert empty content', function () {
    var content = [''];
    converter.convertMarkdown(content).should.equal('');
  });

  it('should convert paragraph', function () {
    var content = ['paragraph'];
    converter.convertMarkdown(content).should.equal('<p>paragraph</p>\n');
  });

  it('should convert paragraph with inline content class', function () {
    var content = [
      'before ',
      { block: false, class: 'whatever', content: ['some _fancy_ content'] },
      ' after'
    ];
    converter.convertMarkdown(content).should.equal(
      '<p>before <span class="whatever">some <em>fancy</em> content</span> after</p>\n');
  });
});
