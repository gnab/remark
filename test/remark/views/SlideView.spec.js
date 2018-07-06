let EventEmitter = require('events').EventEmitter;
import Slide from '../../../src/remark/models/Slide';
import SlideView from '../../../src/remark/views/SlideView';
import { getClasses, addClass } from '../../../src/remark/utils';

describe('SlideView', () => {
  let slideShow = {
    slides: [],
    getOptions: function () {
      return {
        highlightStyle: 'default',
        highlightLines: true,
        highlightSpans: true,
        highlightLanguage: '',
        slideNumberFormat: '%current% / %total%',
        highlightInlineCode: false
      }
    },
    getLinks: () => ({}),
    getSlides: function () {
      return this.slides;
    }
  };
  let scaler = {
    dimensions: {width: 10, height: 10}
  };

  describe('background', () => {
    it('should be set from background-image slide property', () => {
      let slide = new Slide(1, 1, {
        source: '',
        properties: {'background-image': 'url(image.jpg)'}
      });

      slideShow.slides.push(slide);
      let slideView = new SlideView(new EventEmitter(), slideShow, scaler, slide);

      slideView.contentElement.style.backgroundImage.should.match(/^url\((['|"]?).*image\.jpg\1\)$/);
    });

    it('should be set by background-image slide property', () => {
      let slide = new Slide(1, 1, {
        source: '',
        properties: {'background-color': 'red'}
      });

      slideShow.slides.push(slide);
      let slideView = new SlideView(new EventEmitter(), slideShow, scaler, slide);

      slideView.contentElement.style.backgroundColor.should.match(/^red$/);
    });

    it('should be set from background-size slide property', () => {
      let slide = new Slide(1, 1, {
        source: '',
        properties: {'background-size': 'cover'}
      });

      slideShow.slides.push(slide);
      let slideView = new SlideView(new EventEmitter(), slideShow, scaler, slide);

      slideView.contentElement.style.backgroundSize.should.match(/^cover$/);
    });

    it('should be set from background-position slide property', () => {
      let slide = new Slide(1, 1, {
        source: '',
        properties: {'background-position': '2% 98%'}
      });

      slideShow.slides.push(slide);
      let slideView = new SlideView(new EventEmitter(), slideShow, scaler, slide);

      slideView.contentElement.style.backgroundPosition.should.match(/^2% 98%$/);
    });
  });

  describe('classes', () => {
    it('should contain "content" class by default', () => {
      let slide = new Slide(1, 1, {source: ''});

      slideShow.slides.push(slide);
      let slideView = new SlideView(new EventEmitter(), slideShow, scaler, slide);
      let classes = getClasses(slideView.contentElement);

      classes.should.containEql('remark-slide__content');
    });

    it('should contain additional classes from slide properties', () => {
      let slide = new Slide(1, 1, {
        source: '',
        properties: {'class': 'middle, center'}
      });

      slideShow.slides.push(slide);
      let slideView = new SlideView(new EventEmitter(), slideShow, scaler, slide);
      let classes = getClasses(slideView.contentElement);

      classes.should.containEql('remark-slide__content');
      classes.should.containEql('middle');
      classes.should.containEql('center');
    });

    it('should set remark-slide-incremental class for incremental slides', () => {
      let slide = new Slide(2, 2, {
        source: '',
        properties: {'continued': 'true'}
      });

      slideShow.slides.push(slide);
      let slideView = new SlideView(new EventEmitter(), slideShow, scaler, slide);
      let classes = getClasses(slideView.element);

      classes.should.containEql('remark-slide-container--incremental');
    });
  });

  describe('empty paragraph removal', () => {
    it('should have empty paragraphs removed', () => {
      let slide = new Slide(1, 1, {source: '&lt;p&gt; &lt;/p&gt;'});

      slideShow.slides.push(slide);
      let slideView = new SlideView(new EventEmitter(), slideShow, scaler, slide);

      slideView.contentElement.innerHTML.should.not.containEql('<p></p>');
    });
  });

  describe('show slide', () => {
    it('should set the slide visible', () => {
      let slide = new Slide(1, 1, {source: ''});

      slideShow.slides.push(slide);
      let slideView = new SlideView(new EventEmitter(), slideShow, scaler, slide);
      slideView.show();

      let classes = getClasses(slideView.containerElement);
      classes.should.containEql('remark-slide-container--visible');
    });

    it('should remove any fading element', () => {
      let slide = new Slide(1, 1, {source: ''});

      slideShow.slides.push(slide);
      let slideView = new SlideView(new EventEmitter(), slideShow, scaler, slide);
      
      slideView.show();

      let classes = getClasses(slideView.containerElement);
      classes.should.containEql('remark-slide-container--visible');
    });
  });

  describe('hide slide', () => {
    it('should mark the slide as fading', () => {
      let slide = new Slide(1, 1, {source: ''});

      slideShow.slides.push(slide);
      let slideView = new SlideView(new EventEmitter(), slideShow, scaler, slide);

      addClass(slideView.containerElement, 'remark-slide-container--visible');
      slideView.hide();

      let classes = getClasses(slideView.containerElement);
      classes.should.not.containEql('remark-slide-container--visible');
    });
  });

  describe('code line highlighting', () => {
    it('should add class to prefixed lines', () => {
      let slide = new Slide(1, 1, { content: ['```\nline 1\n* line 2\nline 3\n```'] });
      let slideView = new SlideView(new EventEmitter(), slideShow, scaler, slide);
      let lines = slideView.element.getElementsByClassName('remark-code__line--highlighted');

      lines.length.should.equal(1);
      lines[0].innerHTML.should.equal('  line 2');
    });

    it('should be possible to disable', () => {
      let currentOptions = slideShow.getOptions();
      slideShow.getOptions = () => ({ ...currentOptions, highlightLines: false });

      let slide = new Slide(1, 1, { content: ['```\n* line\n```'] });
      let slideView = new SlideView(new EventEmitter(), slideShow, scaler, slide);
      let lines = slideView.element.getElementsByClassName('remark-code__line');

      lines[0].innerHTML.should.equal('* line');
    });
  });

  describe('code block span highlighting', () => {
    it('should allow escaping first backtick', () => {
      let slide = new Slide(1, 1, { content: ['```\na \\`f` b\n```'] });
      slideShow.slides.push(slide);
      let slideView = new SlideView(new EventEmitter(), slideShow, scaler, slide);

      let lines = slideView.element.getElementsByClassName('remark-code__line');
      lines[0].innerHTML.should.equal('a `f` b');
    });

    it('should allow custom delimiters', () => {
      let currentOptions = slideShow.getOptions();
      slideShow.getOptions = () => ({ ...currentOptions, highlightSpans: /«([^»]+?)»/g });

      let slide = new Slide(1, 1, { content: ['```\na «f» b\n```'] });
      slideShow.slides.push(slide);
      let slideView = new SlideView(new EventEmitter(), slideShow, scaler, slide);

      let lines = slideView.element.getElementsByClassName('remark-code__line');
      lines[0].innerHTML.should.equal('a <span class="remark-code__span--highlighted">f</span> b');
    });

    it('should allow escaping opening custom delimiter', () => {
      let currentOptions = slideShow.getOptions();
      slideShow.getOptions = () => ({ ...currentOptions, highlightSpans: /«([^»]+?)»/g });

      let slide = new Slide(1, 1, { content: ['```\na \\«f» b\n```'] });
      slideShow.slides.push(slide);
      let slideView = new SlideView(new EventEmitter(), slideShow, scaler, slide);

      let lines = slideView.element.getElementsByClassName('remark-code__line');
      lines[0].innerHTML.should.equal('a «f» b');
    });

    it('should be possible to disable', () => {
      let currentOptions = slideShow.getOptions();
      slideShow.getOptions = () => ({ ...currentOptions, highlightSpans: false });

      let slide = new Slide(1, 1, { content: ['```\na `f` b\n```'] });
      slideShow.slides.push(slide);
      let slideView = new SlideView(new EventEmitter(), slideShow, scaler, slide);

      let lines = slideView.element.getElementsByClassName('remark-code__line');
      lines[0].innerHTML.should.equal('a `f` b');
    });
  });
});
