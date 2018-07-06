import Slide from '../../../src/remark/models/Slide';

describe('Slide', () => {
  describe('properties', () => {
    it('should be extracted', () => {
      let slide = new Slide(1, 1, {
        content: [''],
        properties: {a: 'b', c: 'd'}
      });
      slide.properties.should.have.property('a', 'b');
      slide.properties.should.have.property('c', 'd');
      slide.content.should.eql(['']);
    });
  });

  describe('inheritance', () => {
    it('should inherit properties, content and notes', () => {
      let template = new Slide(1, 1, {
        content: ['Some content.'],
        properties: {prop1: 'val1'},
        notes: 'template notes'
      });
      let slide = new Slide(2, 2, {
        content: ['More content.'],
        properties: {prop2: 'val2'},
        notes: 'slide notes'
      }, template);

      slide.properties.should.have.property('prop1', 'val1');
      slide.properties.should.have.property('prop2', 'val2');
      slide.content.should.eql(['Some content.', 'More content.']);
      slide.notes.should.equal('template notes\n\nslide notes');
    });

    it('should not inherit name property', () => {
      let template = new Slide(1, 1, {
        content: ['Some content.'],
        properties: {name: 'name'}
      });
      let slide = new Slide(1, 1, {content: ['More content.']}, template);

      slide.properties.should.not.have.property('name');
    });

    it('should not inherit layout property', () => {
      let template = new Slide(1, 1, {
        content: ['Some content.'],
        properties: {layout: true}
      });
      let slide = new Slide(1, 1, {content: ['More content.']}, template);

      slide.properties.should.not.have.property('layout');
    });

    it('should aggregate class property value', () => {
      let template = new Slide(1, 1, {
            content: ['Some content.'],
            properties: {'class': 'a'}
          })
        , slide = new Slide(1, 1, {
            content: ['More content.'],
            properties: {'class': 'b'}
          }, template);

      slide.properties.should.have.property('class', 'a, b');
    });

    it('should not expand regular properties when inheriting template', () => {
      let template = new Slide(1, 1, {
        content: ['{{name}}'],
        properties: {name: 'a'}
      });
      let slide = new Slide(1, 1, {
        content: [''],
        properites: {name: 'b'}
      }, template);

      slide.content.should.eql(['{{name}}', '']);
    });
  });

  describe('letiables', () => {
    it('should be expanded to matching properties', () => {
      let slide = new Slide(1, 1, {
        content: ['prop1 = {{ prop1 }}'],
        properties: {prop1: 'val1'}
      });

      slide.expandVariables();

      slide.content.should.eql(['prop1 = val1']);
    });

    it('should ignore escaped letiables', () => {
      let slide = new Slide(1, 1, {
        content: ['prop1 = \\{{ prop1 }}'],
        properties: {prop1: 'val1'}
      });

      slide.expandVariables();

      slide.content.should.eql(['prop1 = {{ prop1 }}']);
    });

    it('should ignore undefined letiables', () => {
      let slide = new Slide(1, 1, {content: ['prop1 = {{ prop1 }}']});

      slide.expandVariables();

      slide.content.should.eql(['prop1 = {{ prop1 }}']);
    });
  });
});
