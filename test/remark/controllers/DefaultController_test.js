import sinon from 'sinon';
import EventEmitter from 'events';
import TestDom from '../../TestDom';
import Controller from '../../../src/remark/controllers/DefaultController';

describe('Controller', () => {
  describe('initial navigation', () => {
    it('should naviate to first slide when slideshow is embedded ', () => {
      createController({embedded: true});

      events.emit.should.be.calledWithExactly('gotoSlide', 1);
    });

    it('should naviate by hash when slideshow is not embedded', () => {
      dom.constructor.getLocationHash = () => { return '#2'; };

      createController({embedded: false});

      events.emit.should.be.calledWithExactly('gotoSlide', '2');
    });
  });

  describe('hash change', () => {
    it('should not navigate by hash when slideshow is embedded', () => {
      createController({embedded: true});

      dom.constructor.getLocationHash = () => { return '#3'; };
      events.emit('hashchange');

      events.emit.should.be.neverCalledWith('gotoSlide', '3');
    });

    it('should navigate by hash when slideshow is not embedded', () => {
      createController({embedded: false});

      dom.constructor.getLocationHash = () => { return '#3'; };
      events.emit('hashchange');

      events.emit.should.be.calledWithExactly('gotoSlide', '3');
    });
  });

  describe('keyboard navigation', () => {
    it('should navigate to previous slide when pressing page up', () => {
      events.emit('keydown', {keyCode: 33});

      events.emit.should.be.calledWithExactly('gotoPreviousSlide');
    });

    it('should navigate to previous slide when pressing arrow left', () => {
      events.emit('keydown', {keyCode: 37});

      events.emit.should.be.calledWithExactly('gotoPreviousSlide');
    });

    it('should not navigate to previous slide when pressing alt + arrow left', () => {
      events.emit('keydown', {keyCode: 37, altKey: true});

      events.emit.should.not.be.calledWithExactly('gotoPreviousSlide');
    });

    it('should navigate to previous slide when pressing arrow up', () => {
      events.emit('keydown', {keyCode: 38});

      events.emit.should.be.calledWithExactly('gotoPreviousSlide');
    });

    it('should navigate to next slide when pressing space', () => {
      events.emit('keydown', {keyCode: 32});

      events.emit.should.be.calledWithExactly('gotoNextSlide');
    });

    it('should navigate to previous slide when pressing shift+space', () => {
      events.emit('keydown', {keyCode: 32, shiftKey: true});

      events.emit.should.be.calledWithExactly('gotoPreviousSlide');
    });

    it('should navigate to next slide when pressing page down', () => {
      events.emit('keydown', {keyCode: 34});

      events.emit.should.be.calledWithExactly('gotoNextSlide');
    });

    it('should navigate to next slide when pressing arrow right', () => {
      events.emit('keydown', {keyCode: 39});

      events.emit.should.be.calledWithExactly('gotoNextSlide');
    });

    it('should not navigate to next slide when pressing alt + arrow right', () => {
      events.emit('keydown', {keyCode: 39, altKey: true});

      events.emit.should.not.be.calledWithExactly('gotoNextSlide');
    });

    it('should navigate to next slide when pressing arrow down', () => {
      events.emit('keydown', {keyCode: 39});

      events.emit.should.be.calledWithExactly('gotoNextSlide');
    });

    it('should navigate to first slide when pressing home', () => {
      events.emit('keydown', {keyCode: 36});

      events.emit.should.be.calledWithExactly('gotoFirstSlide');
    });

    it('should navigate to last slide when pressing end', () => {
      events.emit('keydown', {keyCode: 35});

      events.emit.should.be.calledWithExactly('gotoLastSlide');
    });

    it('should navigate to slide N when pressing N followed by return', () => {
      events.emit('keypress', {which: 49}); // 1
      events.emit('keypress', {which: 50}); // 2
      events.emit('keydown', {keyCode: 13}); // return

      events.emit.should.be.calledWithExactly('gotoSlideNumber', '12');
    });

    beforeEach(() => {
      createController();
    });
  });

  describe('commands', () => {
    it('should toggle blackout mode when pressing "b"', () => {
      events.emit('keypress', {which: 98});
      events.emit.should.be.calledWithExactly('toggleBlackout');
    });

    it('should toggle mirrored mode when pressing "m"', () => {
      events.emit('keypress', {which: 109});
      events.emit.should.be.calledWithExactly('toggleMirrored');
    });

    beforeEach(() => {
      createController();
    });
  });

  describe('custom controller', () => {
    it('should do nothing when pressing page up', () => {
      events.emit('keydown', {keyCode: 33});

      events.emit.should.not.be.calledWithExactly('gotoPreviousSlide');
    });

    beforeEach(() => {
      controller = () => {};
    });
  });

  let events;
  let dom;
  let controller;

  function createController(options) {
    options = options || {embedded: false};

    controller = new Controller(events, dom, {
      isEmbedded: () => { return options.embedded; }
    });
  }

  beforeEach(() => {
    events = new EventEmitter();
    sinon.spy(events, 'emit');

    dom = new TestDom();
  });

  afterEach(() => {
    events.emit.restore();
  });
});
