var Slide = require('../../../src/remark/models/slide').Slide;

describe('Slide', function () {
  describe('properties', function () {
    it('should be extracted', function () {
      var slide = new Slide('a:b\nc:d');
      slide.properties.should.have.property('a', 'b');
      slide.properties.should.have.property('c', 'd');
      slide.source.should.equal('');
    });
  });

  describe('continuing slide', function () {
    it('should inherit properties from previous slide', function () {
      var previousSlide = new Slide('key1:val1\nkey2:val2\n\nSome content.')
        , slide = new Slide('key2:overridden\ncontinue:true\n\nMore content.',
            previousSlide);

      slide.properties.should.have.property('key1', 'val1');
      slide.properties.should.have.property('key2', 'overridden');
    });

    it('should inherit properties from named slide', function () {
      var namedSlide = new Slide('key1:val1\nkey2:val2\n\nSome content.')
        , slide = new Slide('key2:overridden\ncontinue:namedSlide\n\nMore content.',
            undefined, {namedSlide: namedSlide});

      slide.properties.should.have.property('key1', 'val1');
      slide.properties.should.have.property('key2', 'overridden');
    });

    it('should inherit source with single newline', function () {
      var previousSlide = new Slide('Some content.')
        , slide = new Slide('continue:true\nMore content.',
            previousSlide);

      slide.source.should.equal('Some content.\nMore content.');
    });

    it('should inherit source with extra newline', function () {
      var previousSlide = new Slide('Some content.\n')
        , slide = new Slide('continue:true\nMore content.',
            previousSlide);

      slide.source.should.equal('Some content.\n\nMore content.');
    });

    it('should not inherit name property', function () {
      var previousSlide = new Slide('name: name\n\nSome content.')
        , slide = new Slide('continue:true\n\nMore content.', previousSlide);

      slide.properties.should.not.have.property('name');
    });
  });
});
