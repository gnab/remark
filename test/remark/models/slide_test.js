var Slide = require('../../../src/remark/models/slide');

describe('Slide', function () {
  describe('properties', function () {
    it('should be extracted', function () {
      var slide = new Slide(1, 'a:b\nc:d');
      slide.properties.should.have.property('a', 'b');
      slide.properties.should.have.property('c', 'd');
      slide.source.should.equal('');
    });

    it('should allow properties with no value', function () {
      var slide = new Slide(1, 'a:   \n\nContent.');
      slide.properties.should.have.property('a', '');
    });
  });

  describe('inheritance', function () {
    it('should inherit properties and source', function () {
      var template = new Slide(1, 'prop1: val1\n\nSome content.')
        , slide = new Slide(1, 'prop2:val2\n\nMore content.', {}, template);

      slide.properties.should.have.property('prop1', 'val1');
      slide.properties.should.have.property('prop2', 'val2');
      slide.source.should.equal('\n\nSome content.\n\nMore content.');
    });

    it('should not inherit name property', function () {
      var template = new Slide(1, 'name: name\n\nSome content.')
        , slide = new Slide(1, 'More content.', {}, template);

      slide.properties.should.not.have.property('name');
    });

    it('should not inherit layout property', function () {
      var template = new Slide(1, 'layout: true\n\nSome content.')
        , slide = new Slide(1, 'More content.', {}, template);

      slide.properties.should.not.have.property('layout');
    });

    it('should aggregate class property value', function () {
      var template = new Slide(1, 'class: a\n\nSome content.')
        , slide = new Slide(1, 'class: b\n\nMore content.', {}, template);

      slide.properties.should.have.property('class', 'a, b');
    });

    it('should not expand regular properties when inheriting template', function () {
      var template = new Slide(1, 'name: a\n\n{{name}}')
        , slide = new Slide(1, 'name: b', {}, template);

      slide.source.should.equal('\n\n{{name}}');
    });
  });

  describe('variables', function () {
    it('should be expanded to matching properties', function () {
      var slide = new Slide(1, 'prop1: val1\nprop1 = {{ prop1 }}');

      slide.expandVariables();

      slide.source.should.equal('\nprop1 = val1');
    });

    it('should ignore escaped variables', function () {
      var slide = new Slide(1, 'prop1: val1\nprop1 = \\{{ prop1 }}');

      slide.expandVariables();

      slide.source.should.equal('\nprop1 = {{ prop1 }}');
    });

    it('should ignore undefined variables', function () {
      var slide = new Slide(1, 'prop1 = {{ prop1 }}');

      slide.expandVariables();

      slide.source.should.equal('prop1 = {{ prop1 }}');
    });
  });
});
