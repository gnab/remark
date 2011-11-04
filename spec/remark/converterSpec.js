describe('converter', function () {

  describe('slide classes', function () {
    var convert = function(text, className) {
      var content = {innerHTML: text, className: className || ''};
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

    it('should convert single class', function () {
      expect(convert('.class').className).toBe(' class');
    });

    it('should extract multiple classes', function () {
      expect(convert('.a.b.c').innerHTML).toBe('');
    });

    it('should convert multiple classes', function () {
      expect(convert('.a.b.c').className).toBe(' a b c');
    });
  });

  describe('content classes', function () {
    var convert = function(text) {
      var content = {innerHTML: text};
      remark.converter.convertContentClasses(content);
      return content.innerHTML;
    };

    it('should leave regular text as is', function () {
      expect(convert('some text')).toBe('some text');
    });

    it('should ignore class without belonging square brackets', function () {
      expect(convert('.class')).toBe('.class');
    });

    it('should unescape escaped test', function () {
      expect(convert('\\.class[text]')).toBe('.class[text]');
    });

    it('should convert single class', function () {
      expect(convert('.class[text]')).toBe(
        '<span class="class">text</span>')
    });

    it('should convert multiple classes', function () {
      expect(convert('.a.b.c[text]')).toBe(
        '<span class="a b c">text</span>');
    });

    it('should convert recursive classes', function () {
      expect(convert('.a[.b[text]]')).toBe(
        '<span class="a"><span class="b">text</span></span>');
    });

    it('should convert class containing fancy markdown', function () {
      expect(convert('.right[![title](image.png)]')).
        toBe('<span class="right">![title](image.png)</span>')
    });
  });

  describe('code classes', function () {
    var convert = function(code, parentTagName) {
      var i
        , content = document.createElement(parentTagName || 'div')
        , node = document.createElement('code')
        ;

      node.innerHTML = code;
      content.appendChild(node);

      remark.converter.convertCodeBlocks(content);

      return node;
    };

    it('should disable highlighting for inline code by default', function () {
      expect(convert('var a = 5;').className).toBe('no-highlight');
    });

    it('should not disable highlighting for code by default', function () {
      expect(convert('var a = 5;', 'pre').className).toBe('');
    });

    it('should extract inline code class', function () {
      expect(convert('.ruby a = 5;').innerHTML).toBe('a = 5;');
    });

    it('should convert inline code class', function () {
      expect(convert('.ruby a = 5;').className).toBe('ruby');
    });
  });

});
