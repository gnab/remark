module.exports = Controller;

function Controller (events, slideshowView) {
  var self = this;

  self.events = events;
  self.slideshowView = slideshowView;

  self.started = false;
  // When paused, no events will be processed
  self.paused = true;

  self.addApiEventListeners();
  self.addNavigationEventListeners();
  self.addKeyboardEventListeners();
  self.addMouseEventListeners();
  self.addTouchEventListeners();
}

Controller.prototype.addApiEventListeners = function () {
  var self = this
    , events = self.events
    ;

  events.on('pause', function () {
    self.paused = true;
  });

  events.on('resume', function () {
    if (!self.paused) {
      return;
    }

    self.paused = false;

    if (self.started) {
      return;
    }

    if (self.slideshowView.isEmbedded()) {
      events.emit('gotoSlide', 1);
    }
    else {
      self.navigateByHash();
    }

    self.started = true;
  });
};

Controller.prototype.addNavigationEventListeners = function () {
  var self = this
    , events = self.events
    ;

  if (!self.slideshowView.isEmbedded()) {
    events.on('hashchange', function () {
      if (self.paused) return;
      self.navigateByHash();
    });
    events.on('slideChanged', function (slideNoOrName) {
      window.location.hash = '#' + slideNoOrName;
    });
  }

  events.on('message', function (message) {
    var cap;

    if ((cap = /^gotoSlide:(\d+)$/.exec(message.data)) !== null) {
      events.emit('gotoSlide', parseInt(cap[1], 10));
    }
  });
};

Controller.prototype.navigateByHash = function () {
  var self = this
    , slideNoOrName = (window.location.hash || '').substr(1)
    ;

  self.events.emit('gotoSlide', slideNoOrName);
};

Controller.prototype.addKeyboardEventListeners = function () {
  var self = this
    , events = self.events
    ;

  events.on('keydown', function (event) {
    if (self.paused) return;
    switch (event.keyCode) {
      case 33: // Page up
      case 37: // Left
      case 38: // Up
        events.emit('backward');
        break;
      case 32: // Space
      case 34: // Page down
      case 39: // Right
      case 40: // Down
        events.emit('forward');
        break;
      case 36: // Home
        events.emit('gotoFirstSlide');
        break;
      case 35: // End
        events.emit('gotoLastSlide');
        break;
    }
  });

  events.on('keypress', function (event) {
    if (event.metaKey || event.ctrlKey) {
      // Bail out if meta or ctrl key was pressed
      return;
    }

    switch (String.fromCharCode(event.which)) {
      case 'j':
        if (self.paused) return;
        events.emit('forward');
        break;
      case 'k':
        if (self.paused) return;
        events.emit('backward');
        break;
      case 'c':
        events.emit('createClone');
        break;
      case 'p':
        events.emit('togglePresenterMode');
        break;
      case 'f':
        events.emit('toggleFullscreen');
        break;
      case '?':
        events.emit('toggleHelp');
        break;
    }
  });
};

Controller.prototype.addMouseEventListeners = function () {
  var self = this
    , events = self.events
    ;

  events.on('mousewheel', function (event) {
    if (self.paused) return;

    if (event.wheelDeltaY > 0) {
      events.emit('backward');
    }
    else if (event.wheelDeltaY < 0) {
      events.emit('forward');
    }
  });
};

Controller.prototype.addTouchEventListeners = function () {
  var self = this
    , events = self.events
    , touch
    , startX
    , endX
    ;

  var isTap = function () {
    return Math.abs(startX - endX) < 10;
  };

  var handleTap = function () {
    if (self.paused) return;

    events.emit('tap', endX);
  };

  var handleSwipe = function () {
    if (self.paused) return;

    if (startX > endX) {
      events.emit('forward');
    }
    else {
      events.emit('backward');
    }
  };

  events.on('touchstart', function (event) {
    touch = event.touches[0];
    startX = touch.clientX;
  });

  events.on('touchend', function (event) {
    if (event.target.nodeName.toUpperCase() === 'A') {
      return;
    }

    touch = event.changedTouches[0];
    endX = touch.clientX;

    if (isTap()) {
      handleTap();
    }
    else {
      handleSwipe();
    }
  });

  events.on('touchmove', function (event) {
    event.preventDefault();
  });
};
