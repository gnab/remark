var EventEmitter = require('events').EventEmitter
  , Slide = require('../../../src/remark/models/slide')
  , SlideView = require('../../../src/remark/views/slideView')
  , utils = require('../../../src/remark/utils')
  ;

describe('SlideView', function () {
  var slideshow = {
        getHighlightStyle: function () { return 'default'; }
      , getSlides: function () { return []; }
      }
    , scaler = {
        dimensions: {width: 10, height: 10}
      }
    ;

  describe('background', function () {
    it('should be set from background slide property', function () {
      var slide = new Slide(1, {
            source: '',
            properties: {'background-image': 'url(image.jpg)'}
          })
        , slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide)
        ;

        slideView.contentElement.style.backgroundImage.should.equal('url(image.jpg)');
    });
  });

  describe('classes', function () {
    it('should contain "content" class by default', function () {
      var slide = new Slide(1, {source: ''})
        , slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide)
        , classes = utils.getClasses(slideView.contentElement)
        ;

      classes.should.include('remark-slide-content');
    });

    it('should contain additional classes from slide properties', function () {
      var slide = new Slide(1, {
            source: '',
            properties: {'class': 'middle, center'}
          })
        , slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide)
        , classes = utils.getClasses(slideView.contentElement)
        ;

      classes.should.include('remark-slide-content');
      classes.should.include('middle');
      classes.should.include('center');
    });
  });

  describe('empty paragraph removal', function () {
    it('should have empty paragraphs removed', function () {
      var slide = new Slide(1, {source: '&lt;p&gt; &lt;/p&gt;'})
        , slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide);

      slideView.contentElement.innerHTML.should.not.include('<p></p>');
    });
  });

  describe('show slide', function () {
    it('should set the slide visible', function () {
      var slide = new Slide(1, {source: ''})
        , slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide)
        ;

        slideView.show();

        var classes = utils.getClasses(slideView.containerElement);
        classes.should.include('remark-visible');
        classes.should.not.include('remark-fading');
    });

    it('should remove any fading element', function () {
      var slide = new Slide(1, {source: ''})
        , slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide)
        ;
        utils.addClass(slideView.containerElement, 'remark-fading');

        slideView.show();

        var classes = utils.getClasses(slideView.containerElement);
        classes.should.include('remark-visible');
        classes.should.not.include('remark-fading');
    });
  });

  describe('hide slide', function () {
    it('should mark the slide as fading', function () {
      var slide = new Slide(1, {source: ''})
        , slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide)
        ;
        utils.addClass(slideView.containerElement, 'remark-visible');

        slideView.hide();

        var classes = utils.getClasses(slideView.containerElement);
        classes.should.not.include('remark-visible');
        classes.should.include('remark-fading');
    });
  });

});
