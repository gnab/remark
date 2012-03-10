var EventEmitter = require('events').EventEmitter
  , dispatcher = module.exports = new EventEmitter()
  ;

dispatcher.create = function () {
  mapKeys();
  mapTouches();
  mapWheel();
};

var mapKeys = function () {
  window.onkeydown = function (event) {
    switch (event.keyCode) {
      case 33:
      case 37:
      case 38:
      case 75:
        gotoPreviousSlide();
        break;
      case 32:
      case 34:
      case 39:
      case 40:
      case 74:
        gotoNextSlide();
        break;
    }
  };
};

var mapTouches = function () {
  var width = window.innerWidth
    , touch
    , startX
    , endX
    ;

  var isTap = function () {
    return Math.abs(startX - endX) < 10;
  };

  var handleTap = function () {
    if (endX < width / 2) {
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

  document.addEventListener('touchstart', function (event) {
    touch = event.touches[0];
    startX = touch.clientX;
  });

  document.addEventListener('touchend', function (event) {
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

  document.addEventListener('touchmove', function (event) {
    event.preventDefault();
  });
};

var mapWheel = function () {
  document.addEventListener('mousewheel', function (event) {
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
