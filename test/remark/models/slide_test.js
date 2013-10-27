var Slide = require('../../../src/remark/models/slide');

describe('Slide', function () {
  describe('inheritance', function () {
    it('should inherit properties, source and notes', function () {
      var template = new Slide(1, {
            source: 'Some content.',
            properties: {prop1: 'val1'},
            notes: 'template notes'
          })
        , slide = new Slide(2, {
            source: 'More content.',
            properties: {prop2: 'val2'},
            notes: 'slide notes'
          }, template);

      slide.properties.should.have.property('prop1', 'val1');
      slide.properties.should.have.property('prop2', 'val2');
      slide.source.should.equal('Some content.More content.');
      slide.notes.should.equal('template notes\n\nslide notes');
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

  describe('steps', function () {
    describe('#init', function () {
      it('should trigger setup on first call', function (done) {
        slide.setup(function () {
          done();
        });
        slide.init();
      });

      it('should not trigger setup after first call', function () {
        slide.init();
        slide.setup(function () {
          throw new Error('setup was called on second init');
        });
        slide.init();
      });
    });

    describe('#rewind', function () {
      it('should trigger reset', function (done) {
        slide.reset(function () {
          done();
        });
        slide.rewind();
      });
    });

    describe('#forward', function () {
      it('should trigger next step', function (done) {
        slide.step(function () {
          done();
        });
        slide.forward();
      });

      it('should skip step without forward action', function (done) {
        slide.step(null, function () {});
        slide.step(function () {
          done();
        });
        slide.forward();
      });

      it('should loop until truthy or undefined result', function () {
        slide.step(function (calls) {
          return calls === 2;
        });

        slide.forward().should.equal(true);
        slide.forward().should.equal(true);
        slide.forward().should.equal(true);
        slide.forward().should.equal(false);
      });

      it('should return true when step was triggered', function () {
        slide.step(function () {});
        slide.forward().should.equal(true);
      });

      it('should return false when no more steps', function () {
        slide.forward().should.equal(false);
      });
    });

    describe('#backward', function () {
      it('should trigger previous step', function (done) {
        slide.step(function () {}, function () {
          done();
        });
        slide.forward();
        slide.backward();
      });

      it('should skip step without backward action', function (done) {
        slide.step(null, function () {
          done();
        });
        slide.step(function () {});
        slide.forward();
        slide.forward();
        slide.backward();
      });

      it('should loop until truthy or undefined result', function () {
        slide.step(null, function (calls) {
          return calls === -2;
        });

        slide.forward();
        slide.backward().should.equal(true);
        slide.backward().should.equal(true);
        slide.backward().should.equal(true);
        slide.backward().should.equal(false);
      });

      it('should return true when step was triggered', function () {
        slide.step(function () {}, function () {});
        slide.forward();
        slide.backward().should.equal(true);
      });

      it('should return false when no more steps', function () {
        slide.backward().should.equal(false);
      });
    });

    var slide;

    beforeEach(function () {
      slide = new Slide(1, {});
    });
  });
});
