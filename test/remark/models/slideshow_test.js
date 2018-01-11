var EventEmitter = require('events').EventEmitter
  , Slideshow = require('../../../src/remark/models/slideshow')
  , Slide = require('../../../src/remark/models/slide')
  ;

describe('Slideshow', function () {
  var events
    , slideshow
    , dom
    ;

  beforeEach(function () {
    events = new EventEmitter();
    dom = {
      XMLHttpRequest: function () {
        this.open = function () {};
        this.send = function () {};
        this.success = function (responseText) {
          this.readyState = 4;
          this.status = 200;
          this.responseText = responseText;
          this.onload();
        };
      }
    }
    slideshow = new Slideshow(events, dom);
  });

  describe('loading from source', function () {
    it('should create slides', function () {
      slideshow.loadFromString('a\n---\nb');
      slideshow.getSlides().length.should.equal(2);
    });

    it('should create slide numbers', function () {
      slideshow.loadFromString('a\n---\nb\n---\nc');
      slideshow.getSlides().length.should.equal(3);
      slideshow.getSlides().forEach(function(slide, index) {
        slide.getSlideNumber().should.equal(index + 1);
      })
    });

    it('should replace slides', function () {
      slideshow.loadFromString('a\n---\nb\n---\nc');
      slideshow.getSlides().length.should.equal(3);
    });

    it('should mark continued slide as non-markable and not count them', function () {
      slideshow = new Slideshow(events, null, {countIncrementalSlides: false});
      slideshow.loadFromString('a\n--\nb');
      slideshow.getSlides()[1].properties.count.should.equal('false');
      slideshow.getSlides()[1].getSlideNumber().should.equal(1);
    });
  });

  describe('loading from url', function () {
    it('should download source with \\n line separators from url', function () {
      var xhr = slideshow.loadFromUrl('url');
      xhr.success('a\n---\nb');
      var slides = slideshow.getSlides();
      slides.length.should.eql(2);
      slides[0].content.should.eql(['a']);
      slides[1].content.should.eql(['b']);
    });

    it('should download source with \\r\\n line separators from url', function () {
      var xhr = slideshow.loadFromUrl('url');
      xhr.success('a\r\n---\r\nb');
      var slides = slideshow.getSlides();
      slides.length.should.eql(2);
      slides[0].content.should.eql(['a']);
      slides[1].content.should.eql(['b']);
    });
  });

  describe('continued slides', function () {
    it('should be created when using only two dashes', function () {
      slideshow.loadFromString('a\n--\nb');

      slideshow.getSlides()[1].properties.should.have.property('continued', 'true');
    });

    it('should normally be counted', function () {
      slideshow.loadFromString('a\n--\nb');
      slideshow.getSlides().forEach(function(slide, index) {
        slide.getSlideNumber().should.equal(index + 1);
      })
    });

    it('should not be counted if this is requested', function () {
      slideshow = new Slideshow(events, null, {countIncrementalSlides: false});
      slideshow.loadFromString('a\n--\nb');
      slideshow.getSlides().forEach(function(slide) {
        slide.getSlideNumber().should.equal(1);
      })
    });
  });

  describe('non-countable slides', function() {
    it('should not be counted', function() {
      slideshow.loadFromString('a\n---\ncount: false\n\nb');
      slideshow.getSlides().forEach(function(slide, index) {
        slide.getSlideNumber().should.equal(1);
      })
    });
  });

  describe('name mapping', function () {
    it('should map named slide', function () {
      slideshow.loadFromString('name: a\n---\nno name\n---\nname: b');
      slideshow.getSlideByName('a').should.exist;
      slideshow.getSlideByName('b').should.exist;
    });
  });

  describe('number mapping', function() {
    it('should be populated', function() {
      slideshow.loadFromString('a\n---\nb');
      slideshow.getSlidesByNumber(1).should.exist;
      slideshow.getSlidesByNumber(2).should.exist;
    });

    it('should contain all slides with the same number in one entry', function() {
      slideshow.loadFromString('a\n---\ncount: false\n\nb\n---\nc');
      slideshow.getSlidesByNumber(1).should.exist;
      slideshow.getSlidesByNumber(1).length.should.equal(2);
      slideshow.getSlidesByNumber(1)[0].getSlideNumber().should.equal(1);
      slideshow.getSlidesByNumber(1)[0].getSlideIndex().should.equal(0);
      slideshow.getSlidesByNumber(1)[1].getSlideNumber().should.equal(1);
      slideshow.getSlidesByNumber(1)[1].getSlideIndex().should.equal(1);
      slideshow.getSlidesByNumber(2).should.exist;
    });
  });

  describe('templates', function () {
    it('should have properties inherited by referenced slide', function () {
      slideshow.loadFromString('name: a\nprop:val\na\n---\ntemplate: a\nb');
      slideshow.getSlides()[1].properties.should.have.property('prop', 'val');
    });

    it('should have content inherited by referenced slide', function () {
      slideshow.loadFromString('name: a\na\n---\ntemplate: a\nb');
      slideshow.getSlides()[1].content.should.eql(['\na', '\nb']);
    });
  });

  describe('layout slides', function () {
    it('should be default template for subsequent slides', function () {
      slideshow.loadFromString('layout: true\na\n---\nb');
      slideshow.getSlides()[0].content.should.eql(['\na', 'b']);
    });

    it('should not be default template for subsequent layout slide', function () {
      slideshow.loadFromString('layout: true\na\n---\nlayout: true\nb\n---\nc');
      slideshow.getSlides()[0].content.should.eql(['\nb', 'c']);
    });

    it('should be omitted from list of slides', function () {
      slideshow.loadFromString('name: a\nlayout: true\n---\nname: b');
      slideshow.getSlides().length.should.equal(1);
    });

    it('should not be counted', function () {
      slideshow.loadFromString('name: a\nlayout: true\n---\nname: b\n---\nc');
      slideshow.getSlides().length.should.equal(2);
      slideshow.getSlides().forEach(function(slide, index) {
        slide.getSlideNumber().should.equal(index + 1);
      })
    });
  });

  describe('events', function () {
    it('should emit slidesChanged event', function (done) {
      events.on('slidesChanged', function () {
        done();
      });

      slideshow.loadFromString('a\n---\nb');
    });
  });
});
