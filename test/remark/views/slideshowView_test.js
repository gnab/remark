var SlideshowView = require('../../../src/remark/views/slideshowView').SlideshowView
  , config = require('../../../src/remark/config')
  ;

describe('SlideshowView', function () {
  it('should calculate element size for 4:3', function () {
    var slideshow = { slides: [] }
      , element = document.createElement('div')
      , slideshowView
      ;

    config({ratio: '4:3'});

    slideshowView = new SlideshowView(slideshow, element);

    element.style.width.should.equal('908px');
    element.style.height.should.equal('681px');
  });

  it('should calculate element size for 4:3', function () {
    var slideshow = { slides: [] }
      , element = document.createElement('div')
      , slideshowView
      ;

    config({ratio: '16:9'});

    slideshowView = new SlideshowView(slideshow, element);

    element.style.width.should.equal('1210px');
    element.style.height.should.equal('681px');
  });
});
