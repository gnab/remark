var converter = require('../src/remark/converter')
  , config = require('../src/remark/config')
  ;

describe('converter', function () {

  describe('convertSlideClasses', function () {
    var convert = function(text) {
      var content = {innerHTML: text};
      converter.convertSlideClasses(content);
      return content;
    };

    it('should leave regular text as it', function () {
      convert('some text').innerHTML.should.equal('some text');
    });

    it('should ignore class not on beginning of line', function () {
      convert(' .class').innerHTML.should.equal(' .class');
    });

    it('should unescape escaped test', function () {
      convert('\\.class').innerHTML.should.equal('.class');
    });

    it('should ignore content class with square brackets', function () {
      convert('.class[text]').innerHTML.should.equal('.class[text]');
    });

    it('should extract single class', function () {
      convert('.class').innerHTML.should.equal('');
    });

    it('should apply single class', function () {
      convert('.class').className.should.equal('content class');
    });

    it('should extract multiple classes', function () {
      convert('.a.b.c').innerHTML.should.equal('');
    });

    it('should apply multiple classes', function () {
      convert('.a.b.c').className.should.equal('content a b c');
    });
  });

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
       .should.equal('<span class="class">text</span>')
    });

    it('should convert several classes', function () {
      convert('.class[text] and .class2[text]')
       .should.equal('<span class="class">text</span> and <span class="class2">text</span>')
    });

    it('should convert multiple classes', function () {
      convert('.a.b.c[text]')
       .should.equal('<span class="a b c">text</span>');
    });

    it('should convert recursive classes', function () {
      convert('.a[text.b[text]]')
       .should.equal('<span class="a">text<span class="b">text</span></span>');
    });

    it('should convert class containing fancy markdown', function () {
      convert('.right[![title](image.png)]')
       .should.equal('<span class="right">![title](image.png)</span>')
    });
  });

  describe('convertMarkdown', function () {
    var convert = function (text) {
      var content = {innerHTML: text};
      converter.convertMarkdown(content)
      return content.innerHTML;
    };

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
    var convert = function(code, parentTagName) {
      var i
        , content = { nodeName: parentTagName || 'div'}
        , node = { parentNode: content, innerHTML: code, className: '' }
        ;

      content.getElementsByTagName = function () { return [node]; };

      converter.convertCodeClasses(content);

      return node;
    };

    before(function resetConfiguration () {
      config({
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
      config({highlightInline: true});

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
      config({highlightLanguage: 'not-a-language'});

      convert('a = 5', 'pre').className.should.equal('not-a-language');
    });

    it('should ignore configured code class if class is given', function () {
      config({highlightLanguage: 'not-a-language'});

      convert('.ruby a = 5', 'pre').className.should.equal('ruby');
    });
  });

});
