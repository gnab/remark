var sinon = require('sinon')
  , EventEmitter = require('events').EventEmitter
  , TestDom = require('../../test_dom')
  , Controller = require('../../../src/remark/controllers/defaultController')
  ;

describe('Controller', function () {
  describe('initial navigation', function () {
    it('should naviate to first slide when slideshow is embedded ', function () {
      createController({embedded: true});

      events.emit.should.be.calledWithExactly('gotoSlide', 1);
    });

    it('should naviate by hash when slideshow is not embedded', function () {
      dom.getLocationHash = function () { return '#2'; };

      createController({embedded: false});

      events.emit.should.be.calledWithExactly('gotoSlide', '2');
    });
  });

  describe('hash change', function () {
    it('should not navigate by hash when slideshow is embedded', function () {
      createController({embedded: true});

      dom.getLocationHash = function () { return '#3'; };
      events.emit('hashchange');

      events.emit.should.be.neverCalledWith('gotoSlide', '3');
    });

    it('should navigate by hash when slideshow is not embedded', function () {
      createController({embedded: false});

      dom.getLocationHash = function () { return '#3'; };
      events.emit('hashchange');

      events.emit.should.be.calledWithExactly('gotoSlide', '3');
    });
  });

  describe('keyboard navigation', function () {
    it('should navigate to previous slide when pressing page up', function () {
      events.emit('keydown', {keyCode: 33});

      events.emit.should.be.calledWithExactly('gotoPreviousSlide');
    });

    it('should navigate to previous slide when pressing arrow left', function () {
      events.emit('keydown', {keyCode: 37});

      events.emit.should.be.calledWithExactly('gotoPreviousSlide');
    });

    it('should navigate to previous slide when pressing arrow up', function () {
      events.emit('keydown', {keyCode: 38});

      events.emit.should.be.calledWithExactly('gotoPreviousSlide');
    });

    it('should navigate to next slide when pressing space', function () {
      events.emit('keydown', {keyCode: 32});

      events.emit.should.be.calledWithExactly('gotoNextSlide');
    });

    it('should navigate to next slide when pressing page down', function () {
      events.emit('keydown', {keyCode: 34});

      events.emit.should.be.calledWithExactly('gotoNextSlide');
    });

    it('should navigate to next slide when pressing arrow right', function () {
      events.emit('keydown', {keyCode: 39});

      events.emit.should.be.calledWithExactly('gotoNextSlide');
    });

    it('should navigate to next slide when pressing arrow down', function () {
      events.emit('keydown', {keyCode: 39});

      events.emit.should.be.calledWithExactly('gotoNextSlide');
    });

    it('should navigate to first slide when pressing home', function () {
      events.emit('keydown', {keyCode: 36});

      events.emit.should.be.calledWithExactly('gotoFirstSlide');
    });

    it('should navigate to last slide when pressing end', function () {
      events.emit('keydown', {keyCode: 35});

      events.emit.should.be.calledWithExactly('gotoLastSlide');
    });
    
    it('should navigate to slide N when pressing N followed by return', function () {
      events.emit('keypress', {which: 49}); // 1
      events.emit('keypress', {which: 50}); // 2
      events.emit('keydown', {keyCode: 13}); // return
      
      events.emit.should.be.calledWithExactly('gotoSlide', '12');
    });

    beforeEach(function () {
      createController();
    });
  });

  describe('commands', function () {
    it('should toggle blackout mode when pressing "b"', function () {
      events.emit('keypress', {which: 98});
      events.emit.should.be.calledWithExactly('toggleBlackout');
    });

    it('should toggle mirrored mode when pressing "m"', function () {
      events.emit('keypress', {which: 109});
      events.emit.should.be.calledWithExactly('toggleMirrored');
    });

    beforeEach(function () {
      createController();
    });
  });

  describe('custom controller', function () {
    it('should do nothing when pressing page up', function () {
      events.emit('keydown', {keyCode: 33});

      events.emit.should.not.be.calledWithExactly('gotoPreviousSlide');
    });

    beforeEach(function () {
      controller = function() {};
    });
  });

  var events
    , dom
    , controller
    ;

  function createController (options) {
    options = options || {embedded: false};

    controller = new Controller(events, dom, {
      isEmbedded: function () { return options.embedded; }
    });
  }

  beforeEach(function () {
    events = new EventEmitter();
    sinon.spy(events, 'emit');

    dom = new TestDom();
  });

  afterEach(function () {
    events.emit.restore();
  });
});
