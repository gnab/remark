var Slide = require('../../../src/remark/models/slide');

describe('Slide', function () {
  describe('properties', function () {
    it('should be extracted', function () {
      var slide = new Slide(1, {
            source: '',
            properties: {a: 'b', c: 'd'}
          });
      slide.properties.should.have.property('a', 'b');
      slide.properties.should.have.property('c', 'd');
      slide.source.should.equal('');
    });
  });

  describe('inheritance', function () {
    it('should inherit properties and source', function () {
      var template = new Slide(1, {
            source: 'Some content.',
            properties: {prop1: 'val1'}
          })
        , slide = new Slide(1, {
            source: 'More content.',
            properties: {prop2: 'val2'}
          }, template);

      slide.properties.should.have.property('prop1', 'val1');
      slide.properties.should.have.property('prop2', 'val2');
      slide.source.should.equal('Some content.More content.');
    });

    it('should not inherit name property', function () {
      var template = new Slide(1, {
            source: 'Some content.',
            properties: {name: 'name'}
          })
        , slide = new Slide(1, {source: 'More content.'}, template);

      slide.properties.should.not.have.property('name');
    });

    it('should not inherit layout property', function () {
      var template = new Slide(1, {
            source: 'Some content.',
            properties: {layout: true}
          })
        , slide = new Slide(1, {source: 'More content.'}, template);

      slide.properties.should.not.have.property('layout');
    });

    it('should aggregate class property value', function () {
      var template = new Slide(1, {
            source: 'Some content.',
            properties: {'class': 'a'}
          })
        , slide = new Slide(1, {
            source: 'More content.',
            properties: {'class': 'b'}
          }, template);

      slide.properties.should.have.property('class', 'a, b');
    });

    it('should not expand regular properties when inheriting template', function () {
      var template = new Slide(1, {
            source: '{{name}}',
            properties: {name: 'a'}
          })
        , slide = new Slide(1, {
            source: '',
            properites: {name: 'b'}
          }, template);

      slide.source.should.equal('{{name}}');
    });
  });

  describe('variables', function () {
    it('should be expanded to matching properties', function () {
      var slide = new Slide(1, {
        source: 'prop1 = {{ prop1 }}',
        properties: {prop1: 'val1'}
      });

      slide.expandVariables();

      slide.source.should.equal('prop1 = val1');
    });

    it('should ignore escaped variables', function () {
      var slide = new Slide(1, {
        source: 'prop1 = \\{{ prop1 }}',
        properties: {prop1: 'val1'}
      });

      slide.expandVariables();

      slide.source.should.equal('prop1 = {{ prop1 }}');
    });

    it('should ignore undefined variables', function () {
      var slide = new Slide(1, {source: 'prop1 = {{ prop1 }}'});

      slide.expandVariables();

      slide.source.should.equal('prop1 = {{ prop1 }}');
    });
  });
});
