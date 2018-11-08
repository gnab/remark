import Api from '../../src/remark/Api';
import SlideShow from '../../src/remark/models/SlideShow';
import Dom from "../../src/remark/Dom";
import sinon from 'sinon';

describe('API', function () {
  let api;
  let getElementById = sinon.stub(Dom, 'getElementById');
  let containerElement;

  beforeEach(() => {
    containerElement = document.createElement('div');
    api = new Api();
  });

  it('should allow creating slide show', function () {
    api.create({
      container: containerElement
    }).should.be.an.instanceOf(SlideShow);
  });

  it('should allow creating slide show with source directly', function () {
    let slides = api.create({
      container: containerElement,
      source: '1\n---\n2'
    }).getSlides();
    slides.length.should.eql(2);
    slides[0].content.should.eql([ '1' ]);
    slides[1].content.should.eql([ '2' ]);
  });

  it('should allow creating slide show from source textarea', function () {
    let source = document.createElement('textarea');
    source.id = 'source';
    source.textContent = '3\n---\n4';
    getElementById.returns(source);

    let slides = api.create({
      container: containerElement
    }).getSlides();
    slides.length.should.eql(2);
    slides[0].content.should.eql(['3']);
    slides[1].content.should.eql(['4']);
  });
});