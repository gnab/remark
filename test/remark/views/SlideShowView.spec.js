import EventEmitter from 'events';
import SlideShowView from '../../../src/remark/views/SlideShowView';
import SlideShow from '../../../src/remark/models/SlideShow';
import {hasClass, addClass} from '../../../src/remark/utils';
import Dom from '../../../src/remark/Dom';
import sinon from 'sinon';

describe('SlideShowView', () => {
  let events;
  let model;
  let containerElement;
  let view;

  beforeEach(() => {
    events = new EventEmitter();
    model = new SlideShow(events);
    containerElement = document.createElement('div');
  });

  describe('container element configuration', () => {
    beforeEach(() => {
      view = new SlideShowView(events, containerElement, model);
    });

    it('should style element', () => {
      containerElement.className.should.containEql('remark-container');
    });

    it('should position element', () => {
      containerElement.style.position.should.equal('absolute');
    });

    it('should make element focusable', () => {
      containerElement.tabIndex.should.equal(-1);
    });

    describe('proxying of element events', () => {
      it('should proxy keydown event', (done) => {
        events.on('keydown', () => {
          done();
        });

        triggerEvent(containerElement, 'keydown');
      });

      it('should proxy keypress event', (done) => {
        events.on('keypress', () => {
          done();
        });

        triggerEvent(containerElement, 'keypress');
      });

      it('should proxy mousewheel event', (done) => {
        events.on('mousewheel', () => {
          done();
        });

        triggerEvent(containerElement, 'mousewheel');
      });

      it('should proxy touchstart event', (done) => {
        events.on('touchstart', () => {
          done();
        });

        triggerEvent(containerElement, 'touchstart');
      });

      it('should proxy touchmove event', (done) => {
        events.on('touchmove', () => {
          done();
        });

        triggerEvent(containerElement, 'touchmove');
      });

      it('should proxy touchend event', (done) => {
        events.on('touchend', () => {
          done();
        });

        triggerEvent(containerElement, 'touchend');
      });
    });
  });

  describe('document.body container element configuration', () => {
    let body;
    let html = document.createElement('html');
    let getBodyElement = sinon.stub(Dom, 'getBodyElement');
    getBodyElement.callsFake(() => {
      return body;
    });

    let getHTMLElement = sinon.stub(Dom, 'getHTMLElement');
    getHTMLElement.callsFake(() => {
      return html;
    });

    beforeEach(() => {
      body = document.createElement('body');
      containerElement = body;
      view = new SlideShowView(events, containerElement, model);
    });

    it('should style HTML element', () => {
      html.className.should.containEql('remark-container');
    });

    it('should not position element', () => {
      containerElement.style.position.should.not.equal('absolute');
    });

    describe('proxying of element events', () => {
      it('should proxy resize event', (done) => {
        events.on('resize', () => {
          done();
        });

        triggerEvent(window, 'resize');
      });

      it('should proxy hashchange event', (done) => {
        events.on('hashchange', () => {
          done();
        });

        triggerEvent(window, 'hashchange');
      });

      it('should proxy keydown event', (done) => {
        events.on('keydown', () => {
          done();
        });

        triggerEvent(window, 'keydown');
      });

      it('should proxy keypress event', (done) => {
        events.on('keypress', () => {
          done();
        });

        triggerEvent(window, 'keypress');
      });

      it('should proxy mousewheel event', (done) => {
        events.on('mousewheel', () => {
          done();
        });

        triggerEvent(window, 'mousewheel');
      });

      it('should proxy touchstart event', (done) => {
        events.on('touchstart', () => {
          done();
        });

        triggerEvent(body, 'touchstart');
      });

      it('should proxy touchmove event', (done) => {
        events.on('touchmove', () => {
          done();
        });

        triggerEvent(body, 'touchmove');
      });

      it('should proxy touchend event', (done) => {
        events.on('touchend', () => {
          done();
        });

        triggerEvent(body, 'touchend');
      });
    });
  });

  describe('ratio calculation', () => {
    it('should calculate element size for 4:3', () => {
      model = new SlideShow(events, {ratio: '4:3'});
      view = new SlideShowView(events, containerElement, model);

      view.slideViews[0].scalingElement.style.width.should.equal('908px');
      view.slideViews[0].scalingElement.style.height.should.equal('681px');
    });

    it('should calculate element size for 16:9', () => {
      model = new SlideShow(events, {ratio: '16:9'});
      view = new SlideShowView(events, containerElement, model);

      view.slideViews[0].scalingElement.style.width.should.equal('1210px');
      view.slideViews[0].scalingElement.style.height.should.equal('681px');
    });
  });

  describe('model synchronization', () => {
    beforeEach(() => {
      view = new SlideShowView(events, containerElement, model);
    });

    it('should create initial slide views', () => {
      view.slideViews.length.should.equal(1);
    });

    it('should replace slide views on slideshow update', () => {
      model.loadFromString('a\n---\nb');

      view.slideViews.length.should.equal(2);
    });
  });

  describe('modes', () => {
    beforeEach(() => {
      view = new SlideShowView(events, containerElement, model);
    });

    it('should toggle blackout on event', () => {
      events.emit('toggleBlackout');

      hasClass(containerElement, 'remark-container--blackout-mode').should.equal(true);
    });

    it('should leave blackout mode on event', () => {
      addClass(containerElement, 'remark-container--blackout-mode');
      events.emit('hideOverlay');

      hasClass(containerElement, 'remark-container--blackout-mode').should.equal(false);
    });

    it('should toggle mirrored on event', () => {
      events.emit('toggleMirrored');

      hasClass(containerElement, 'remark-container--mirrored-mode').should.equal(true);
    });

    it('should leave toggle mirrored on event', () => {
      addClass(containerElement, 'remark-container--mirrored-mode');
      events.emit('toggleMirrored');

      hasClass(containerElement, 'remark-container--mirrored-mode').should.equal(false);
    });
  });

  function triggerEvent(element, eventName) {
    let event = document.createEvent('HTMLEvents');
    event.initEvent(eventName, true, true);
    element.dispatchEvent(event);
  }
});
