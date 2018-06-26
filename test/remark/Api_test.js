import Api from '../../src/remark/Api';
import Slideshow from '../../src/remark/models/SlideShow';
import TestDom from '../TestDom';

describe('API', function () {
  let api;
  let dom;

  beforeEach(() => {
    dom = new TestDom();
    api = new Api(dom);
  });

  it('should be exposed', function () {
    window.should.have.property('remark');
  });

  it('should allow creating slideshow', function () {
    api.create().should.be.an.instanceOf(Slideshow);
  });

  it('should allow creating slideshow with source directly', function () {
    let slides = api.create({ source: '1\n---\n2' }).getSlides();
    slides.length.should.eql(2);
    slides[0].content.should.eql([ '1' ]);
    slides[1].content.should.eql([ '2' ]);
  });

  it('should allow creating slideshow from source textarea', function () {
    let source = document.createElement('textarea');
    source.id = 'source';
    source.textContent = '3\n---\n4';
    dom.getElementById = function () { return source; };

    let slides = api.create().getSlides();
    slides.length.should.eql(2);
    slides[0].content.should.eql(['3']);
    slides[1].content.should.eql(['4']);
  });
});