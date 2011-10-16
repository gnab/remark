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

  describe('inline classes', function () {
    var convert = function(text) {
      var content = {innerHTML: text};
      remark.converter.convertInlineClasses(content);
      return content.innerHTML;
    };

    it('should leave regular text as is', function () {
      expect(convert('some text')).toBe('some text');
    });

    it('should ignore class without belonging square brackets', function () {
      expect(convert('.class')).toBe('.class');
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
  });

});
