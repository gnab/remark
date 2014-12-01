var EventEmitter = require('events').EventEmitter
  , TestDom = require('../../test_dom')
  , SlideshowView = require('../../../src/remark/views/slideshowView')
  , Slideshow = require('../../../src/remark/models/slideshow')
  , utils = require('../../../src/remark/utils')
  ;

describe('SlideshowView', function () {
  var events
    , dom
    , model
    , containerElement
    , view
    ;

  beforeEach(function () {
    events = new EventEmitter();
    dom = new TestDom();
    model = new Slideshow(events);
    containerElement = document.createElement('div');
  });

  describe('container element configuration', function () {
    beforeEach(function () {
      view = new SlideshowView(events, dom, containerElement, model);
    });

    it('should style element', function () {
      containerElement.className.should.include('remark-container');
    });

    it('should position element', function () {
      containerElement.style.position.should.equal('absolute');
    });

    it('should make element focusable', function () {
      containerElement.tabIndex.should.equal(-1);
    });

    describe('proxying of element events', function () {
      it('should proxy keydown event', function (done) {
        events.on('keydown', function () {
          done();
        });

        triggerEvent(containerElement, 'keydown');
      });

      it('should proxy keypress event', function (done) {
        events.on('keypress', function () {
          done();
        });

        triggerEvent(containerElement, 'keypress');
      });

      it('should proxy mousewheel event', function (done) {
        events.on('mousewheel', function () {
          done();
        });

        triggerEvent(containerElement, 'mousewheel');
      });

      it('should proxy touchstart event', function (done) {
        events.on('touchstart', function () {
          done();
        });

        triggerEvent(containerElement, 'touchstart');
      });

      it('should proxy touchmove event', function (done) {
        events.on('touchmove', function () {
          done();
        });

        triggerEvent(containerElement, 'touchmove');
      });

      it('should proxy touchend event', function (done) {
        events.on('touchend', function () {
          done();
        });

        triggerEvent(containerElement, 'touchend');
      });
    });
  });

  describe('document.body container element configuration', function () {
    var body;

    beforeEach(function () {
      body = dom.getBodyElement();
      containerElement = body;
      view = new SlideshowView(events, dom, containerElement, model);
    });

    it('should style HTML element', function () {
      dom.getHTMLElement().className.should.include('remark-container');
    });

    it('should not position element', function () {
      containerElement.style.position.should.not.equal('absolute');
    });

    describe('proxying of element events', function () {
      it('should proxy resize event', function (done) {
        events.on('resize', function () {
          done();
        });

        triggerEvent(window, 'resize');
      });

      it('should proxy hashchange event', function (done) {
        events.on('hashchange', function () {
          done();
        });

        triggerEvent(window, 'hashchange');
      });

      it('should proxy keydown event', function (done) {
        events.on('keydown', function () {
          done();
        });

        triggerEvent(window, 'keydown');
      });

      it('should proxy keypress event', function (done) {
        events.on('keypress', function () {
          done();
        });

        triggerEvent(window, 'keypress');
      });

      it('should proxy mousewheel event', function (done) {
        events.on('mousewheel', function () {
          done();
        });

        triggerEvent(window, 'mousewheel');
      });

      it('should proxy touchstart event', function (done) {
        events.on('touchstart', function () {
          done();
        });

        triggerEvent(body, 'touchstart');
      });

      it('should proxy touchmove event', function (done) {
        events.on('touchmove', function () {
          done();
        });

        triggerEvent(body, 'touchmove');
      });

      it('should proxy touchend event', function (done) {
        events.on('touchend', function () {
          done();
        });

        triggerEvent(body, 'touchend');
      });
    });
  });

  describe('ratio calculation', function () {
    it('should calculate element size for 4:3', function () {
      model = new Slideshow(events, {ratio: '4:3'});

      view = new SlideshowView(events, dom, containerElement, model);

      view.slideViews[0].scalingElement.style.width.should.equal('908px');
      view.slideViews[0].scalingElement.style.height.should.equal('681px');
    });

    it('should calculate element size for 16:9', function () {
      model = new Slideshow(events, {ratio: '16:9'});

      view = new SlideshowView(events, dom, containerElement, model);

      view.slideViews[0].scalingElement.style.width.should.equal('1210px');
      view.slideViews[0].scalingElement.style.height.should.equal('681px');
    });
  });

  describe('model synchronization', function () {
    beforeEach(function () {
      view = new SlideshowView(events, dom, containerElement, model);
    });

    it('should create initial slide views', function () {
      view.slideViews.length.should.equal(1);
    });

    it('should replace slide views on slideshow update', function () {
      model.loadFromString('a\n---\nb');

      view.slideViews.length.should.equal(2);
    });
  });

  describe('modes', function () {
    beforeEach(function () {
      view = new SlideshowView(events, dom, containerElement, model);
    });

    it('should toggle blackout on event', function () {
      events.emit('toggleBlackout');

      utils.hasClass(containerElement, 'remark-blackout-mode').should.equal(true);
    });

    it('should leave blackout mode on event', function () {
      utils.addClass(containerElement, 'remark-blackout-mode');
      events.emit('hideOverlay');

      utils.hasClass(containerElement, 'remark-blackout-mode').should.equal(false);
    });

    it('should toggle mirrored on event', function () {
      events.emit('toggleMirrored');

      utils.hasClass(containerElement, 'remark-mirrored-mode').should.equal(true);
    });

    it('should leave toggle mirrored on event', function () {
      utils.addClass(containerElement, 'remark-mirrored-mode');
      events.emit('toggleMirrored');

      utils.hasClass(containerElement, 'remark-mirrored-mode').should.equal(false);
    });

  });

  function triggerEvent(element, eventName) {
    var event = document.createEvent('HTMLEvents');
    event.initEvent(eventName, true, true);
    element.dispatchEvent(event);
  }
});
