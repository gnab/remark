var Slide = require('../../../src/remark/slide').Slide
  , SlideView = require('../../../src/remark/views/slideView').SlideView
  ;

describe('SlideView', function () {
  describe('classes', function () {
    it('should contain "content" class by default', function () {
      var slide = new Slide('')
        , slideView = new SlideView(slide)
        ;

      slideView.contentElement.className.should.equal('content');
    });

    it('should contain additional classes from slide properties', function () {
      var slide = new Slide('class: middle, center')
        , slideView = new SlideView(slide)
        ;

      slideView.contentElement.className.should.equal('content middle center');
    });
  });
});
