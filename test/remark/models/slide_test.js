var Slide = require('../../../src/remark/models/slide').Slide;

describe('Slide', function () {
  describe('properties', function () {
    it('should be extracted', function () {
      var slide = Slide.create('a:b\nc:d');
      slide.properties.should.have.property('a', 'b');
      slide.properties.should.have.property('c', 'd');
      slide.source.should.equal('');
    });

    it('should allow properties with no value', function () {
      var slide = Slide.create('a:   \n\nContent.');
      slide.properties.should.have.property('a', '');
    });
  });

  describe('inheritance', function () {
    it('should inherit properties and source', function () {
      var template = Slide.create('prop1: val1\n\nSome content.')
        , slide = Slide.create('prop2:val2\n\nMore content.');

      slide.inherit(template);

      slide.properties.should.have.property('prop1', 'val1');
      slide.properties.should.have.property('prop2', 'val2');
      slide.source.should.equal('\n\nSome content.\n\nMore content.');
    });

    it('should not inherit name property', function () {
      var template = Slide.create('name: name\n\nSome content.')
        , slide = Slide.create('More content.');

      slide.inherit(template);

      slide.properties.should.not.have.property('name');
    });

    it('should not inherit layout property', function () {
      var template = Slide.create('layout: true\n\nSome content.')
        , slide = Slide.create('More content.');

      slide.inherit(template);

      slide.properties.should.not.have.property('layout');
    });
  });
});
