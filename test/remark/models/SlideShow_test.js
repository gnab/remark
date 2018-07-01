import EventEmitter from 'events';
import SlideShow from '../../../src/remark/models/SlideShow';
//import Slide from '../../../src/remark/models/Slide';

describe('SlideShow', () => {
  let events;
  let slideShow;
  let dom;

  beforeEach(() => {
    events = new EventEmitter();
    dom = {};
    dom.constructor.XMLHttpRequest = function() {
      this.open = () => {};
      this.send = () => {};
      this.success = function(responseText) {
        this.readyState = 4;
        this.status = 200;
        this.responseText = responseText;
        this.onload();
      };
    };
    slideShow = new SlideShow(events, dom);
  });

  describe('loading from source', () => {
    it('should create slides', () => {
      slideShow.loadFromString('a\n---\nb');
      slideShow.getSlides().length.should.equal(2);
    });

    it('should create slide numbers', () => {
      slideShow.loadFromString('a\n---\nb\n---\nc');
      slideShow.getSlides().length.should.equal(3);
      slideShow.getSlides().forEach((slide, index) => {
        slide.getSlideNumber().should.equal(index + 1);
      })
    });

    it('should replace slides', () => {
      slideShow.loadFromString('a\n---\nb\n---\nc');
      slideShow.getSlides().length.should.equal(3);
    });

    it('should mark continued slide as non-markable and not count them', () => {
      slideShow = new SlideShow(events, null, {countIncrementalSlides: false});
      slideShow.loadFromString('a\n--\nb');
      slideShow.getSlides()[1].properties.count.should.equal('false');
      slideShow.getSlides()[1].getSlideNumber().should.equal(1);
    });
  });

  describe('loading from url', () => {
    it('should download source with \\n line separators from url', () => {
      let xhr = slideShow.loadFromUrl('url');
      xhr.success('a\n---\nb');
      let slides = slideShow.getSlides();
      slides.length.should.eql(2);
      slides[0].content.should.eql(['a']);
      slides[1].content.should.eql(['b']);
    });

    it('should download source with \\r\\n line separators from url', () => {
      let xhr = slideShow.loadFromUrl('url');
      xhr.success('a\r\n---\r\nb');
      let slides = slideShow.getSlides();
      slides.length.should.eql(2);
      slides[0].content.should.eql(['a']);
      slides[1].content.should.eql(['b']);
    });
  });

  describe('continued slides', () => {
    it('should be created when using only two dashes', () => {
      slideShow.loadFromString('a\n--\nb');

      slideShow.getSlides()[1].properties.should.have.property('continued', 'true');
    });

    it('should normally be counted', () => {
      slideShow.loadFromString('a\n--\nb');
      slideShow.getSlides().forEach((slide, index) => {
        slide.getSlideNumber().should.equal(index + 1);
      })
    });

    it('should not be counted if this is requested', () => {
      slideShow = new SlideShow(events, null, {countIncrementalSlides: false});
      slideShow.loadFromString('a\n--\nb');
      slideShow.getSlides().forEach((slide) => {
        slide.getSlideNumber().should.equal(1);
      })
    });
  });

  describe('non-countable slides', () => {
    it('should not be counted', () => {
      slideShow.loadFromString('a\n---\ncount: false\n\nb');
      slideShow.getSlides().forEach((slide) => {
        slide.getSlideNumber().should.equal(1);
      })
    });
  });

  describe('name mapping', () => {
    it('should map named slide', () => {
      slideShow.loadFromString('name: a\n---\nno name\n---\nname: b');
      slideShow.getSlideByName('a').should.exist;
      slideShow.getSlideByName('b').should.exist;
    });
  });

  describe('number mapping', () => {
    it('should be populated', () => {
      slideShow.loadFromString('a\n---\nb');
      slideShow.getSlidesByNumber(1).should.exist;
      slideShow.getSlidesByNumber(2).should.exist;
    });

    it('should contain all slides with the same number in one entry', () => {
      slideShow.loadFromString('a\n---\ncount: false\n\nb\n---\nc');
      slideShow.getSlidesByNumber(1).should.exist;
      slideShow.getSlidesByNumber(1).length.should.equal(2);
      slideShow.getSlidesByNumber(1)[0].getSlideNumber().should.equal(1);
      slideShow.getSlidesByNumber(1)[0].getSlideIndex().should.equal(0);
      slideShow.getSlidesByNumber(1)[1].getSlideNumber().should.equal(1);
      slideShow.getSlidesByNumber(1)[1].getSlideIndex().should.equal(1);
      slideShow.getSlidesByNumber(2).should.exist;
    });
  });

  describe('templates', () => {
    it('should have properties inherited by referenced slide', () => {
      slideShow.loadFromString('name: a\nprop:val\na\n---\ntemplate: a\nb');
      slideShow.getSlides()[1].properties.should.have.property('prop', 'val');
    });

    it('should have content inherited by referenced slide', () => {
      slideShow.loadFromString('name: a\na\n---\ntemplate: a\nb');
      slideShow.getSlides()[1].content.should.eql(['\na', '\nb']);
    });
  });

  describe('layout slides', () => {
    it('should be default template for subsequent slides', () => {
      slideShow.loadFromString('layout: true\na\n---\nb');
      slideShow.getSlides()[0].content.should.eql(['\na', 'b']);
    });

    it('should not be default template for subsequent layout slide', () => {
      slideShow.loadFromString('layout: true\na\n---\nlayout: true\nb\n---\nc');
      slideShow.getSlides()[0].content.should.eql(['\nb', 'c']);
    });

    it('should be omitted from list of slides', () => {
      slideShow.loadFromString('name: a\nlayout: true\n---\nname: b');
      slideShow.getSlides().length.should.equal(1);
    });

    it('should not be counted', () => {
      slideShow.loadFromString('name: a\nlayout: true\n---\nname: b\n---\nc');
      slideShow.getSlides().length.should.equal(2);
      slideShow.getSlides().forEach((slide, index) => {
        slide.getSlideNumber().should.equal(index + 1);
      })
    });
  });

  describe('events', () => {
    it('should emit slidesChanged event', (done) => {
      events.on('slidesChanged', () => {
        done();
      });

      slideShow.loadFromString('a\n---\nb');
    });
  });
});
