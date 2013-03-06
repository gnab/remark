var converter = require('../../src/remark/converter')
  , config = require('../../src/remark/config')
  ;

describe('converter', function () {

  describe('convertContentClasses', function () {
    var convert = function(text) {
      var content = {innerHTML: text};
      converter.convertContentClasses(content);
      return content.innerHTML;
    };

    it('should leave regular text as is', function () {
      convert('some text').should.equal('some text');
    });

    it('should ignore class without square brackets', function () {
      convert('.class').should.equal('.class');
    });

    it('should ignore escaped class without square brackets', function () {
      convert('\\.class').should.equal('\\.class');
    });

    it('should unescape escaped class', function () {
      convert('\\.class[text]').should.equal('.class[text]');
    });

    it('should convert single class', function () {
      convert('.class[text]')
       .should.equal('&lt;span class="class"&gt;text&lt;/span&gt;');
    });

    it('should convert several classes', function () {
      convert('.class[text] and .class2[text]')
       .should.equal('&lt;span class="class"&gt;text&lt;/span&gt; and &lt;span class="class2"&gt;text&lt;/span&gt;');
    });

    it('should convert multiple classes', function () {
      convert('.a.b.c[text]')
       .should.equal('&lt;span class="a b c"&gt;text&lt;/span&gt;');
    });

    it('should convert recursive classes', function () {
      convert('.a[text.b[text]]')
       .should.equal('&lt;span class="a"&gt;text&lt;span class="b"&gt;text&lt;/span&gt;&lt;/span&gt;');
    });

    it('should convert class containing fancy markdown', function () {
      convert('.right[![title](image.png)]')
       .should.equal('&lt;span class="right"&gt;![title](image.png)&lt;/span&gt;');
    });

    it('should convert class containing multiline content into div tag', function () {
      convert('.multi[\ntest]').should.equal('&lt;div class="multi"&gt;\ntest&lt;/div&gt;');
    });
  });

  describe('convertMarkdown', function () {
    var convert = function (text) {
      var content = {
        innerHTML: text,
        childNodes: [{nodeValue: text}]
      };
      converter.convertMarkdown(content);
      return content.innerHTML;
    };

    it('should unescape block-quote before conversion', function () {
      convert('&gt; a block quote\n&gt; another block quote')
        .should.equal('<blockquote>\n<p>a block quote\nanother block quote</p>\n</blockquote>\n');
    });

    it('should unescape HTML', function () {
      convert('&lt;b class="test"&gt;a&lt;/b&gt;')
        .should.equal('<p><b class=&quot;test&quot;>a</b></p>\n');
    });

    it('should unescape once HTML escaped twice in code tags', function () {
      convert('<p><code>&amp;lt;p&amp;gt;a&amp;lt;/p&amp;gt;</code></p>')
       .should.equal('<p><code>&lt;p&gt;a&lt;/p&gt;</code></p>');
    });
  });

  describe('convertCodeClasses', function () {
    var convert = function(code, parentTagName, className) {
      var i
        , content = { nodeName: parentTagName || 'div'}
        , node = { parentNode: content, innerHTML: code, className: className || '' }
        ;

      content.getElementsByTagName = function () { return [node]; };

      converter.convertCodeClasses(content);

      return node;
    };

    beforeEach(function resetConfiguration () {
      config.set({
        highlightStyle: undefined
      , highlightLanguage: undefined
      , highlightInline: undefined
      });
    });

    it('should disable highlighting for inline code by default', function () {
      convert('var a = 5;').className.should.equal('no-highlight');
    });

    it('should enable highlighting for code by default', function () {
      convert('var a = 5;', 'pre').className.should.equal('');
    });

    it('should enable highlighting for inline code if configured to', function () {
      config.set({highlightInline: true});

      convert('var a = 5;').className.should.equal('');
    });

    it('should extract inline code class', function () {
      convert('.ruby a = 5').innerHTML.should.equal('a = 5');
    });

    it('should apply inline code class', function () {
      convert('.ruby a = 5').className.should.equal('ruby');
    });

    it('should extract code class', function () {
      convert('.ruby\na = 5').innerHTML.should.equal('a = 5');
    });

    it('should apply code class', function () {
      convert('.ruby\na = 5').className.should.equal('ruby');
    });

    it('should unescape escaped inline code class', function () {
      convert('\\.ruby a = 5').innerHTML.should.equal('.ruby a = 5');
    });

    it('should unescape escaped code class', function () {
      convert('\\.ruby\na = 5', 'pre').innerHTML.should.equal('.ruby\na = 5');
    });

    it('should use configured code class by default', function () {
      config.set({highlightLanguage: 'not-a-language'});

      convert('a = 5', 'pre').className.should.equal('not-a-language');
    });

    it('should ignore configured code class if class is given', function () {
      config.set({highlightLanguage: 'not-a-language'});

      convert('.ruby a = 5', 'pre').className.should.equal('ruby');
    });

    it('should remove lang- code class prefix', function () {
      convert('', undefined, 'lang-ruby').className.should.equal('ruby');
    });
  });

  describe('trimEmptySpace', function () {
    it('should remove empty p tags', function () {
      var content = {innerHTML: '<p> </p>\nabc\n<p></p>' };

      converter.trimEmptySpace(content);

      content.innerHTML.should.equal('\nabc\n');
    });
  });

});
