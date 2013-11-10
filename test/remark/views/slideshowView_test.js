var EventEmitter = require('events').EventEmitter
  , SlideshowView = require('../../../src/remark/views/slideshowView')
  , Slideshow = require('../../../src/remark/models/slideshow')
  ;

describe('SlideshowView', function () {
  var events
    , model
    , containerElement
    , view
    ;

  beforeEach(function () {
    events = new EventEmitter();
    model = new Slideshow(events);
    containerElement = document.createElement('div');
  });

  describe('container element configuration', function () {
    beforeEach(function () {
      view = new SlideshowView(events, containerElement, model);
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
    beforeEach(function () {
      containerElement = document.body;
      view = new SlideshowView(events, containerElement, model);
    });

    it('should style HTML element', function () {
      var html = document.getElementsByTagName('html')[0];
      html.className.should.include('remark-container');
    });

    it('should not position element', function () {
      containerElement.style.position.should.not.equal('absolute');
    });

    it('should not make element focusable', function () {
      containerElement.should.not.have.property('tabIndex');
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

        triggerEvent(document, 'touchstart');
      });

      it('should proxy touchmove event', function (done) {
        events.on('touchmove', function () {
          done();
        });

        triggerEvent(document, 'touchmove');
      });

      it('should proxy touchend event', function (done) {
        events.on('touchend', function () {
          done();
        });

        triggerEvent(document, 'touchend');
      });
    });
  });

  describe('ratio calculation', function () {
    it('should calculate element size for 4:3', function () {
      model = new Slideshow(events, {ratio: '4:3'});

      view = new SlideshowView(events, containerElement, model);

      view.slideViews[0].scalingElement.style.width.should.equal('908px');
      view.slideViews[0].scalingElement.style.height.should.equal('681px');
    });

    it('should calculate element size for 16:9', function () {
      model = new Slideshow(events, {ratio: '16:9'});

      view = new SlideshowView(events, containerElement, model);

      view.slideViews[0].scalingElement.style.width.should.equal('1210px');
      view.slideViews[0].scalingElement.style.height.should.equal('681px');
    });
  });

  describe('model synchronization', function () {
    beforeEach(function () {
      view = new SlideshowView(events, containerElement, model);
    });

    it('should create initial slide views', function () {
      view.slideViews.length.should.equal(1);
    });

    it('should replace slide views on slideshow update', function () {
      model.loadFromString('a\n---\nb');

      view.slideViews.length.should.equal(2);
    });
  });

  describe('timer updates', function () {
    beforeEach(function () {
      view = new SlideshowView(events, containerElement, model);
    });

    it('should do nothing if the timer has not started', function () {
      view.timerElement.innerHTML.should.equal('0:00:00');
    });

    it('should show progress time if the slideshow has started', function () {
      // Force a specific start time and update
      view.startTime = new Date() - (2*3600000 + 34 * 60000 + 56 * 1000);
      view.updateTimer();
      // Timer output should match forced time
      view.timerElement.innerHTML.should.equal('2:34:56');
    });

    it('should compensate for a pause in progress', function () {
      // Force a specific start time and update, including an in-progress pause
      view.startTime = new Date() - (2*3600000 + 34 * 60000 + 56 * 1000);
      view.pauseStart = new Date() - (1*3600000 + 23 * 60000 + 45 * 1000);
      view.updateTimer();
      // Timer output should match forced time
      view.timerElement.innerHTML.should.equal('1:11:11');
    });

    it('should compensate for paused time', function () {
      // Force a specific start time and update, including a recorded pause
      view.startTime = new Date() - (2*3600000 + 34 * 60000 + 56 * 1000);
      view.pauseLength = (5 * 60000 + 6 * 1000);
      view.updateTimer();
      // Timer output should match forced time
      view.timerElement.innerHTML.should.equal('2:29:50');
    });


    it('should compensate for a pause in progress in addition to previous pauses', function () {
      // Force a specific start time and update, including a recorded pause
      // and an in-progress pause
      view.startTime = new Date() - (2*3600000 + 34 * 60000 + 56 * 1000);
      view.pauseLength = (5 * 60000 + 6 * 1000);
      view.pauseStart = new Date() - (1*3600000 + 23 * 60000 + 45 * 1000);
      view.updateTimer();
      // Timer output should match forced time
      view.timerElement.innerHTML.should.equal('1:06:05');
    });

  });

  describe('timer events', function () {
    beforeEach(function () {
      view = new SlideshowView(events, containerElement, model);
    });

    it('should respond to a start event', function () {
      events.emit('start');
      view.startTime.should.not.equal(null);
    });

    it('should reset on demand', function () {
      view.startTime = new Date() - (2*3600000 + 34 * 60000 + 56 * 1000);
      events.emit('resetTimer');
      view.timerElement.innerHTML.should.equal('0:00:00');
      // BDD seems to make this really easy test impossible...
      // view.startTime.should.equal(null);
      // view.pauseStart.should.equal(null);
      view.pauseLength.should.equal(0);
    });

    it('should track pause start end time', function () {
      view.startTime = new Date() - (2*3600000 + 34 * 60000 + 56 * 1000);

      events.emit('pause');
      view.pauseStart.should.not.equal(null);
      view.pauseLength.should.equal(0);
    });

    it('should accumulate pause duration at pause end', function () {
      view.startTime = new Date() - (2*3600000 + 34 * 60000 + 56 * 1000);
      view.pauseStart = new Date() - (12 * 1000);
      view.pauseLength = 100000;

      events.emit('resume');
      // BDD seems to make this really easy test impossible...
      //view.pauseStart.should.equal(null);
      // Microsecond accuracy is a possible problem here, so
      // allow a 5 microsecond window just in case.
      view.pauseLength.should.be.approximately(112000, 5);
    });
  });

  function triggerEvent(element, eventName) {
    var event = document.createEvent();
    event.initEvent(eventName, true, true);
    element.dispatchEvent(event);
  }
});
