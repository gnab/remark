buster.spec.expose();

describe('converter', function () {

  describe('convertSlideClasses', function () {
    var convert = function(text) {
      var content = {innerHTML: text};
      remark.converter.convertSlideClasses(content);
      return content;
    };

    it('should leave regular text as it', function () {
      expect(convert('some text').innerHTML).toEqual('some text');
    });

    it('should ignore class not on beginning of line', function () {
      expect(convert(' .class').innerHTML).toEqual(' .class');
    });

    it('should unescape escaped test', function () {
      expect(convert('\\.class').innerHTML).toEqual('.class');
    });

    it('should ignore content class with square brackets', function () {
      expect(convert('.class[text]').innerHTML).toEqual('.class[text]');
    });

    it('should extract single class', function () {
      expect(convert('.class').innerHTML).toEqual('');
    });

    it('should apply single class', function () {
      expect(convert('.class').className).toEqual('content class');
    });

    it('should extract multiple classes', function () {
      expect(convert('.a.b.c').innerHTML).toEqual('');
    });

    it('should apply multiple classes', function () {
      expect(convert('.a.b.c').className).toEqual('content a b c');
    });
  });

  describe('convertContentClasses', function () {
    var convert = function(text) {
      var content = {innerHTML: text};
      remark.converter.convertContentClasses(content);
      return content.innerHTML;
    };

    it('should leave regular text as is', function () {
      expect(convert('some text')).toEqual('some text');
    });

    it('should ignore class without square brackets', function () {
      expect(convert('.class')).toEqual('.class');
    });

    it('should ignore escaped class without square brackets', function () {
      expect(convert('\\.class')).toEqual('\\.class');
    });

    it('should unescape escaped class', function () {
      expect(convert('\\.class[text]')).toEqual('.class[text]');
    });

    it('should convert single class', function () {
      expect(convert('.class[text]'))
        .toEqual('<span class="class">text</span>')
    });

    it('should convert several classes', function () {
      expect(convert('.class[text] and .class2[text]'))
        .toEqual('<span class="class">text</span> and <span class="class2">text</span>')
    });

    it('should convert multiple classes', function () {
      expect(convert('.a.b.c[text]'))
        .toEqual('<span class="a b c">text</span>');
    });

    it('should convert recursive classes', function () {
      expect(convert('.a[text.b[text]]'))
        .toEqual('<span class="a">text<span class="b">text</span></span>');
    });

    it('should convert class containing fancy markdown', function () {
      expect(convert('.right[![title](image.png)]'))
        .toEqual('<span class="right">![title](image.png)</span>')
    });
  });

  describe('convertMarkdown', function () {
    var convert = function (text) {
      var content = {innerHTML: text};
      remark.converter.convertMarkdown(content)
      return content.innerHTML;
    };

    it('should unescape HTML', function () {
      expect(convert('&lt;b class="test"&gt;a&lt;/b&gt;'))
        .toEqual('<p><b class=&quot;test&quot;>a</b></p>');
    });

    it('should unescape once HTML escaped twice in code tags', function () {
      expect(
        convert('<p><code>&amp;lt;p&amp;gt;a&amp;lt;/p&amp;gt;</code></p>'))
        .toEqual('<p><code>&lt;p&gt;a&lt;/p&gt;</code></p>');
    });
  });

  describe('convertCodeClasses', function () {
    var convert = function(code, parentTagName) {
      var i
        , content = document.createElement(parentTagName || 'div')
        , node = document.createElement('code')
        ;

      node.innerHTML = code;
      content.appendChild(node);

      remark.converter.convertCodeClasses(content);

      return node;
    };

    before(function resetConfiguration () {
      remark.config({
        highlightStyle: undefined
      , highlightLanguage: undefined
      , highlightInline: undefined
      });
    });

    it('should disable highlighting for inline code by default', function () {
      expect(convert('var a = 5;').className).toEqual('no-highlight');
    });

    it('should enable highlighting for code by default', function () {
      expect(convert('var a = 5;', 'pre').className).toEqual('');
    });

    it('should enable highlighting for inline code if configured to', function () {
      remark.config({highlightInline: true});

      expect(convert('var a = 5;').className).toEqual('');
    });

    it('should extract inline code class', function () {
      expect(convert('.ruby a = 5').innerHTML).toEqual('a = 5');
    });

    it('should apply inline code class', function () {
      expect(convert('.ruby a = 5').className).toEqual('ruby');
    });

    it('should extract code class', function () {
      expect(convert('.ruby\na = 5').innerHTML).toEqual('a = 5');
    });

    it('should apply code class', function () {
      expect(convert('.ruby\na = 5').className).toEqual('ruby');
    });

    it('should unescape escaped inline code class', function () {
      expect(convert('\\.ruby a = 5').innerHTML).toEqual('.ruby a = 5');
    });

    it('should unescape escaped code class', function () {
      expect(convert('\\.ruby\na = 5', 'pre').innerHTML).toEqual('.ruby\na = 5');
    });

    it('should use configured code class by default', function () {
      remark.config({highlightLanguage: 'not-a-language'});

      expect(convert('a = 5', 'pre').className).toEqual('not-a-language');
    });

    it('should ignore configured code class if class is given', function () {
      remark.config({highlightLanguage: 'not-a-language'});

      expect(convert('.ruby a = 5', 'pre').className).toEqual('ruby');
    });
  });

});
