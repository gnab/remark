var EventEmitter = require('events').EventEmitter
  , Slide = require('../../../src/remark/models/slide')
  , SlideView = require('../../../src/remark/views/slideView')
  , Properties = require('../../../src/remark/models/slideshow/properties')
  , utils = require('../../../src/remark/utils')
  ;

describe('SlideView', function () {
  describe('background', function () {
    it('should be set from background slide property', function () {
      var slide = new Slide(1, 'background-image: image.jpg')
        , slideView = new SlideView(new EventEmitter(), new Properties(), slide)
        ;

        slideView.contentElement.style.backgroundImage.should.equal('image.jpg');
    });
  });

  describe('classes', function () {
    it('should contain "content" class by default', function () {
      var slide = new Slide(1, '')
        , slideView = new SlideView(new EventEmitter(), new Properties(), slide)
        , classes = utils.getClasses(slideView.contentElement)
        ;

      classes.should.include('remark-slide-content');
    });

    it('should contain additional classes from slide properties', function () {
      var slide = new Slide(1, 'class: middle, center')
        , slideView = new SlideView(new EventEmitter(), new Properties(), slide)
        , classes = utils.getClasses(slideView.contentElement)
        ;

      classes.should.include('remark-slide-content');
      classes.should.include('middle');
      classes.should.include('center');
    });
  });
});
