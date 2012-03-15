var EventEmitter = require('events').EventEmitter
  , dispatcher = module.exports = new EventEmitter()
  , dom = require('./dom')
  ;

dispatcher.initialize = function () {
  mapKeys();
  mapTouches();
  mapWheel();
};

var mapKeys = function () {
  dom.on('keydown', function (event) {
    switch (event.keyCode) {
      case 33: // Page up
      case 37: // Left
      case 38: // Up
      case 75: // k
        gotoPreviousSlide();
        break;
      case 32: // Space
      case 34: // Page down
      case 39: // Right
      case 40: // Down
      case 74: // j
        gotoNextSlide();
        break;
    }
  });
};

var mapTouches = function () {
  var touch
    , startX
    , endX
    ;

  var isTap = function () {
    return Math.abs(startX - endX) < 10;
  };

  var handleTap = function () {
    if (endX < dom.innerWidth / 2) {
      gotoPreviousSlide();
    }
    else {
      gotoNextSlide();
    }
  };

  var handleSwipe = function () {
    if (startX > endX) {
      gotoNextSlide();
    }
    else {
      gotoPreviousSlide();
    }
  };

  dom.on('touchstart', function (event) {
    touch = event.touches[0];
    startX = touch.clientX;
  });

  dom.on('touchend', function (event) {
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

  dom.on('touchmove', function (event) {
    event.preventDefault();
  });
};

var mapWheel = function () {
  dom.on('mousewheel', function (event) {
    if (event.wheelDeltaY > 0) {
      gotoPreviousSlide();
    }
    else if (event.wheelDeltaY < 0) {
      gotoNextSlide();
    };
  });
};

var gotoNextSlide = function () {
  dispatcher.emit('nextSlide');
};

var gotoPreviousSlide = function () {
  dispatcher.emit('previousSlide');
};
