var EventEmitter = require('events').EventEmitter
  , Slide = require('../../../src/remark/models/slide')
  , SlideView = require('../../../src/remark/views/slideView')
  , utils = require('../../../src/remark/utils')
  ;

describe('SlideView', function () {
  var slideshow = {
        slides: []
      , getHighlightStyle: function () { return 'default'; }
      , getSlides: function () { return this.slides; }
      , getHighlightLines: function () { return true; }
      , getHighlightSpans: function () { return true; }
      , getLinks: function () { return {}; }
      , getHighlightLanguage: function () { return ''; }
      , getSlideNumberFormat: function () { return '%current% / %total%'; }
      }
    , scaler = {
        dimensions: {width: 10, height: 10}
      }
    ;

  describe('background', function () {
    it('should be set from background-image slide property', function () {
      var slide = new Slide(1, {
            source: '',
            properties: {'background-image': 'url(image.jpg)'}
          });

      slideshow.slides.push(slide);
      var slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide);
      
      slideView.contentElement.style.backgroundImage.should.match(/^url\((['|"]?).*image\.jpg\1\)$/);
    });

    it('should be set by background-image slide property', function () {
      var slide = new Slide(1, {
            source: '',
            properties: {'background-color': 'red'}
          });

      slideshow.slides.push(slide);
      var slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide);

      slideView.contentElement.style.backgroundColor.should.match(/^red$/);
    });

    it('should be set from background-size slide property', function () {
      var slide = new Slide(1, {
            source: '',
            properties: {'background-size': 'cover'}
          });

      slideshow.slides.push(slide);
      var slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide);
      
      slideView.contentElement.style.backgroundSize.should.match(/^cover$/);
    });

    it('should be set from background-position slide property', function () {
      var slide = new Slide(1, {
            source: '',
            properties: {'background-position': '2% 98%'}
          });

      slideshow.slides.push(slide);
      var slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide);
      
      slideView.contentElement.style.backgroundPosition.should.match(/^2% 98%$/);
    });
  });

  describe('classes', function () {
    it('should contain "content" class by default', function () {
      var slide = new Slide(1, {source: ''});

      slideshow.slides.push(slide);
      var slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide);
      var classes = utils.getClasses(slideView.contentElement)

      classes.should.containEql('remark-slide-content');
    });

    it('should contain additional classes from slide properties', function () {
      var slide = new Slide(1, {
            source: '',
            properties: {'class': 'middle, center'}
          });

      slideshow.slides.push(slide);
      var slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide);
      var classes = utils.getClasses(slideView.contentElement)

      classes.should.containEql('remark-slide-content');
      classes.should.containEql('middle');
      classes.should.containEql('center');
    });
  });

  describe('empty paragraph removal', function () {
    it('should have empty paragraphs removed', function () {
      var slide = new Slide(1, {source: '&lt;p&gt; &lt;/p&gt;'})

      slideshow.slides.push(slide);
      var slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide);

      slideView.contentElement.innerHTML.should.not.containEql('<p></p>');
    });
  });

  describe('show slide', function () {
    it('should set the slide visible', function () {
      var slide = new Slide(1, {source: ''});

      slideshow.slides.push(slide);
      var slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide);
      slideView.show();

      var classes = utils.getClasses(slideView.containerElement);
      classes.should.containEql('remark-visible');
      classes.should.not.containEql('remark-fading');
    });

    it('should remove any fading element', function () {
      var slide = new Slide(1, {source: ''});

      slideshow.slides.push(slide);
      var slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide);

      utils.addClass(slideView.containerElement, 'remark-fading');
      slideView.show();

      var classes = utils.getClasses(slideView.containerElement);
      classes.should.containEql('remark-visible');
      classes.should.not.containEql('remark-fading');
    });
  });

  describe('hide slide', function () {
    it('should mark the slide as fading', function () {
      var slide = new Slide(1, {source: ''});

      slideshow.slides.push(slide);
      var slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide);

      utils.addClass(slideView.containerElement, 'remark-visible');
      slideView.hide();

      var classes = utils.getClasses(slideView.containerElement);
      classes.should.not.containEql('remark-visible');
      classes.should.containEql('remark-fading');
    });
  });

  describe('code line highlighting', function () {
    it('should add class to prefixed lines', function () {
      var slide = new Slide(1, { content: ['```\nline 1\n* line 2\nline 3\n```'] })
        , slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide)
        ;

      var lines = slideView.element.getElementsByClassName('remark-code-line-highlighted');

      lines.length.should.equal(1);
      lines[0].innerHTML.should.equal('  line 2');
    });

    it('should be possible to disable', function () {
      slideshow.getHighlightLines = function () { return false; };

      var slide = new Slide(1, { content: ['```\n* line\n```'] })
        , slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide)
        ;

      var lines = slideView.element.getElementsByClassName('remark-code-line');

      lines[0].innerHTML.should.equal('* line');
    });
  });

  describe('code block span highlighting', function () {
    it('should allow escaping first backtick', function () {
      var slide = new Slide(1, { content: ['```\na \\`f` b\n```'] });
      slideshow.slides.push(slide);
      var slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide);

      var lines = slideView.element.getElementsByClassName('remark-code-line');
      lines[0].innerHTML.should.equal('a `f` b');
    });

    it('should be possible to disable', function () {
      slideshow.getHighlightSpans = function () { return false; };

      var slide = new Slide(1, { content: ['```\na `f` b\n```'] });
      slideshow.slides.push(slide);
      var slideView = new SlideView(new EventEmitter(), slideshow, scaler, slide);

      var lines = slideView.element.getElementsByClassName('remark-code-line');
      lines[0].innerHTML.should.equal('a `f` b');
    });
  });
});
