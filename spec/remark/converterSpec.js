describe('converter', function () {

  describe('convertSlideClasses', function () {
    var convert = function(text) {
      var content = {innerHTML: text};
      remark.converter.convertSlideClasses(content);
      return content;
    };

    it('should leave regular text as it', function () {
      expect(convert('some text').innerHTML).toBe('some text');
    });

    it('should ignore class not on beginning of line', function () {
      expect(convert(' .class').innerHTML).toBe(' .class');
    });

    it('should unescape escaped test', function () {
      expect(convert('\\.class').innerHTML).toBe('.class');
    });

    it('should ignore content class with square brackets', function () {
      expect(convert('.class[text]').innerHTML).toBe('.class[text]');
    });

    it('should extract single class', function () {
      expect(convert('.class').innerHTML).toBe('');
    });

    it('should apply single class', function () {
      expect(convert('.class').className).toBe(' class');
    });

    it('should extract multiple classes', function () {
      expect(convert('.a.b.c').innerHTML).toBe('');
    });

    it('should apply multiple classes', function () {
      expect(convert('.a.b.c').className).toBe(' a b c');
    });
  });

  describe('convertContentClasses', function () {
    var convert = function(text) {
      var content = {innerHTML: text};
      remark.converter.convertContentClasses(content);
      return content.innerHTML;
    };

    it('should leave regular text as is', function () {
      expect(convert('some text')).toBe('some text');
    });

    it('should ignore class without square brackets', function () {
      expect(convert('.class')).toBe('.class');
    });

    it('should ignore escaped class without square brackets', function () {
      expect(convert('\\.class')).toBe('\\.class');
    });

    it('should unescape escaped class', function () {
      expect(convert('\\.class[text]')).toBe('.class[text]');
    });

    it('should convert single class', function () {
      expect(convert('.class[text]'))
        .toBe('<span class="class">text</span>')
    });

    it('should convert several classes', function () {
      expect(convert('.class[text] and .class2[text]'))
        .toBe('<span class="class">text</span> and <span class="class2">text</span>')
    });

    it('should convert multiple classes', function () {
      expect(convert('.a.b.c[text]'))
        .toBe('<span class="a b c">text</span>');
    });

    it('should convert recursive classes', function () {
      expect(convert('.a[text.b[text]]'))
        .toBe('<span class="a">text<span class="b">text</span></span>');
    });

    it('should convert class containing fancy markdown', function () {
      expect(convert('.right[![title](image.png)]'))
        .toBe('<span class="right">![title](image.png)</span>')
    });
  });

  describe('convertMarkdown', function () {
    var convert = function (text) {
      var source = document.createElement('textarea')
        , content = document.createElement('div')
        ;

      source.innerHTML = text;
      content.innerHTML = source.innerHTML;
      remark.converter.convertMarkdown(content)
      return content.innerHTML;
    };

    it('should convert simple markdown to HTML', function () {
      expect(convert('#title')).toBe('<h1>title</h1>');
    });

    it('should convert inline code', function () {
      expect(convert('`a = 5`')).toBe('<p><code>a = 5</code></p>');
    });

    it('should convert code block', function () {
      expect(convert('Code:\n\n    a = 5'))
        .toBe('<p>Code:</p>\n\n<pre><code>a = 5\n</code></pre>');
    });

    it('should escape HTML in inline code', function () {
      expect(convert('`<p>a</p>`'))
        .toBe('<p><code>&lt;p&gt;a&lt;/p&gt;</code></p>');
    });

    it('should escape HTML in code block', function () {
      expect(convert('Code:\n\n    <p>a</p>'))
        .toBe('<p>Code:</p>\n\n<pre><code>&lt;p&gt;a&lt;/p&gt;\n</code></pre>');
    });

    it('should not escape HTML outside inline code / code block', function () {
      expect(convert('<b class="test">a</b>'))
        .toBe('<p><b class="test">a</b></p>');
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

    it('should disable highlighting for inline code by default', function () {
      expect(convert('var a = 5;').className).toBe('no-highlight');
    });

    it('should not disable highlighting for code by default', function () {
      expect(convert('var a = 5;', 'pre').className).toBe('');
    });

    it('should extract inline code class', function () {
      expect(convert('.ruby a = 5').innerHTML).toBe('a = 5');
    });

    it('should apply inline code class', function () {
      expect(convert('.ruby a = 5').className).toBe('ruby');
    });

    it('should extract code class', function () {
      expect(convert('.ruby\na = 5').innerHTML).toBe('a = 5');
    });

    it('should apply code class', function () {
      expect(convert('.ruby\na = 5').className).toBe('ruby');
    });

    it('should unescape escaped inline code class', function () {
      expect(convert('\\.ruby a = 5').innerHTML).toBe('.ruby a = 5');
    });

    it('should unescape escaped code class', function () {
      expect(convert('\\.ruby\na = 5', 'pre').innerHTML).toBe('.ruby\na = 5');
    });
  });

});
