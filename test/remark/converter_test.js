var converter = require('../../src/remark/converter');

describe('converter', function () {

  describe('convertMarkdown', function () {
    var convert = converter.convertMarkdown;

    it('should unescape block-quote before conversion', function () {
      convert('&gt; a block quote\n&gt; another block quote')
        .should.equal('<blockquote>\n<p>a block quote\nanother block quote</p>\n</blockquote>\n');
    });

    it('should unescape HTML', function () {
      convert('&lt;b class="test"&gt;a&lt;/b&gt;')
        .should.equal('<p><b class="test">a</b></p>\n');
    });

    it('should unescape once HTML escaped twice in code tags', function () {
      convert('<p><code>&amp;lt;p&amp;gt;a&amp;lt;/p&amp;gt;</code></p>')
       .should.equal('<p><code>&lt;p&gt;a&lt;/p&gt;</code></p>');
    });
  });

});
